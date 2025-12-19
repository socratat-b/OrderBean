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
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const MAX_NOTIFICATIONS = 50; // Keep last 50 notifications

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem("notifications");
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading notifications:", error);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever notifications change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("notifications", JSON.stringify(notifications));
    }
  }, [notifications, isHydrated]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (
      title: string,
      message: string,
      type: Notification["type"],
      orderId?: string
    ) => {
      const newNotification: Notification = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title,
        message,
        type,
        timestamp: Date.now(),
        read: false,
        orderId,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        // Keep only last MAX_NOTIFICATIONS
        return updated.slice(0, MAX_NOTIFICATIONS);
      });
    },
    []
  );

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
