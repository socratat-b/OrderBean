"use client";

import { OrdersByStatus } from "@/types/owner";
import { getStatusColor, calculatePercentage } from "@/lib/utils";

interface OrdersByStatusSectionProps {
  ordersByStatus: OrdersByStatus[];
  totalOrders: number;
}

export default function OrdersByStatusSection({
  ordersByStatus,
  totalOrders,
}: OrdersByStatusSectionProps) {
  return (
    <div className="border-border bg-card rounded-xl border p-4 shadow-md md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-card-foreground text-base font-bold md:text-lg">
          Orders by Status
        </h2>
        <div className="bg-primary/10 rounded-full px-3 py-1">
          <span className="text-primary text-xs font-bold">{totalOrders}</span>
        </div>
      </div>
      <div className="space-y-3">
        {ordersByStatus.map((item) => {
          const percentage = calculatePercentage(item.count, totalOrders);

          return (
            <div key={item.status}>
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
                    item.status
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
  );
}
