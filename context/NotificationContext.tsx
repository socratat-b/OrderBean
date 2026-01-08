"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order_update" | "payment" | "info" | "success" | "error";
  timestamp: number;
  read: boolean;
  orderId?: string;
  userId?: string; // Added to track which user owns this notification
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    title: string,
    message: string,
    type: Notification["type"],
    orderId?: string
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
  unreadCount: number;
  setCurrentUser: (userId: string | null) => void; // Added to handle user changes
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const MAX_NOTIFICATIONS = 50; // Keep last 50 notifications

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Get per-user localStorage key
  const getStorageKey = useCallback((userId: string | null) => {
    return userId ? `notifications-${userId}` : null;
  }, []);

  // Load notifications for current user
  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true);
      return;
    }

    const storageKey = getStorageKey(currentUserId);
    if (!storageKey) {
      // No user logged in, clear notifications
      setNotifications([]);
      return;
    }

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
        console.log(`[Notifications] Loaded ${JSON.parse(stored).length} notifications for user ${currentUserId}`);
      } catch (error) {
        console.error("Error loading notifications:", error);
        setNotifications([]);
      }
    } else {
      // No stored notifications for this user
      setNotifications([]);
    }
  }, [currentUserId, isHydrated, getStorageKey]);

  // Save to localStorage whenever notifications change
  useEffect(() => {
    if (!isHydrated || !currentUserId) return;

    const storageKey = getStorageKey(currentUserId);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(notifications));
      console.log(`[Notifications] Saved ${notifications.length} notifications for user ${currentUserId}`);
    }
  }, [notifications, currentUserId, isHydrated, getStorageKey]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (
      title: string,
      message: string,
      type: Notification["type"],
      orderId?: string
    ) => {
      if (!currentUserId) {
        console.warn("[Notifications] Cannot add notification - no user logged in");
        return;
      }

      const newNotification: Notification = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title,
        message,
        type,
        timestamp: Date.now(),
        read: false,
        orderId,
        userId: currentUserId, // Store which user this notification belongs to
      };

      console.log(`[Notifications] Adding notification for user ${currentUserId}:`, newNotification);

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        // Keep only last MAX_NOTIFICATIONS
        return updated.slice(0, MAX_NOTIFICATIONS);
      });
    },
    [currentUserId]
  );

  const setCurrentUser = useCallback((userId: string | null) => {
    console.log(`[Notifications] User changed: ${currentUserId} → ${userId}`);
    setCurrentUserId(userId);
  }, [currentUserId]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        removeNotification,
        unreadCount,
        setCurrentUser,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
