"use client";

import { useOrderNotifications } from "@/hooks/useOrderNotifications";

interface NotificationListenerProps {
  userId: string | null;
}

/**
 * Component that listens to order updates and creates notifications
 * Must be mounted in a client component with user data
 */
export default function NotificationListener({
  userId,
}: NotificationListenerProps) {
  useOrderNotifications(userId);
  return null; // This component doesn't render anything
}
