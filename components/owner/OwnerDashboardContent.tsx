"use client";

import { motion } from "motion/react";
import { useOwnerAnalytics } from "@/hooks/useOwnerAnalytics";
import DateRangePicker from "@/components/DateRangePicker";
import RevenueChart from "@/components/charts/RevenueChart";
import InventoryAlert from "@/components/InventoryAlert";
import DashboardHeader from "@/components/owner/DashboardHeader";
import StatisticsCards from "@/components/owner/StatisticsCards";
import PopularProductsSection from "@/components/owner/PopularProductsSection";
import OrdersByStatusSection from "@/components/owner/OrdersByStatusSection";
import RecentOrdersSection from "@/components/owner/RecentOrdersSection";

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay, ease: easeOut },
  }),
};

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
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <DashboardHeader
            isConnected={isConnected}
            refreshing={refreshing}
            analytics={analytics}
            searchParams={searchParams}
          />
        </motion.div>

        {/* Date Range Picker */}
        <motion.div className="mb-6 md:mb-8" custom={0.1} initial="hidden" animate="visible" variants={fadeUp}>
          <DateRangePicker />
        </motion.div>

        {/* Inventory Alert */}
        <motion.div className="mb-6 md:mb-8" custom={0.15} initial="hidden" animate="visible" variants={fadeUp}>
          <InventoryAlert />
        </motion.div>

        {/* Statistics Cards */}
        <motion.div custom={0.2} initial="hidden" animate="visible" variants={fadeUp}>
          <StatisticsCards analytics={analytics} />
        </motion.div>

        {/* Revenue Chart */}
        <motion.div className="mb-4 md:mb-6" custom={0.3} initial="hidden" animate="visible" variants={fadeUp}>
          <RevenueChart data={analytics.revenueByDay || []} />
        </motion.div>

        {/* Two Column Layout: Popular Products & Orders by Status */}
        <motion.div
          className="mb-4 grid grid-cols-1 gap-4 md:mb-6 md:gap-6 lg:grid-cols-2"
          custom={0.4}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <PopularProductsSection popularProducts={analytics.popularProducts || []} />
          <OrdersByStatusSection
            ordersByStatus={analytics.ordersByStatus || []}
            totalOrders={analytics.totalOrders || 0}
          />
        </motion.div>

        {/* Recent Orders */}
        <motion.div custom={0.5} initial="hidden" animate="visible" variants={fadeUp}>
          <RecentOrdersSection recentOrders={analytics.recentOrders || []} />
        </motion.div>
      </div>
    </div>
  );
}
