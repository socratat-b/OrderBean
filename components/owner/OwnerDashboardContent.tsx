"use client";

import { useOwnerAnalytics } from "@/hooks/useOwnerAnalytics";
import DateRangePicker from "@/components/DateRangePicker";
import RevenueChart from "@/components/charts/RevenueChart";
import InventoryAlert from "@/components/InventoryAlert";
import DashboardHeader from "@/components/owner/DashboardHeader";
import StatisticsCards from "@/components/owner/StatisticsCards";
import PopularProductsSection from "@/components/owner/PopularProductsSection";
import OrdersByStatusSection from "@/components/owner/OrdersByStatusSection";
import RecentOrdersSection from "@/components/owner/RecentOrdersSection";

export default function OwnerDashboardContent() {
  const {
    analytics,
    initialLoading,
    refreshing,
    error,
    mounted,
    isConnected,
    fetchAnalytics,
    searchParams,
  } = useOwnerAnalytics();

  if (!mounted) {
    return null;
  }

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

  if (!analytics) {
    return null;
  }

  return (
    <div className="bg-background min-h-screen px-4 py-6 md:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <DashboardHeader
          isConnected={isConnected}
          refreshing={refreshing}
          analytics={analytics}
          searchParams={searchParams}
        />

        {/* Date Range Picker */}
        <div className="mb-6 md:mb-8">
          <DateRangePicker />
        </div>

        {/* Inventory Alert */}
        <div className="mb-6 md:mb-8">
          <InventoryAlert />
        </div>

        {/* Statistics Cards */}
        <StatisticsCards analytics={analytics} />

        {/* Revenue Chart */}
        <div className="mb-4 md:mb-6">
          <RevenueChart data={analytics.revenueByDay || []} />
        </div>

        {/* Two Column Layout: Popular Products & Orders by Status */}
        <div className="mb-4 grid grid-cols-1 gap-4 md:mb-6 md:gap-6 lg:grid-cols-2">
          <PopularProductsSection popularProducts={analytics.popularProducts} />
          <OrdersByStatusSection
            ordersByStatus={analytics.ordersByStatus}
            totalOrders={analytics.totalOrders}
          />
        </div>

        {/* Recent Orders */}
        <RecentOrdersSection recentOrders={analytics.recentOrders} />
      </div>
    </div>
  );
}
