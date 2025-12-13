// app/staff/page.tsx
"use client";

import { useEffect, useState } from "react";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("ALL");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Filter orders based on selected status
    if (selectedStatus === "ALL") {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === selectedStatus));
    }
  }, [selectedStatus, orders]);

  async function fetchOrders() {
    try {
      setLoading(true);
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
      setLoading(false);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
          <p className="mt-4 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage customer orders • {orders.length} total orders
          </p>
        </div>

        {/* Status Filter Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
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
                    ? "bg-black text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {status} ({count})
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white py-12">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-16 w-16 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </svg>
            <p className="mt-4 text-lg font-semibold text-gray-900">
              No {selectedStatus !== "ALL" ? selectedStatus.toLowerCase() : ""} orders
            </p>
            <p className="mt-1 text-sm text-gray-600">
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
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  {/* Order Header */}
                  <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500">
                          ORDER #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
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
                  <div className="border-b border-gray-200 bg-white px-4 py-3">
                    <p className="text-xs font-medium text-gray-500">CUSTOMER</p>
                    <p className="mt-1 font-semibold text-gray-900">{order.user.name}</p>
                    <p className="text-sm text-gray-600">{order.user.email}</p>
                  </div>

                  {/* Order Items */}
                  <div className="px-4 py-3">
                    <p className="mb-2 text-xs font-medium text-gray-500">ITEMS</p>
                    <div className="space-y-2">
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                          {item.product.imageUrl && (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {item.quantity}x • ₱{item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Total & Actions */}
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₱{order.total.toFixed(2)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {nextStatus && (
                        <button
                          onClick={() => updateOrderStatus(order.id, nextStatus)}
                          disabled={isUpdating}
                          className="flex-1 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          {isUpdating ? "Updating..." : `Mark ${nextStatus}`}
                        </button>
                      )}

                      {order.status !== "CANCELLED" && order.status !== "COMPLETED" && (
                        <button
                          onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                          disabled={isUpdating}
                          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
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
