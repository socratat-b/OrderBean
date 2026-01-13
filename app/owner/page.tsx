// app/owner/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useOwnerOrdersSSE } from "@/hooks/useOwnerOrdersSSE";
import DateRangePicker from "@/components/DateRangePicker";
import RevenueChart from "@/components/charts/RevenueChart";
import ExportButton from "@/components/ExportButton";

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

interface RevenueByDay {
  date: string;
  revenue: number;
  orderCount: number;
}

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  ordersChange?: number;
  revenueChange?: number;
  ordersByStatus: OrdersByStatus[];
  popularProducts: PopularProduct[];
  recentOrders: RecentOrder[];
  revenueByDay?: RevenueByDay[];
}

function OwnerDashboardContent() {
  const searchParams = useSearchParams();

  // Check if we have cached data
  const getCachedAnalytics = () => {
    if (typeof window === "undefined") return null;
    const cached = sessionStorage.getItem("owner_analytics");
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

  // Extract date params once
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  const [analytics, setAnalytics] = useState<Analytics | null>(cachedAnalytics);
  const [initialLoading, setInitialLoading] = useState(!cachedAnalytics);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const hasFetchedRef = useRef(false);

  // Prevent hydration mismatch by only showing content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch analytics function with useCallback to stabilize dependencies
  const fetchAnalytics = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) {
        setInitialLoading(true);
      } else {
        setRefreshing(true);
      }

      // Build URL with date parameters
      let url = "/api/owner/analytics";
      if (startDateParam && endDateParam) {
        url += `?startDate=${startDateParam}&endDate=${endDateParam}`;
      }

      const response = await fetch(url, {
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
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "owner_analytics",
          JSON.stringify(data.analytics),
        );
      }

      setError(""); // Clear any previous errors
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [startDateParam, endDateParam]);

  // Real-time SSE callbacks
  const handleOrderCreated = useCallback(() => {
    // Refetch analytics when a new order is created
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleOrderUpdated = useCallback(() => {
    // Refetch analytics when an order is updated
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Subscribe to real-time order updates
  const { isConnected } = useOwnerOrdersSSE(
    handleOrderCreated,
    handleOrderUpdated,
  );

  // Fetch analytics when date params change
  useEffect(() => {
    // Only fetch if we haven't fetched yet, or if date params changed
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchAnalytics(!cachedAnalytics);
    } else {
      fetchAnalytics(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDateParam, endDateParam, fetchAnalytics]); // cachedAnalytics is constant, safe to omit

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

  // Show loading spinner during SSR and initial client mount
  if (!mounted || initialLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-border border-t-primary mx-auto h-12 w-12 animate-spin rounded-full border-4"></div>
          <p className="text-muted-foreground mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-error font-semibold">Error: {error}</p>
          <button
            onClick={() => fetchAnalytics(true)}
            className="bg-primary text-primary-foreground mt-4 rounded-xl px-6 py-3 font-bold shadow-md transition-all hover:opacity-90 hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  // Format percentage change
  const formatChange = (change: number | undefined) => {
    if (change === undefined) return null;
    const isPositive = change >= 0;
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}
      >
        {isPositive ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="h-3 w-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3}
            stroke="currentColor"
            className="h-3 w-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
            />
          </svg>
        )}
        {Math.abs(change).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="bg-background min-h-screen px-4 py-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          {/* Mobile Header */}
          <div className="flex flex-col gap-4 md:hidden">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-bold">
                  Owner Dashboard
                </h1>
                {refreshing && (
                  <div className="border-border border-t-primary h-5 w-5 animate-spin rounded-full border-2"></div>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                Business analytics and insights
              </p>
            </div>

            {/* Real-time indicator - Mobile */}
            <div className="flex items-center justify-between gap-2">
              <div className="bg-card border-border flex items-center gap-2 rounded-lg border px-3 py-2 shadow-sm">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${isConnected ? "animate-pulse bg-green-500" : "bg-muted-foreground"}`}
                ></div>
                <span className="text-muted-foreground text-xs font-semibold">
                  {isConnected ? "Live" : "Connecting..."}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {analytics && (
                  <ExportButton
                    data={{ analytics }}
                    dateRange={{
                      startDate: searchParams.get("startDate"),
                      endDate: searchParams.get("endDate"),
                    }}
                  />
                )}
                <Link
                  href="/owner/products"
                  className="bg-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-bold shadow-md transition-all hover:opacity-90 active:scale-95"
                >
                  Products
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden items-center justify-between md:flex">
            <div className="flex items-center gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-foreground text-3xl font-bold">
                    Owner Dashboard
                  </h1>
                  {refreshing && (
                    <div className="border-border border-t-primary h-6 w-6 animate-spin rounded-full border-2"></div>
                  )}
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  Business analytics and insights
                </p>
              </div>
              {/* Real-time connection indicator - Desktop */}
              <div className="bg-card border-border flex items-center gap-2 rounded-lg border px-4 py-2 shadow-sm">
                <div
                  className={`h-2.5 w-2.5 rounded-full ${isConnected ? "animate-pulse bg-green-500" : "bg-muted-foreground"}`}
                ></div>
                <span className="text-muted-foreground text-xs font-semibold">
                  {isConnected ? "Live updates active" : "Connecting..."}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {analytics && (
                <ExportButton
                  data={{ analytics }}
                  dateRange={{
                    startDate: searchParams.get("startDate"),
                    endDate: searchParams.get("endDate"),
                  }}
                />
              )}
              <Link
                href="/owner/products"
                className="bg-primary text-primary-foreground rounded-xl px-6 py-3 text-sm font-bold shadow-md transition-all hover:opacity-90 hover:shadow-lg"
              >
                Manage Products
              </Link>
            </div>
          </div>
        </div>

        {/* Date Range Picker */}
        <div className="mb-6 md:mb-8">
          <DateRangePicker />
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:mb-8 md:gap-6 lg:grid-cols-4">
          {/* Total Orders */}
          <div className="border-border bg-card rounded-xl border p-4 shadow-md transition-shadow hover:shadow-lg md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase md:text-sm">
                  Total Orders
                </p>
                <div className="mt-1 flex items-center gap-2 md:mt-2">
                  <p className="text-card-foreground text-2xl font-black md:text-3xl">
                    {analytics.totalOrders}
                  </p>
                  {formatChange(analytics.ordersChange)}
                </div>
              </div>
              <div className="hidden rounded-full bg-blue-100 p-3 md:block dark:bg-blue-900/30">
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
          <div className="border-border bg-card rounded-xl border p-4 shadow-md transition-shadow hover:shadow-lg md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase md:text-sm">
                  Revenue
                </p>
                <div className="mt-1 flex items-center gap-2 md:mt-2">
                  <p className="text-card-foreground text-xl font-black md:text-3xl">
                    ₱{analytics.totalRevenue.toFixed(2)}
                  </p>
                  {formatChange(analytics.revenueChange)}
                </div>
              </div>
              <div className="hidden rounded-full bg-green-100 p-3 md:block dark:bg-green-900/30">
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
          <div className="border-border bg-card rounded-xl border p-4 shadow-md transition-shadow hover:shadow-lg md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase md:text-sm">
                  Avg Order
                </p>
                <p className="text-card-foreground mt-1 text-xl font-black md:mt-2 md:text-3xl">
                  ₱
                  {analytics.totalOrders > 0
                    ? (analytics.totalRevenue / analytics.totalOrders).toFixed(
                        2,
                      )
                    : "0.00"}
                </p>
              </div>
              <div className="hidden rounded-full bg-purple-100 p-3 md:block dark:bg-purple-900/30">
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
          <div className="border-border bg-card rounded-xl border p-4 shadow-md transition-shadow hover:shadow-lg md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase md:text-sm">
                  Completed
                </p>
                <p className="text-card-foreground mt-1 text-2xl font-black md:mt-2 md:text-3xl">
                  {analytics.ordersByStatus.find(
                    (s) => s.status === "COMPLETED",
                  )?.count || 0}
                </p>
              </div>
              <div className="hidden rounded-full bg-green-100 p-3 md:block dark:bg-green-900/30">
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

        {/* Revenue Chart */}
        <div className="mb-4 md:mb-6">
          <RevenueChart
            data={analytics.revenueByDay || []}
            loading={refreshing}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* Popular Products */}
          <div className="border-border bg-card rounded-xl border p-4 shadow-md md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-card-foreground text-base font-bold md:text-lg">
                Popular Products
              </h2>
              <div className="bg-primary/10 rounded-full px-3 py-1">
                <span className="text-primary text-xs font-bold">
                  {analytics.popularProducts.length}
                </span>
              </div>
            </div>
            {analytics.popularProducts.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                No orders yet
              </p>
            ) : (
              <div className="space-y-3">
                {analytics.popularProducts.map((item, index) => (
                  <div
                    key={item.product.id}
                    className="border-border hover:bg-muted flex items-center gap-3 rounded-lg border p-3 transition-colors md:p-4"
                  >
                    <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold md:h-10 md:w-10 md:text-base">
                      {index + 1}
                    </div>
                    {item.product.imageUrl && (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="h-12 w-12 shrink-0 rounded-lg object-cover shadow-sm md:h-16 md:w-16"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-card-foreground truncate text-sm font-bold md:text-base">
                        {item.product.name}
                      </p>
                      <p className="text-muted-foreground text-xs md:text-sm">
                        <span className="text-primary font-semibold">
                          {item.totalQuantitySold}
                        </span>{" "}
                        sold • {item.orderCount} orders
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-card-foreground text-sm font-bold md:text-base">
                        ₱{item.product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orders by Status */}
          <div className="border-border bg-card rounded-xl border p-4 shadow-md md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-card-foreground text-base font-bold md:text-lg">
                Orders by Status
              </h2>
              <div className="bg-primary/10 rounded-full px-3 py-1">
                <span className="text-primary text-xs font-bold">
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
                      <span className="text-card-foreground text-sm font-semibold">
                        {item.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-primary h-full transition-all"
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
        <div className="border-border bg-card mt-4 rounded-xl border p-4 shadow-md md:mt-6 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-card-foreground text-base font-bold md:text-lg">
              Recent Orders
            </h2>
            <div className="bg-primary/10 rounded-full px-3 py-1">
              <span className="text-primary text-xs font-bold">
                {analytics.recentOrders.length}
              </span>
            </div>
          </div>
          {analytics.recentOrders.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No recent orders
            </p>
          ) : (
            <>
              {/* Mobile: Card View */}
              <div className="space-y-3 md:hidden">
                {analytics.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="border-border hover:bg-muted rounded-lg border p-3 transition-colors"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <p className="text-muted-foreground font-mono text-xs">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-card-foreground mt-1 text-sm font-bold">
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
                    <div className="text-muted-foreground flex items-center justify-between text-xs">
                      <span>{order.orderItems.length} item(s)</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                    <div className="border-border mt-2 border-t pt-2">
                      <p className="text-primary text-lg font-black">
                        ₱{order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table View */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-border text-muted-foreground border-b text-left text-xs font-bold tracking-wide uppercase">
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
                        className="border-border hover:bg-muted border-b transition-colors"
                      >
                        <td className="text-muted-foreground py-3 font-mono text-xs">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </td>
                        <td className="py-3">
                          <p className="text-card-foreground font-semibold">
                            {order.user.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {order.user.email}
                          </p>
                        </td>
                        <td className="text-muted-foreground py-3">
                          {order.orderItems.length} item(s)
                        </td>
                        <td className="text-card-foreground py-3 font-bold">
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
                        <td className="text-muted-foreground py-3 text-xs">
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

export default function OwnerDashboard() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="border-border border-t-primary mx-auto h-12 w-12 animate-spin rounded-full border-4"></div>
            <p className="text-muted-foreground mt-4">Loading dashboard...</p>
          </div>
        </div>
      }
    >
      <OwnerDashboardContent />
    </Suspense>
  );
}
