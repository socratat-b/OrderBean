"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  startOfToday,
  startOfYesterday,
  endOfYesterday,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  format,
  parse,
  isValid,
} from "date-fns";

type DatePreset =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "custom"
  | "all";

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangePickerProps {
  onDateChange?: (startDate: Date | null, endDate: Date | null) => void;
}

export default function DateRangePicker({
  onDateChange,
}: DateRangePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>("all");
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [showCustomInputs, setShowCustomInputs] = useState(false);

  // Parse URL parameters on mount
  useEffect(() => {
    const startParam = searchParams.get("startDate");
    const endParam = searchParams.get("endDate");

    if (startParam && endParam) {
      const parsedStart = parse(startParam, "yyyy-MM-dd", new Date());
      const parsedEnd = parse(endParam, "yyyy-MM-dd", new Date());

      if (isValid(parsedStart) && isValid(parsedEnd)) {
        setDateRange({
          startDate: parsedStart,
          endDate: parsedEnd,
        });
        // Check if it matches a preset, otherwise set to custom
        const matchedPreset = matchPreset(parsedStart, parsedEnd);
        setSelectedPreset(matchedPreset);
        if (matchedPreset === "custom") {
          setShowCustomInputs(true);
        }
      }
    }
  }, []);

  // Match date range to preset
  const matchPreset = (start: Date, end: Date): DatePreset => {
    const today = startOfToday();
    const todayEnd = endOfDay(today);

    if (
      format(start, "yyyy-MM-dd") === format(today, "yyyy-MM-dd") &&
      format(end, "yyyy-MM-dd") === format(todayEnd, "yyyy-MM-dd")
    ) {
      return "today";
    }

    const yesterday = startOfYesterday();
    const yesterdayEnd = endOfYesterday();
    if (
      format(start, "yyyy-MM-dd") === format(yesterday, "yyyy-MM-dd") &&
      format(end, "yyyy-MM-dd") === format(yesterdayEnd, "yyyy-MM-dd")
    ) {
      return "yesterday";
    }

    const last7Start = startOfDay(subDays(today, 6));
    if (
      format(start, "yyyy-MM-dd") === format(last7Start, "yyyy-MM-dd") &&
      format(end, "yyyy-MM-dd") === format(todayEnd, "yyyy-MM-dd")
    ) {
      return "last7days";
    }

    const last30Start = startOfDay(subDays(today, 29));
    if (
      format(start, "yyyy-MM-dd") === format(last30Start, "yyyy-MM-dd") &&
      format(end, "yyyy-MM-dd") === format(todayEnd, "yyyy-MM-dd")
    ) {
      return "last30days";
    }

    const thisMonthStart = startOfMonth(today);
    const thisMonthEnd = endOfMonth(today);
    if (
      format(start, "yyyy-MM-dd") === format(thisMonthStart, "yyyy-MM-dd") &&
      format(end, "yyyy-MM-dd") === format(thisMonthEnd, "yyyy-MM-dd")
    ) {
      return "thisMonth";
    }

    const lastMonthStart = startOfMonth(subDays(today, 30));
    const lastMonthEnd = endOfMonth(subDays(today, 30));
    if (
      format(start, "yyyy-MM-dd") === format(lastMonthStart, "yyyy-MM-dd") &&
      format(end, "yyyy-MM-dd") === format(lastMonthEnd, "yyyy-MM-dd")
    ) {
      return "lastMonth";
    }

    return "custom";
  };

  // Update URL parameters
  const updateUrlParams = (start: Date | null, end: Date | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (start && end) {
      params.set("startDate", format(start, "yyyy-MM-dd"));
      params.set("endDate", format(end, "yyyy-MM-dd"));
    } else {
      params.delete("startDate");
      params.delete("endDate");
    }

    router.push(`?${params.toString()}`, { scroll: false });
  };

  // Handle preset selection
  const handlePresetChange = (preset: DatePreset) => {
    setSelectedPreset(preset);
    setShowCustomInputs(preset === "custom");

    let newRange: DateRange;
    const today = startOfToday();
    const todayEnd = endOfDay(today);

    switch (preset) {
      case "today":
        newRange = { startDate: today, endDate: todayEnd };
        break;
      case "yesterday":
        newRange = {
          startDate: startOfYesterday(),
          endDate: endOfYesterday(),
        };
        break;
      case "last7days":
        newRange = { startDate: startOfDay(subDays(today, 6)), endDate: todayEnd };
        break;
      case "last30days":
        newRange = { startDate: startOfDay(subDays(today, 29)), endDate: todayEnd };
        break;
      case "thisMonth":
        newRange = { startDate: startOfMonth(today), endDate: endOfMonth(today) };
        break;
      case "lastMonth":
        const lastMonth = subDays(today, 30);
        newRange = {
          startDate: startOfMonth(lastMonth),
          endDate: endOfMonth(lastMonth),
        };
        break;
      case "all":
        newRange = { startDate: null, endDate: null };
        break;
      case "custom":
        // Keep current range for custom
        return;
      default:
        newRange = { startDate: null, endDate: null };
    }

    setDateRange(newRange);
    updateUrlParams(newRange.startDate, newRange.endDate);
    onDateChange?.(newRange.startDate, newRange.endDate);
  };

  // Handle custom date input
  const handleCustomDateChange = (
    type: "start" | "end",
    value: string
  ) => {
    const parsedDate = parse(value, "yyyy-MM-dd", new Date());
    if (!isValid(parsedDate)) return;

    const newRange = {
      ...dateRange,
      [type === "start" ? "startDate" : "endDate"]: startOfDay(parsedDate),
    };

    setDateRange(newRange);

    // Only update URL and callback if both dates are set
    if (newRange.startDate && newRange.endDate) {
      updateUrlParams(newRange.startDate, newRange.endDate);
      onDateChange?.(newRange.startDate, newRange.endDate);
    }
  };

  // Handle clear filter
  const handleClear = () => {
    setSelectedPreset("all");
    setDateRange({ startDate: null, endDate: null });
    setShowCustomInputs(false);
    updateUrlParams(null, null);
    onDateChange?.(null, null);
  };

  const presets = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "last7days", label: "Last 7 Days" },
    { value: "last30days", label: "Last 30 Days" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "custom", label: "Custom Range" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6 shadow-md">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
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
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
            <h3 className="text-sm font-bold text-card-foreground md:text-base">
              Date Filter
            </h3>
          </div>
          {selectedPreset !== "all" && (
            <button
              onClick={handleClear}
              className="rounded-lg bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handlePresetChange(preset.value as DatePreset)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all md:text-sm ${
                selectedPreset === preset.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs */}
        {showCustomInputs && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label
                htmlFor="start-date"
                className="mb-1.5 block text-xs font-semibold text-muted-foreground"
              >
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={
                  dateRange.startDate
                    ? format(dateRange.startDate, "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) => handleCustomDateChange("start", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                className="mb-1.5 block text-xs font-semibold text-muted-foreground"
              >
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={
                  dateRange.endDate
                    ? format(dateRange.endDate, "yyyy-MM-dd")
                    : ""
                }
                onChange={(e) => handleCustomDateChange("end", e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        )}

        {/* Selected Range Display */}
        {dateRange.startDate && dateRange.endDate && (
          <div className="rounded-lg bg-primary/10 px-4 py-2 text-xs font-semibold text-primary md:text-sm">
            Showing data from{" "}
            {format(dateRange.startDate, "MMM dd, yyyy")} to{" "}
            {format(dateRange.endDate, "MMM dd, yyyy")}
          </div>
        )}
      </div>
    </div>
  );
}
