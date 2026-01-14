// hooks/useOwnerAnalytics.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useOwnerOrdersSSE } from "@/hooks/useOwnerOrdersSSE";
import { Analytics } from "@/types/owner";

export function useOwnerAnalytics() {
  const searchParams = useSearchParams();

  // Check if we have cached data
  const getCachedAnalytics = () => {
    if (typeof window === "undefined") return null;
    const cached = sessionStorage.getItem("owner_analytics");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return null;
  };

  const cachedAnalytics = getCachedAnalytics();

  // Extract date params
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  // State
  const [analytics, setAnalytics] = useState<Analytics | null>(cachedAnalytics);
  const [initialLoading, setInitialLoading] = useState(!cachedAnalytics);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const hasFetchedRef = useRef(false);

  // Fetch analytics function
  const fetchAnalytics = useCallback(
    async (isInitial = false) => {
      // Only fetch if we haven't already or if this is a manual refresh
      if (isInitial && hasFetchedRef.current && cachedAnalytics) {
        setAnalytics(cachedAnalytics);
        setInitialLoading(false);
        return;
      }

      try {
        if (isInitial) {
          setInitialLoading(true);
        } else {
          setRefreshing(true);
        }

        const queryParams = new URLSearchParams();
        if (startDateParam) queryParams.set("startDate", startDateParam);
        if (endDateParam) queryParams.set("endDate", endDateParam);
        const queryString = queryParams.toString();
        const url = queryString
          ? `/api/owner/analytics?${queryString}`
          : "/api/owner/analytics";

        const response = await fetch(url, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error("Access denied. Owner role required.");
          }
          throw new Error("Failed to fetch analytics");
        }

        const data = await response.json();
        setAnalytics(data);

        // Cache the data in sessionStorage
        if (typeof window !== "undefined") {
          sessionStorage.setItem("owner_analytics", JSON.stringify(data));
        }

        setError("");
        hasFetchedRef.current = true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
      }
    },
    [startDateParam, endDateParam, cachedAnalytics]
  );

  // Connect to SSE for real-time updates
  const { isConnected } = useOwnerOrdersSSE((event) => {
    console.log("[useOwnerAnalytics] SSE event received:", event);
    // Refresh analytics when order events occur
    if (event.type === "order_created" || event.type === "order_updated") {
      fetchAnalytics(false);
    }
  });

  // Mount effect
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch on mount and when date params change
  useEffect(() => {
    if (mounted) {
      fetchAnalytics(true);
    }
  }, [mounted, startDateParam, endDateParam, fetchAnalytics]);

  return {
    analytics,
    initialLoading,
    refreshing,
    error,
    mounted,
    isConnected,
    fetchAnalytics,
    searchParams,
  };
}
