import { NextRequest } from "next/server";
import { getSession } from "@/lib/dal";
import { redis, REDIS_CHANNELS } from "@/lib/redis";

export const dynamic = "force-dynamic";

/**
 * SSE endpoint for customers to receive real-time updates for all their orders
 * GET /api/sse/orders/user/[userId]
 *
 * Uses Redis Streams for cross-instance communication on Vercel
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
  let lastId = '$'; // Start from latest messages

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(
          `data: ${JSON.stringify({ type: "connected", userId })}\n\n`
        )
      );

      // Poll Redis streams for new messages
      const pollInterval = setInterval(async () => {
        try {
          // Read from multiple streams
          const results = await redis.xread(
            [REDIS_CHANNELS.ORDER_CREATED, REDIS_CHANNELS.ORDER_STATUS_CHANGED],
            [lastId, lastId],
            { count: 10, blockMS: 1000 }
          );

          if (results && Array.isArray(results)) {
            for (const [streamName, messages] of results as [string, [string, string[]][]][]) {
              for (const [messageId, fields] of messages) {
                // Update last ID
                lastId = messageId;

                // Parse the event data
                const eventData = Array.isArray(fields) ? Object.fromEntries(
                  fields.reduce((acc: any[], field: any, i: number, arr: any[]) => {
                    if (i % 2 === 0) acc.push([field, arr[i + 1]]);
                    return acc;
                  }, [])
                ) : fields;

                // Filter: only send events for this user's orders
                if (eventData.userId !== userId) {
                  console.log(`[SSE User] Filtered out event for user ${eventData.userId} (listening for ${userId})`);
                  continue;
                }

                console.log(`[SSE User] Sending event to user ${userId}: order ${eventData.orderId}`);

                // Determine event type based on stream
                let eventType = 'order_updated';
                if (streamName === REDIS_CHANNELS.ORDER_CREATED) {
                  eventType = 'order_created';
                }

                // Send to client
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ type: eventType, ...eventData })}\n\n`)
                );
              }
            }
          }
        } catch (error) {
          console.error('[SSE User] Error polling Redis:', error);
        }
      }, 2000); // Poll every 2 seconds

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
        clearInterval(pollInterval);
        clearInterval(keepAliveInterval);
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
