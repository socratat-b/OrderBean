"use client";

import Link from "next/link";
import { ReadonlyURLSearchParams } from "next/navigation";
import ExportButton from "@/components/ExportButton";
import { Analytics } from "@/types/owner";

interface DashboardHeaderProps {
  isConnected: boolean;
  refreshing: boolean;
  analytics: Analytics | null;
  searchParams: ReadonlyURLSearchParams;
}

export default function DashboardHeader({
  isConnected,
  refreshing,
  analytics,
  searchParams,
}: DashboardHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      {/* Mobile Header */}
      <div className="flex flex-col gap-4 md:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-foreground text-2xl font-bold">Owner Dashboard</h1>
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
              <h1 className="text-foreground text-3xl font-bold">Owner Dashboard</h1>
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
  );
}
