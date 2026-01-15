"use client";

import { Analytics } from "@/types/owner";
import { getPercentageChangeData, formatCurrency } from "@/lib/utils";

interface StatisticsCardsProps {
  analytics: Analytics;
}

export default function StatisticsCards({ analytics }: StatisticsCardsProps) {
  const totalOrders = analytics?.totalOrders || 0;
  const totalRevenue = analytics?.totalRevenue || 0;

  const ordersChange = getPercentageChangeData(analytics?.ordersChange);
  const revenueChange = getPercentageChangeData(analytics?.revenueChange);

  const avgOrderValue =
    totalOrders > 0
      ? (totalRevenue / totalOrders).toFixed(2)
      : "0.00";

  const completedOrders =
    analytics?.ordersByStatus?.find((s) => s.status === "COMPLETED")?.count || 0;

  return (
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
              {ordersChange && (
                <span className={`flex items-center gap-1 text-sm font-semibold ${ordersChange.colorClass}`}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={ordersChange.isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}
                    />
                  </svg>
                  {ordersChange.value}
                </span>
              )}
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
                {formatCurrency(analytics.totalRevenue)}
              </p>
              {revenueChange && (
                <span className={`flex items-center gap-1 text-sm font-semibold ${revenueChange.colorClass}`}>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={revenueChange.isPositive ? "M5 10l7-7m0 0l7 7m-7-7v18" : "M19 14l-7 7m0 0l-7-7m7 7V3"}
                    />
                  </svg>
                  {revenueChange.value}
                </span>
              )}
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
              ₱{avgOrderValue}
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
              {completedOrders}
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
  );
}
