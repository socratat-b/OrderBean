// app/staff/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useStaffOrdersSSE } from "@/hooks/useStaffOrdersSSE";

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

interface Order {
  id: string;
  total: number;
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
}

type OrderStatus = "ALL" | "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";

export default function StaffDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Real-time SSE callbacks
  const handleOrderCreated = useCallback(() => {
    // Refetch orders when a new order is created
    fetchOrders();
  }, []);

  const handleOrderUpdated = useCallback(() => {
    // Refetch orders when an order is updated
    fetchOrders();
  }, []);

  // Subscribe to real-time order updates
  const { isConnected, error: sseError } = useStaffOrdersSSE(
    handleOrderCreated,
    handleOrderUpdated
  );

  useEffect(() => {
    fetchOrders(true);
  }, []);

  useEffect(() => {
    // Filter orders based on selected status
    if (selectedStatus === "ALL") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === selectedStatus));
    }
  }, [selectedStatus, orders]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.custom-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

  async function fetchOrders(showLoading = false) {
    try {
      if (showLoading) {
        setInitialLoading(true);
      }
      const response = await fetch("/api/staff/orders");

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied. Staff role required.");
        }
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      if (showLoading) {
        setInitialLoading(false);
      }
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: Order["status"]) {
    try {
      setUpdatingOrderId(orderId);
      const response = await fetch(`/api/staff/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order");
      }

      const data = await response.json();

      // Update the order in the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? data.order : order
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PREPARING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "READY":
        return "bg-green-100 text-green-800 border-green-200";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      case "PENDING":
        return "PREPARING";
      case "PREPARING":
        return "READY";
      case "READY":
        return "COMPLETED";
      default:
        return null;
    }
  };

  const statusFilters: OrderStatus[] = ["ALL", "PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"];

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-error font-semibold">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-primary px-6 py-3 text-primary-foreground font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
              <p className="mt-2 text-base md:text-sm text-muted-foreground">
                Manage customer orders • <span className="text-lg md:text-base font-bold text-foreground">{orders.length}</span> total orders
              </p>
            </div>
            {/* Real-time connection indicator */}
            <div className="hidden md:flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isConnected ? 'Live updates' : 'Connecting...'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Filter - Mobile (Custom Dropdown) */}
        <div className="mb-6 md:hidden">
          <label className="block text-sm font-semibold text-foreground mb-3">
            Filter by Status
          </label>
          <div className="relative custom-dropdown">
            {/* Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full rounded-xl border-2 border-border bg-card px-4 py-3.5 text-left text-base font-bold text-card-foreground shadow-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              <div className="flex items-center justify-between">
                <span>
                  {selectedStatus} ({selectedStatus === "ALL" ? orders.length : orders.filter((order) => order.status === selectedStatus).length})
                </span>
                <svg
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-xl border-2 border-border bg-card shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-80 overflow-y-auto">
                  {statusFilters.map((status) => {
                    const count = status === "ALL"
                      ? orders.length
                      : orders.filter((order) => order.status === status).length;

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => {
                          setSelectedStatus(status);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3.5 text-left text-base font-semibold transition-colors ${
                          selectedStatus === status
                            ? 'bg-primary text-primary-foreground'
                            : 'text-card-foreground hover:bg-muted'
                        }`}
                      >
                        {status} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Filter - Desktop (Buttons) */}
        <div className="mb-6 hidden md:flex md:flex-wrap md:gap-2">
          {statusFilters.map((status) => {
            const count = status === "ALL"
              ? orders.length
              : orders.filter((order) => order.status === status).length;

            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  selectedStatus === status
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card text-card-foreground hover:bg-muted border border-border"
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-card py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-16 w-16 text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </svg>
            <p className="mt-4 text-lg font-semibold text-card-foreground">
              No {selectedStatus !== "ALL" ? selectedStatus.toLowerCase() : ""} orders
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedStatus === "ALL"
                ? "No orders have been placed yet."
                : `There are no ${selectedStatus.toLowerCase()} orders at the moment.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              const isUpdating = updatingOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-xl border-2 border-border bg-card shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
                >
                  {/* Order Header */}
                  <div className="border-b border-border bg-muted px-4 py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-bold text-muted-foreground tracking-wider">
                          ORDER #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                          order.status,
                        )}`}
                      >
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
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-14 w-14 rounded-lg object-cover shadow-sm"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-bold text-card-foreground">
                              {item.product.name}
                            </p>
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
                      <span className="text-2xl font-black text-primary">
                        ₱{order.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-2">
                      {nextStatus && (
                        <button
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                          disabled={isUpdating}
                          className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                        >
                          {isUpdating ? "Updating..." : `Mark ${nextStatus}`}
                        </button>
                      )}

                      {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "CANCELLED")}
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
