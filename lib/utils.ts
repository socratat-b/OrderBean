// lib/utils.ts - Utility functions

/**
 * Get status color for order status badges
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    PREPARING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    READY: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
}

/**
 * Format date for order display
 */
export function formatOrderDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

/**
 * Get percentage change data for rendering
 */
export function getPercentageChangeData(change: number | undefined): {
  isPositive: boolean;
  value: string;
  colorClass: string;
} | null {
  if (change === undefined || change === 0) return null;

  const isPositive = change > 0;
  const colorClass = isPositive
    ? "text-green-600 dark:text-green-500"
    : "text-red-600 dark:text-red-500";

  return {
    isPositive,
    value: `${Math.abs(change).toFixed(1)}%`,
    colorClass,
  };
}

/**
 * Format currency (Philippine Peso)
 */
export function formatCurrency(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}
