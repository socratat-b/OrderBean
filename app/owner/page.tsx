// app/owner/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useOwnerOrdersSSE } from "@/hooks/useOwnerOrdersSSE";

interface OrdersByStatus {
  status: string;
  count: number;
}

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  available: boolean;
}

interface PopularProduct {
  product: Product;
  totalQuantitySold: number;
  orderCount: number;
}

interface OrderItem {
  product: {
    name: string;
  };
  quantity: number;
}

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
}

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  ordersByStatus: OrdersByStatus[];
  popularProducts: PopularProduct[];
  recentOrders: RecentOrder[];
}

export default function OwnerDashboard() {
  // Check if we have cached data
  const getCachedAnalytics = () => {
    if (typeof window === 'undefined') return null;
    const cached = sessionStorage.getItem('owner_analytics');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  };

  const cachedAnalytics = getCachedAnalytics();

  const [analytics, setAnalytics] = useState<Analytics | null>(cachedAnalytics);
  const [initialLoading, setInitialLoading] = useState(!cachedAnalytics);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Real-time SSE callbacks
  const handleOrderCreated = useCallback(() => {
    // Refetch analytics when a new order is created
    fetchAnalytics();
  }, []);

  const handleOrderUpdated = useCallback(() => {
    // Refetch analytics when an order is updated
    fetchAnalytics();
  }, []);

  // Subscribe to real-time order updates
  const { isConnected, error: sseError } = useOwnerOrdersSSE(
    handleOrderCreated,
    handleOrderUpdated
  );

  useEffect(() => {
    // Only show initial loading if we don't have cached data
    fetchAnalytics(!cachedAnalytics);
  }, []);

  async function fetchAnalytics(isInitial = false) {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await fetch("/api/owner/analytics", {
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error("Access denied. Owner role required.");
        }
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data.analytics);

      // Cache the data in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('owner_analytics', JSON.stringify(data.analytics));
      }

      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-error font-semibold">Error: {error}</p>
          <button
            onClick={() => fetchAnalytics(true)}
            className="mt-4 rounded-xl bg-primary px-6 py-3 text-primary-foreground font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-background px-4 py-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          {/* Mobile Header */}
          <div className="flex flex-col gap-4 md:hidden">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">Owner Dashboard</h1>
                {refreshing && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary"></div>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Business analytics and insights
              </p>
            </div>

            {/* Real-time indicator - Mobile */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-3 py-2 shadow-sm">
                <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`}></div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {isConnected ? 'Live updates active' : 'Connecting...'}
                </span>
              </div>

              <Link
                href="/owner/products"
                className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all shadow-md active:scale-95"
              >
                Products
              </Link>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-foreground">Owner Dashboard</h1>
                  {refreshing && (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary"></div>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Business analytics and insights
                </p>
              </div>
              {/* Real-time connection indicator - Desktop */}
              <div className="flex items-center gap-2 rounded-lg bg-card border border-border px-4 py-2 shadow-sm">
                <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`}></div>
                <span className="text-xs font-semibold text-muted-foreground">
                  {isConnected ? 'Live updates active' : 'Connecting...'}
                </span>
              </div>
            </div>
            <Link
              href="/owner/products"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all shadow-md hover:shadow-lg"
            >
              Manage Products
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 md:mb-8 grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
          {/* Total Orders */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Orders</p>
                <p className="mt-1 md:mt-2 text-2xl md:text-3xl font-black text-card-foreground">
                  {analytics.totalOrders}
                </p>
              </div>
              <div className="hidden md:block rounded-full bg-blue-100 dark:bg-blue-900/30 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6 text-blue-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Revenue</p>
                <p className="mt-1 md:mt-2 text-xl md:text-3xl font-black text-card-foreground">
                  ₱{analytics.totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="hidden md:block rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6 text-green-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Avg Order</p>
                <p className="mt-1 md:mt-2 text-xl md:text-3xl font-black text-card-foreground">
                  ₱
                  {analytics.totalOrders > 0
                    ? (analytics.totalRevenue / analytics.totalOrders).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <div className="hidden md:block rounded-full bg-purple-100 dark:bg-purple-900/30 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6 text-purple-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Completed Orders */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Completed</p>
                <p className="mt-1 md:mt-2 text-2xl md:text-3xl font-black text-card-foreground">
                  {
                    analytics.ordersByStatus.find((s) => s.status === "COMPLETED")
                      ?.count || 0
                  }
                </p>
              </div>
              <div className="hidden md:block rounded-full bg-green-100 dark:bg-green-900/30 p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6 text-green-600"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* Popular Products */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base md:text-lg font-bold text-card-foreground">
                Popular Products
              </h2>
              <div className="rounded-full bg-primary/10 px-3 py-1">
                <span className="text-xs font-bold text-primary">
                  {analytics.popularProducts.length}
                </span>
              </div>
            </div>
            {analytics.popularProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.popularProducts.map((item, index) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 md:p-4 hover:bg-muted transition-colors"
                  >
                    <div className="flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-sm md:text-base">
                      {index + 1}
                    </div>
                    {item.product.imageUrl && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-12 w-12 md:h-16 md:w-16 shrink-0 rounded-lg object-cover shadow-sm"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-card-foreground text-sm md:text-base truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">{item.totalQuantitySold}</span> sold • {item.orderCount} orders
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-card-foreground text-sm md:text-base">
                        ₱{item.product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders by Status */}
          <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base md:text-lg font-bold text-card-foreground">
                Orders by Status
              </h2>
              <div className="rounded-full bg-primary/10 px-3 py-1">
                <span className="text-xs font-bold text-primary">
                  {analytics.totalOrders}
                </span>
              </div>
            </div>
            <div className="space-y-3">
              {analytics.ordersByStatus.map((item) => {
                const percentage =
                  analytics.totalOrders > 0
                    ? (item.count / analytics.totalOrders) * 100
                    : 0;

                return (
                  <div key={item.status}>
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                          item.status,
                        )}`}
                      >
                        {item.status}
                      </span>
                      <span className="text-sm font-semibold text-card-foreground">
                        {item.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="mt-4 md:mt-6 rounded-xl border border-border bg-card p-4 md:p-6 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base md:text-lg font-bold text-card-foreground">Recent Orders</h2>
            <div className="rounded-full bg-primary/10 px-3 py-1">
              <span className="text-xs font-bold text-primary">
                {analytics.recentOrders.length}
              </span>
            </div>
          </div>
          {analytics.recentOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No recent orders</p>
          ) : (
            <>
              {/* Mobile: Card View */}
              <div className="space-y-3 md:hidden">
                {analytics.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-border p-3 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono text-xs text-muted-foreground">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="mt-1 font-bold text-card-foreground text-sm">
                          {order.user.name}
                        </p>
                      </div>
                      <span
                        className={`inline-block rounded-full border px-2 py-1 text-xs font-semibold ${getStatusColor(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{order.orderItems.length} item(s)</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-lg font-black text-primary">
                        ₱{order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {analytics.recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-border hover:bg-muted transition-colors"
                      >
                        <td className="py-3 font-mono text-xs text-muted-foreground">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="py-3">
                          <p className="font-semibold text-card-foreground">
                            {order.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">{order.user.email}</p>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {order.orderItems.length} item(s)
                        </td>
                        <td className="py-3 font-bold text-card-foreground">
                          ₱{order.total.toFixed(2)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-block rounded-full border px-2 py-1 text-xs font-semibold ${getStatusColor(
                              order.status,
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground text-xs">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
