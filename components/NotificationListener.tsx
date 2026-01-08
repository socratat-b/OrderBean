"use client";

import { useEffect } from "react";
import { useOrderNotifications } from "@/hooks/useOrderNotifications";
import { useNotifications } from "@/context/NotificationContext";

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
  const { setCurrentUser } = useNotifications();

  // Notify NotificationContext when user changes
  useEffect(() => {
    setCurrentUser(userId);
  }, [userId, setCurrentUser]);

  useOrderNotifications(userId);
  return null; // This component doesn't render anything
}
