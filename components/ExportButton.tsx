"use client";

import { useState } from "react";
import Papa from "papaparse";
import { format } from "date-fns";

interface ExportButtonProps {
  data: {
    analytics: {
      totalOrders: number;
      totalRevenue: number;
      ordersChange?: number;
      revenueChange?: number;
      ordersByStatus: Array<{ status: string; count: number }>;
      popularProducts: Array<{
        product: {
          id: string;
          name: string;
          price: number;
          category: string;
        };
        totalQuantitySold: number;
        orderCount: number;
      }>;
      recentOrders: Array<{
        id: string;
        total: number;
        status: string;
        createdAt: string;
        user: {
          name: string;
          email: string;
        };
        orderItems: Array<{
          product: {
            name: string;
          };
          quantity: number;
        }>;
      }>;
      revenueByDay?: Array<{
        date: string;
        revenue: number;
        orderCount: number;
      }>;
    };
  };
  dateRange?: {
    startDate: string | null;
    endDate: string | null;
  };
}

type ExportType = "summary" | "orders" | "products" | "revenue";

export default function ExportButton({ data, dateRange }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Generate timestamp for filename
  const getTimestamp = () => {
    return format(new Date(), "yyyy-MM-dd_HHmm");
  };

  // Get date range suffix for filename
  const getDateSuffix = () => {
    if (dateRange?.startDate && dateRange?.endDate) {
      return `_${dateRange.startDate}_to_${dateRange.endDate}`;
    }
    return "_all_time";
  };

  // Export analytics summary
  const exportSummary = () => {
    const summary = [
      ["OrderBean Analytics Summary"],
      ["Generated", format(new Date(), "MMMM dd, yyyy HH:mm")],
      dateRange?.startDate && dateRange?.endDate
        ? ["Period", `${dateRange.startDate} to ${dateRange.endDate}`]
        : ["Period", "All Time"],
      [],
      ["Metric", "Value", "Change vs Previous Period"],
      ["Total Orders", data.analytics.totalOrders, `${data.analytics.ordersChange?.toFixed(1) || 0}%`],
      ["Total Revenue", `₱${data.analytics.totalRevenue.toFixed(2)}`, `${data.analytics.revenueChange?.toFixed(1) || 0}%`],
      [
        "Average Order Value",
        data.analytics.totalOrders > 0
          ? `₱${(data.analytics.totalRevenue / data.analytics.totalOrders).toFixed(2)}`
          : "₱0.00",
        "",
      ],
      [],
      ["Orders by Status"],
      ["Status", "Count", "Percentage"],
      ...data.analytics.ordersByStatus.map((status) => [
        status.status,
        status.count,
        `${((status.count / data.analytics.totalOrders) * 100).toFixed(1)}%`,
      ]),
    ];

    const csv = Papa.unparse(summary);
    downloadCSV(csv, `orderbean_summary${getDateSuffix()}_${getTimestamp()}.csv`);
  };

  // Export orders
  const exportOrders = () => {
    const orders = data.analytics.recentOrders.map((order) => ({
      "Order ID": order.id,
      "Customer Name": order.user.name,
      "Customer Email": order.user.email,
      "Total Amount": `₱${order.total.toFixed(2)}`,
      Status: order.status,
      Items: order.orderItems.map((item) => `${item.product.name} (${item.quantity}x)`).join(", "),
      "Item Count": order.orderItems.length,
      "Order Date": format(new Date(order.createdAt), "MMMM dd, yyyy HH:mm"),
    }));

    const csv = Papa.unparse(orders);
    downloadCSV(csv, `orderbean_orders${getDateSuffix()}_${getTimestamp()}.csv`);
  };

  // Export popular products
  const exportProducts = () => {
    const products = data.analytics.popularProducts.map((item, index) => ({
      Rank: index + 1,
      "Product Name": item.product.name,
      Category: item.product.category,
      Price: `₱${item.product.price.toFixed(2)}`,
      "Total Quantity Sold": item.totalQuantitySold,
      "Number of Orders": item.orderCount,
      "Total Revenue": `₱${(item.product.price * item.totalQuantitySold).toFixed(2)}`,
    }));

    const csv = Papa.unparse(products);
    downloadCSV(csv, `orderbean_products${getDateSuffix()}_${getTimestamp()}.csv`);
  };

  // Export daily revenue
  const exportRevenue = () => {
    if (!data.analytics.revenueByDay || data.analytics.revenueByDay.length === 0) {
      alert("No revenue data available to export");
      return;
    }

    const revenue = data.analytics.revenueByDay.map((day) => ({
      Date: format(new Date(day.date), "MMMM dd, yyyy"),
      Revenue: `₱${day.revenue.toFixed(2)}`,
      "Order Count": day.orderCount,
      "Average Order Value":
        day.orderCount > 0 ? `₱${(day.revenue / day.orderCount).toFixed(2)}` : "₱0.00",
    }));

    const csv = Papa.unparse(revenue);
    downloadCSV(csv, `orderbean_revenue${getDateSuffix()}_${getTimestamp()}.csv`);
  };

  // Download CSV helper
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Handle export
  const handleExport = async (type: ExportType) => {
    setIsExporting(true);
    setShowMenu(false);

    try {
      // Small delay for UX
      await new Promise((resolve) => setTimeout(resolve, 300));

      switch (type) {
        case "summary":
          exportSummary();
          break;
        case "orders":
          exportOrders();
          break;
        case "products":
          exportProducts();
          break;
        case "revenue":
          exportRevenue();
          break;
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={isExporting}
        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 md:px-6 md:py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isExporting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
            <span className="hidden md:inline">Exporting...</span>
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            <span className="hidden md:inline">Export CSV</span>
            <span className="md:hidden">Export</span>
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {showMenu && !isExporting && (
        <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-border bg-card shadow-xl">
          <div className="p-2">
            <button
              onClick={() => handleExport("summary")}
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-card-foreground hover:bg-muted transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 text-primary"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>
              <div>
                <div>Analytics Summary</div>
                <div className="text-xs text-muted-foreground">All metrics</div>
              </div>
            </button>

            <button
              onClick={() => handleExport("orders")}
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-card-foreground hover:bg-muted transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 text-blue-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                />
              </svg>
              <div>
                <div>Recent Orders</div>
                <div className="text-xs text-muted-foreground">
                  {data.analytics.recentOrders.length} orders
                </div>
              </div>
            </button>

            <button
              onClick={() => handleExport("products")}
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-card-foreground hover:bg-muted transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <div>
                <div>Popular Products</div>
                <div className="text-xs text-muted-foreground">
                  Top {data.analytics.popularProducts.length} items
                </div>
              </div>
            </button>

            <button
              onClick={() => handleExport("revenue")}
              className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold text-card-foreground hover:bg-muted transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 text-purple-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                />
              </svg>
              <div>
                <div>Daily Revenue</div>
                <div className="text-xs text-muted-foreground">
                  {data.analytics.revenueByDay?.length || 0} days
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
