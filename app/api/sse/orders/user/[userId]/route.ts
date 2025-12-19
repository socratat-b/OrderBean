import { NextRequest } from "next/server";
import { getSession } from "@/lib/dal";
import { orderEvents, ORDER_EVENTS, OrderEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

/**
 * SSE endpoint for customers to receive real-time updates for all their orders
 * GET /api/sse/orders/user/[userId]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Verify session
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Verify user can only access their own orders (unless staff/owner)
  if (session.role === "CUSTOMER" && session.userId !== userId) {
    return new Response("Forbidden", { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "connected", userId })}\n\n`
        )
      );

      // Handler for order updates
      const handleOrderUpdate = (event: OrderEvent) => {
        // Only send updates for this user's orders
        if (event.userId === userId) {
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "order_updated", ...event })}\n\n`
              )
            );
          } catch (error) {
            console.error("Error sending SSE message:", error);
          }
        }
      };

      // Handler for order creation
      const handleOrderCreated = (event: OrderEvent) => {
        // Only send updates for this user's orders
        if (event.userId === userId) {
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "order_created", ...event })}\n\n`
              )
            );
          } catch (error) {
            console.error("Error sending SSE message:", error);
          }
        }
      };

      // Subscribe to order events
      orderEvents.on(ORDER_EVENTS.ORDER_UPDATED, handleOrderUpdate);
      orderEvents.on(ORDER_EVENTS.ORDER_STATUS_CHANGED, handleOrderUpdate);
      orderEvents.on(ORDER_EVENTS.ORDER_CREATED, handleOrderCreated);

      // Send keepalive ping every 30 seconds
      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch (error) {
          clearInterval(keepAliveInterval);
        }
      }, 30000);

      // Cleanup on disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(keepAliveInterval);
        orderEvents.off(ORDER_EVENTS.ORDER_UPDATED, handleOrderUpdate);
        orderEvents.off(ORDER_EVENTS.ORDER_STATUS_CHANGED, handleOrderUpdate);
        orderEvents.off(ORDER_EVENTS.ORDER_CREATED, handleOrderCreated);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
