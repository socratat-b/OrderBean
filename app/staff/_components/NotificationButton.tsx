"use client";

import { useCallback } from "react";

interface NotificationButtonProps {
  notificationsEnabled: boolean;
  onToggle: () => void;
}

export function NotificationButton({ notificationsEnabled, onToggle }: NotificationButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
        notificationsEnabled
          ? "bg-primary text-primary-foreground"
          : "bg-card text-card-foreground border border-border hover:bg-muted"
      }`}
      title={notificationsEnabled ? "Notifications enabled" : "Enable notifications"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-4 w-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
        />
      </svg>
      {notificationsEnabled && <span>ON</span>}
    </button>
  );
}
