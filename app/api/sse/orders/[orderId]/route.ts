import { NextRequest } from 'next/server'
import { getSession } from '@/lib/dal'
import { redis, REDIS_CHANNELS } from '@/lib/redis'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * SSE endpoint for customers to receive real-time updates for their specific order
 * GET /api/sse/orders/[orderId]
 *
 * Uses Redis Streams for cross-instance communication on Vercel
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params

  // Verify session
  const session = await getSession()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Verify order belongs to user (unless staff/owner)
  if (session.role === 'CUSTOMER') {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    })

    if (!order || order.userId !== session.userId) {
      return new Response('Forbidden', { status: 403 })
    }
  }

  const encoder = new TextEncoder()

  // Get the latest message ID from stream to start polling from there
  const getLatestId = async (streamName: string) => {
    try {
      const messages = await redis.xrevrange(streamName, '+', '-', { count: 1 })
      if (messages && messages.length > 0) {
        return Object.keys(messages[0])[0]
      }
    } catch (error) {
      console.error(`[SSE Order] Error getting latest ID from ${streamName}:`, error)
    }
    return '0-0'
  }

  let lastId = await getLatestId(REDIS_CHANNELS.ORDER_STATUS_CHANGED)

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', orderId })}\n\n`)
      )

      // Poll Redis streams for new messages
      const pollInterval = setInterval(async () => {
        try {
          // Read from status change stream only (orders don't get "created" after initial creation)
          const results = await redis.xread(
            [REDIS_CHANNELS.ORDER_STATUS_CHANGED],
            [lastId],
            { count: 10 }
          )

          if (results && Array.isArray(results)) {
            for (const [, messages] of results as [string, [string, string[]][]][]) {
              for (const [messageId, fields] of messages) {
                // Update last ID
                lastId = messageId

                // Parse the event data
                const eventData = Array.isArray(fields) ? Object.fromEntries(
                  fields.reduce((acc: any[], field: any, i: number, arr: any[]) => {
                    if (i % 2 === 0) acc.push([field, arr[i + 1]])
                    return acc
                  }, [])
                ) : fields

                // Filter: only send events for this specific order
                if (eventData.orderId !== orderId) {
                  continue
                }

                console.log(`[SSE Order] Sending update for order ${orderId}:`, eventData)

                // Send to client
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: 'order_updated', ...eventData })}\n\n`)
                )
              }
            }
          }
        } catch (error) {
          console.error('[SSE Order] Error polling Redis:', error)
        }
      }, 2000) // Poll every 2 seconds

      // Send keepalive ping every 30 seconds
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'))
        } catch (error) {
          clearInterval(keepAliveInterval)
        }
      }, 30000)

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(pollInterval)
        clearInterval(keepAliveInterval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
