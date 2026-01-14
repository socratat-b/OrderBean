"use client";

import { RecentOrder } from "@/types/owner";
import { getStatusColor, formatOrderDate, formatCurrency } from "@/lib/utils";

interface RecentOrdersSectionProps {
  recentOrders: RecentOrder[];
}

export default function RecentOrdersSection({ recentOrders }: RecentOrdersSectionProps) {
  return (
    <div className="border-border bg-card mt-4 rounded-xl border p-4 shadow-md md:mt-6 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-card-foreground text-base font-bold md:text-lg">
          Recent Orders
        </h2>
        <div className="bg-primary/10 rounded-full px-3 py-1">
          <span className="text-primary text-xs font-bold">{recentOrders.length}</span>
        </div>
      </div>
      {recentOrders.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">No recent orders</p>
      ) : (
        <>
          {/* Mobile: Card View */}
          <div className="space-y-3 md:hidden">
            {recentOrders.map((order) => (
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
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center justify-between text-xs">
                  <span>{order.orderItems.length} item(s)</span>
                  <span>{formatOrderDate(order.createdAt)}</span>
                </div>
                <div className="border-border mt-2 border-t pt-2">
                  <p className="text-primary text-lg font-black">
                    {formatCurrency(order.total)}
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
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-border hover:bg-muted border-b transition-colors"
                  >
                    <td className="text-muted-foreground py-3 font-mono text-xs">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3">
                      <p className="text-card-foreground font-semibold">{order.user.name}</p>
                      <p className="text-muted-foreground text-xs">{order.user.email}</p>
                    </td>
                    <td className="text-muted-foreground py-3">
                      {order.orderItems.length} item(s)
                    </td>
                    <td className="text-card-foreground py-3 font-bold">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-block rounded-full border px-2 py-1 text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground py-3 text-xs">
                      {formatOrderDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
