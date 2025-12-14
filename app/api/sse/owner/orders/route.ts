import { NextRequest } from 'next/server'
import { getSession } from '@/lib/dal'
import { orderEvents, ORDER_EVENTS, OrderEvent } from '@/lib/events'

export const dynamic = 'force-dynamic'

/**
 * SSE endpoint for owners to receive real-time updates for all orders and analytics
 * GET /api/sse/owner/orders
 */
export async function GET(req: NextRequest) {
  // Verify session and role
  const session = await getSession()
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  if (session.role !== 'OWNER') {
    return new Response('Forbidden', { status: 403 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', role: 'OWNER' })}\n\n`)
      )

      // Handler for new orders
      const handleNewOrder = (event: OrderEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'order_created', ...event })}\n\n`)
          )
        } catch (error) {
          console.error('Error sending SSE message:', error)
        }
      }

      // Handler for order updates
      const handleOrderUpdate = (event: OrderEvent) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'order_updated', ...event })}\n\n`)
          )
        } catch (error) {
          console.error('Error sending SSE message:', error)
        }
      }

      // Subscribe to all order events
      orderEvents.on(ORDER_EVENTS.ORDER_CREATED, handleNewOrder)
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
        orderEvents.off(ORDER_EVENTS.ORDER_CREATED, handleNewOrder)
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
