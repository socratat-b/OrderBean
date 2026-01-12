"use client";

import type { Order } from "./types";

interface OrderCardProps {
  order: Order;
  isUpdating: boolean;
  onUpdateStatus: (orderId: string, newStatus: Order["status"]) => void;
}

export function OrderCard({ order, isUpdating, onUpdateStatus }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PREPARING": return "bg-blue-100 text-blue-800 border-blue-200";
      case "READY": return "bg-green-100 text-green-800 border-green-200";
      case "COMPLETED": return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNextStatus = (currentStatus: Order["status"]): Order["status"] | null => {
    switch (currentStatus) {
      case "PENDING": return "PREPARING";
      case "PREPARING": return "READY";
      case "READY": return "COMPLETED";
      default: return null;
    }
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="overflow-hidden rounded-xl border-2 border-border bg-card shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]">
      {/* Order Header */}
      <div className="border-b border-border bg-muted px-4 py-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-muted-foreground tracking-wider">
              ORDER #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
          </div>
          <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="border-b border-border bg-card px-4 py-4">
        <p className="text-xs font-bold text-muted-foreground tracking-wider">CUSTOMER</p>
        <p className="mt-2 font-bold text-card-foreground text-base">{order.user.name}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{order.user.email}</p>
      </div>

      {/* Order Items */}
      <div className="px-4 py-4 bg-card">
        <p className="mb-3 text-xs font-bold text-muted-foreground tracking-wider">ITEMS</p>
        <div className="space-y-3">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
              {item.product.imageUrl && (
                <img src={item.product.imageUrl} alt={item.product.name} className="h-14 w-14 rounded-lg object-cover shadow-sm" />
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-bold text-card-foreground">{item.product.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-lg font-black text-primary">{item.quantity}x</span> <span className="text-muted-foreground">•</span> <span className="font-semibold text-card-foreground">₱{item.price.toFixed(2)}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Total & Actions */}
      <div className="border-t-2 border-border bg-muted px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-bold text-muted-foreground tracking-wider">TOTAL</span>
          <span className="text-2xl font-black text-primary">₱{order.total.toFixed(2)}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          {nextStatus && (
            <button
              onClick={() => onUpdateStatus(order.id, nextStatus)}
              disabled={isUpdating}
              className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {isUpdating ? "Updating..." : `Mark ${nextStatus}`}
            </button>
          )}

          {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
            <button
              onClick={() => onUpdateStatus(order.id, "CANCELLED")}
              disabled={isUpdating}
              className="w-full md:w-auto rounded-xl border-2 border-error bg-card px-4 py-3 text-sm font-bold text-error hover:bg-error hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
