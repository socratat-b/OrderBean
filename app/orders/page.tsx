// app/orders/page.tsx
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
  status: string;
  createdAt: string;
  orderItems: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await fetch("/api/orders");

        if (!response.ok) {
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

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PREPARING":
        return "bg-blue-100 text-blue-800";
      case "READY":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  if (orders.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mx-auto h-24 w-24 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
            />
          </svg>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            No orders yet
          </h2>
          <p className="mt-2 text-gray-600">
            Start ordering some delicious coffee!
          </p>
          <a
            href="/menu"
            className="mt-8 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Browse Menu
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="mt-2 text-sm text-gray-600">
          {orders.length} {orders.length === 1 ? "order" : "orders"} total
        </p>

        <div className="mt-8 space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </span>
                  <p className="mt-2 text-lg font-bold text-gray-900">
                    ₱{order.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Items
                </h3>
                <div className="space-y-3">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      {item.product.imageUrl && (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity} × ₱{item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₱{(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Actions */}
              <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                <button
                  onClick={() => alert(`Order details for ${order.id}`)}
                  className="text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                  View Details →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
