"use client";

import { useEffect, useRef } from "react";
import { useNotifications } from "@/context/NotificationContext";

interface OrderUpdateEvent {
  type: "connected" | "order_updated" | "order_created";
  orderId?: string;
  userId?: string;
  status?: string;
  timestamp?: number;
}

/**
 * Hook that listens to all user's order updates via SSE
 * and automatically creates notifications
 */
export function useOrderNotifications(userId: string | null) {
  const { addNotification } = useNotifications();
  const eventSourceRef = useRef<EventSource | null>(null);
  const previousStatusRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!userId) return;

    // Create EventSource connection for all user orders
    const eventSource = new EventSource(`/api/sse/orders/user/${userId}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log(`[Notifications] Connected to order updates for user ${userId}`);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: OrderUpdateEvent = JSON.parse(event.data);
        console.log(`[Notifications] User ${userId} received:`, data);

        // Create notification for order updates
        if (data.type === "order_updated" && data.orderId && data.status) {
          const previousStatus = previousStatusRef.current[data.orderId];

          // Only notify if status actually changed (not just a refresh)
          if (previousStatus && previousStatus !== data.status) {
            const orderIdShort = data.orderId.slice(-6); // Show last 6 chars

            const statusMessages: Record<string, { title: string; message: string }> = {
              PREPARING: {
                title: "Order in Progress",
                message: `Order #${orderIdShort} is being prepared!`,
              },
              READY: {
                title: "Order Ready",
                message: `Order #${orderIdShort} is ready for pickup!`,
              },
              COMPLETED: {
                title: "Order Completed",
                message: `Order #${orderIdShort} completed. Thank you!`,
              },
              CANCELLED: {
                title: "Order Cancelled",
                message: `Order #${orderIdShort} has been cancelled.`,
              },
            };

            const notification = statusMessages[data.status];
            if (notification) {
              console.log(`[Notifications] Creating notification for user ${userId}, order ${data.orderId}`);
              addNotification(
                notification.title,
                notification.message,
                "order_update",
                data.orderId
              );
            }
          }

          // Update previous status
          previousStatusRef.current[data.orderId] = data.status;
        }

        // Create notification for new orders (after payment)
        if (data.type === "order_created" && data.orderId) {
          const orderIdShort = data.orderId.slice(-6);
          console.log(`[Notifications] Creating order placed notification for user ${userId}, order ${data.orderId}`);
          addNotification(
            "Order Placed",
            `Order #${orderIdShort} placed successfully!`,
            "payment",
            data.orderId
          );
        }
      } catch (err) {
        console.error("[Notifications] Error parsing message:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("[Notifications] Connection error:", err);
    };

    // Cleanup on unmount
    return () => {
      console.log(`[Notifications] Disconnecting from order updates`);
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [userId, addNotification]);
}
