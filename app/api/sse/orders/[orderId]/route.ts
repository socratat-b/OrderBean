import { NextRequest } from 'next/server'
import { getSession } from '@/lib/dal'
import { orderEvents, ORDER_EVENTS, OrderEvent } from '@/lib/events'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * SSE endpoint for customers to receive real-time updates for their specific order
 * GET /api/sse/orders/[orderId]
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

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', orderId })}\n\n`)
      )

      // Handler for order updates
      const handleOrderUpdate = (event: OrderEvent) => {
        // Only send updates for this specific order
        if (event.orderId === orderId) {
          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'order_updated', ...event })}\n\n`)
            )
          } catch (error) {
            console.error('Error sending SSE message:', error)
          }
        }
      }

      // Subscribe to order events
      orderEvents.on(ORDER_EVENTS.ORDER_UPDATED, handleOrderUpdate)
      orderEvents.on(ORDER_EVENTS.ORDER_STATUS_CHANGED, handleOrderUpdate)

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
        clearInterval(keepAliveInterval)
        orderEvents.off(ORDER_EVENTS.ORDER_UPDATED, handleOrderUpdate)
        orderEvents.off(ORDER_EVENTS.ORDER_STATUS_CHANGED, handleOrderUpdate)
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
