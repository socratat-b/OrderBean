"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

interface RevenueDataPoint {
  date: string; // YYYY-MM-DD format
  revenue: number;
  orderCount: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  loading?: boolean;
}

export default function RevenueChart({ data, loading }: RevenueChartProps) {
  // Format data for Recharts
  const chartData = useMemo(() => {
    return data.map((point) => ({
      date: point.date,
      displayDate: format(parseISO(point.date), "MMM dd"),
      revenue: point.revenue,
      orderCount: point.orderCount,
    }));
  }, [data]);

  // Custom tooltip component
  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
      payload: { date: string; displayDate: string };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="mb-2 text-xs font-bold text-card-foreground">
            {format(parseISO(data.date), "MMMM dd, yyyy")}
          </p>
          {payload.map((entry) => (
            <p
              key={entry.dataKey}
              className="text-sm"
              style={{ color: entry.dataKey === "revenue" ? "#10b981" : "#6366f1" }}
            >
              <span className="font-semibold">
                {entry.dataKey === "revenue" ? "Revenue:" : "Orders:"}
              </span>{" "}
              {entry.dataKey === "revenue"
                ? `₱${entry.value.toFixed(2)}`
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-md">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-5 w-5 rounded bg-muted animate-pulse"></div>
          <div className="h-6 w-32 rounded bg-muted animate-pulse"></div>
        </div>
        <div className="h-[300px] md:h-[400px] w-full rounded-lg bg-muted animate-pulse"></div>
      </div>
    );
  }

  // Empty state
  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-md">
        <div className="mb-4 flex items-center gap-3">
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
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
            />
          </svg>
          <h2 className="text-base md:text-lg font-bold text-card-foreground">
            Revenue Trends
          </h2>
        </div>
        <div className="flex h-[300px] md:h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-border">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="mx-auto h-12 w-12 text-muted-foreground"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
              />
            </svg>
            <p className="mt-4 text-sm font-semibold text-muted-foreground">
              No revenue data available
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Data will appear here once orders are placed
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
            />
          </svg>
          <h2 className="text-base md:text-lg font-bold text-card-foreground">
            Revenue Trends
          </h2>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1">
          <span className="text-xs font-bold text-primary">
            {chartData.length} day{chartData.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="h-[300px] md:h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 10,
              left: 0,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="displayDate"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₱${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
              }}
              iconType="line"
              formatter={(value) => (
                <span className="text-sm font-semibold text-card-foreground">
                  {value === "revenue" ? "Revenue (₱)" : "Orders"}
                </span>
              )}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="revenue"
            />
            <Line
              type="monotone"
              dataKey="orderCount"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: "#6366f1", strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
              name="orders"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats below chart */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:gap-4 border-t border-border pt-4">
        <div className="text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Total Revenue
          </p>
          <p className="mt-1 text-xl md:text-2xl font-black text-green-600">
            ₱
            {chartData
              .reduce((sum, day) => sum + day.revenue, 0)
              .toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Total Orders
          </p>
          <p className="mt-1 text-xl md:text-2xl font-black text-indigo-600">
            {chartData.reduce((sum, day) => sum + day.orderCount, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
