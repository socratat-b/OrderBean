"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface LowStockProduct {
  id: string;
  name: string;
  stockQuantity: number;
  lowStockThreshold: number;
  category: string;
}

export default function InventoryAlert() {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Fetch low stock products on mount
    fetchLowStockProducts();

    // Set up SSE connection for real-time updates
    const eventSource = new EventSource("/api/sse/owner/orders");

    eventSource.addEventListener("low_stock_alert", (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[InventoryAlert] Low stock alert received:", data);

        // Refresh the low stock products list
        fetchLowStockProducts();
      } catch (error) {
        console.error("[InventoryAlert] Error parsing SSE data:", error);
      }
    });

    eventSource.onerror = (error) => {
      console.error("[InventoryAlert] SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  async function fetchLowStockProducts() {
    try {
      const response = await fetch("/api/owner/inventory/low-stock");

      if (response.ok) {
        const data = await response.json();
        setLowStockProducts(data.products || []);
      }
    } catch (error) {
      console.error("[InventoryAlert] Error fetching low stock products:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-2"></div>
        <div className="h-4 w-full bg-muted rounded"></div>
      </div>
    );
  }

  if (lowStockProducts.length === 0) {
    return null; // Don't show anything if no low stock items
  }

  return (
    <div className="rounded-xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500">
            <svg
              className="h-6 w-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-900 dark:text-amber-100">
              Low Stock Alert
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""} need restocking
            </p>
          </div>
        </div>
        <button className="rounded-full p-1 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors">
          <svg
            className={`h-5 w-5 text-amber-900 dark:text-amber-100 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Product List */}
      {isExpanded && (
        <div className="border-t border-amber-300 dark:border-amber-700">
          <div className="p-4 space-y-3">
            {lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-amber-950/30 p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-card-foreground text-sm">
                      {product.name}
                    </h4>
                    <span className="text-xs font-semibold text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                      {product.category}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="text-amber-600 dark:text-amber-500 font-bold">
                      Stock: {product.stockQuantity}
                    </span>
                    <span className="text-muted-foreground">
                      (Alert at {product.lowStockThreshold})
                    </span>
                  </div>
                </div>
                <Link
                  href="/owner/products"
                  className="ml-3 rounded-lg border border-border bg-card px-3 py-2 text-xs font-bold text-card-foreground hover:bg-muted transition-colors"
                >
                  Restock
                </Link>
              </div>
            ))}
          </div>

          {/* View All Link */}
          <div className="border-t border-amber-300 dark:border-amber-700 p-3">
            <Link
              href="/owner/products"
              className="block w-full text-center text-sm font-bold text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
            >
              View All Products →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
