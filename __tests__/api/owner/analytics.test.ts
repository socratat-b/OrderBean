/**
 * Unit Tests for /api/owner/analytics route
 * Tests date filtering, period comparison, and role-based access control
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  mockOwnerSession,
  mockStaffSession,
  mockCustomerSession,
  mockAnalyticsResponse,
  mockOrders,
  mockProducts,
  createMockNextRequest,
  parseNextResponse,
} from "@/__tests__/utils/test-helpers";

// Mock dependencies BEFORE importing the modules that use them
vi.mock("@/lib/dal", () => ({
  getSession: vi.fn(),
  verifySession: vi.fn(),
  getCurrentUser: vi.fn(),
  getUser: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      count: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    orderItem: {
      groupBy: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  },
}));

// Import after mocks are set up
import { GET } from "@/app/api/owner/analytics/route";
import * as dal from "@/lib/dal";
import { prisma } from "@/lib/prisma";

describe("GET /api/owner/analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Authentication & Authorization", () => {
    it("should return 401 when user is not authenticated", async () => {
      vi.mocked(dal.getSession).mockResolvedValue(null);

      const request = createMockNextRequest("http://localhost:3000/api/owner/analytics");
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(401);
      expect(result.data).toEqual({ error: "Unauthorized" });
    });

    it("should return 403 when user is not OWNER role", async () => {
      vi.mocked(dal.getSession).mockResolvedValue(mockStaffSession);

      const request = createMockNextRequest("http://localhost:3000/api/owner/analytics");
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(403);
      expect(result.data).toEqual({ error: "Forbidden - Owner access required" });
    });

    it("should return 403 when user is CUSTOMER role", async () => {
      vi.mocked(dal.getSession).mockResolvedValue(mockCustomerSession);

      const request = createMockNextRequest("http://localhost:3000/api/owner/analytics");
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(403);
      expect(result.data.error).toContain("Owner access required");
    });

    it("should allow access for OWNER role", async () => {
      vi.mocked(dal.getSession).mockResolvedValue(mockOwnerSession);

      // Mock empty data to prevent errors
      vi.mocked(prisma.order.count).mockResolvedValue(0);
      vi.mocked(prisma.order.aggregate).mockResolvedValue({
        _sum: { total: null },
        _avg: {},
        _count: {},
        _max: {},
        _min: {},
      });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

      const request = createMockNextRequest("http://localhost:3000/api/owner/analytics");
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(200);
      expect(result.data.success).toBe(true);
    });
  });

  describe("Date Filtering - All Time (No Parameters)", () => {
    beforeEach(() => {
      vi.mocked(dal.getSession).mockResolvedValue(mockOwnerSession);
    });

    it("should return all-time analytics when no date parameters provided", async () => {
      // Mock Prisma responses for all-time data
      vi.mocked(prisma.order.count).mockResolvedValueOnce(10).mockResolvedValueOnce(8);
      vi.mocked(prisma.order.aggregate)
        .mockResolvedValueOnce({
          _sum: { total: 2150 },
          _avg: {},
          _count: {},
          _max: {},
          _min: {},
        })
        .mockResolvedValueOnce({
          _sum: { total: 1865 },
          _avg: {},
          _count: {},
          _max: {},
          _min: {},
        });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([
        { status: "COMPLETED", _count: { id: 6 } },
        { status: "PENDING", _count: { id: 4 } },
      ] as any);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

      const request = createMockNextRequest("http://localhost:3000/api/owner/analytics");
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(200);
      expect(result.data.analytics.totalOrders).toBe(10);
      expect(result.data.analytics.totalRevenue).toBe(2150);
      expect(result.data.analytics.ordersChange).toBeCloseTo(25, 1);

      // Verify no date filter was applied (empty where clause)
      expect(prisma.order.count).toHaveBeenCalledWith({ where: {} });
    });
  });

  describe("Date Filtering - With Date Range", () => {
    beforeEach(() => {
      vi.mocked(dal.getSession).mockResolvedValue(mockOwnerSession);
    });

    it("should filter analytics by provided date range", async () => {
      const startDate = "2024-01-15";
      const endDate = "2024-01-20";

      vi.mocked(prisma.order.count).mockResolvedValueOnce(5).mockResolvedValueOnce(3);
      vi.mocked(prisma.order.aggregate)
        .mockResolvedValueOnce({
          _sum: { total: 1250 },
          _avg: {},
          _count: {},
          _max: {},
          _min: {},
        })
        .mockResolvedValueOnce({
          _sum: { total: 750 },
          _avg: {},
          _count: {},
          _max: {},
          _min: {},
        });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([
        { date: new Date("2024-01-15"), revenue: 400, orderCount: 2 },
        { date: new Date("2024-01-16"), revenue: 350, orderCount: 1 },
        { date: new Date("2024-01-17"), revenue: 500, orderCount: 2 },
      ]);

      const request = createMockNextRequest(
        `http://localhost:3000/api/owner/analytics?startDate=${startDate}&endDate=${endDate}`
      );
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(200);
      expect(result.data.analytics.totalOrders).toBe(5);
      expect(result.data.analytics.totalRevenue).toBe(1250);

      // Verify date filter was applied
      const callArgs = vi.mocked(prisma.order.count).mock.calls[0][0];
      expect(callArgs?.where).toHaveProperty("createdAt");
      expect(callArgs?.where?.createdAt).toHaveProperty("gte");
      expect(callArgs?.where?.createdAt).toHaveProperty("lte");
    });

    it("should calculate correct period comparison percentages", async () => {
      const startDate = "2024-01-15";
      const endDate = "2024-01-20";

      // Current period: 10 orders, ₱2000 revenue
      // Previous period: 8 orders, ₱1600 revenue
      // Expected change: +25% orders, +25% revenue
      vi.mocked(prisma.order.count).mockResolvedValueOnce(10).mockResolvedValueOnce(8);
      vi.mocked(prisma.order.aggregate)
        .mockResolvedValueOnce({
          _sum: { total: 2000 },
          _avg: {},
          _count: {},
          _max: {},
          _min: {},
        })
        .mockResolvedValueOnce({
          _sum: { total: 1600 },
          _avg: {},
          _count: {},
          _max: {},
          _min: {},
        });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

      const request = createMockNextRequest(
        `http://localhost:3000/api/owner/analytics?startDate=${startDate}&endDate=${endDate}`
      );
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(200);
      expect(result.data.analytics.ordersChange).toBe(25); // (10-8)/8 * 100 = 25%
      expect(result.data.analytics.revenueChange).toBe(25); // (2000-1600)/1600 * 100 = 25%
    });

    it("should handle 100% increase when previous period has no data", async () => {
      const startDate = "2024-01-15";
      const endDate = "2024-01-20";

      // Current period has data, previous period has none
      vi.mocked(prisma.order.count).mockResolvedValueOnce(5).mockResolvedValueOnce(0);
      vi.mocked(prisma.order.aggregate)
        .mockResolvedValueOnce({
          _sum: { total: 1000 },
          _avg: {},
          _count: {},
          _max: {},
          _min: {},
        })
        .mockResolvedValueOnce({
          _sum: { total: 0 },
          _avg: {},
          _count: {},
          _max: {},
          _min: {},
        });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

      const request = createMockNextRequest(
        `http://localhost:3000/api/owner/analytics?startDate=${startDate}&endDate=${endDate}`
      );
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(200);
      expect(result.data.analytics.ordersChange).toBe(100);
      expect(result.data.analytics.revenueChange).toBe(100);
    });

    it("should handle negative change (decrease in orders/revenue)", async () => {
      const startDate = "2024-01-15";
      const endDate = "2024-01-20";

      // Current period: 6 orders, ₱1200 revenue
      // Previous period: 10 orders, ₱2000 revenue
      // Expected change: -40% orders, -40% revenue
      vi.mocked(prisma.order.count).mockResolvedValueOnce(6).mockResolvedValueOnce(10);
      vi.mocked(prisma.order.aggregate)
        .mockResolvedValueOnce({
          _sum: { total: 1200 },
          _avg: {},
          _count: {},
          _max: {},
          _min: {},
        })
        .mockResolvedValueOnce({
          _sum: { total: 2000 },
          _avg: {},
          _count: {},
          _max: {},
          _min: {},
        });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

      const request = createMockNextRequest(
        `http://localhost:3000/api/owner/analytics?startDate=${startDate}&endDate=${endDate}`
      );
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(200);
      expect(result.data.analytics.ordersChange).toBe(-40);
      expect(result.data.analytics.revenueChange).toBe(-40);
    });
  });

  describe("Edge Cases - Date Filtering", () => {
    beforeEach(() => {
      vi.mocked(dal.getSession).mockResolvedValue(mockOwnerSession);
    });

    it("should handle invalid date format gracefully", async () => {
      vi.mocked(prisma.order.count).mockResolvedValue(0);
      vi.mocked(prisma.order.aggregate).mockResolvedValue({
        _sum: { total: null },
        _avg: {},
        _count: {},
        _max: {},
        _min: {},
      });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

      const request = createMockNextRequest(
        "http://localhost:3000/api/owner/analytics?startDate=invalid&endDate=also-invalid"
      );
      const response = await GET(request as any);

      // Should not crash, may treat as invalid and fall back to all-time
      expect(response.status).toBeLessThan(500);
    });

    it("should handle only startDate parameter (missing endDate)", async () => {
      vi.mocked(prisma.order.count).mockResolvedValue(0);
      vi.mocked(prisma.order.aggregate).mockResolvedValue({
        _sum: { total: null },
        _avg: {},
        _count: {},
        _max: {},
        _min: {},
      });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

      const request = createMockNextRequest(
        "http://localhost:3000/api/owner/analytics?startDate=2024-01-15"
      );
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      // Should ignore partial date range and return all-time data
      expect(result.status).toBe(200);
    });

    it("should handle future dates without crashing", async () => {
      const futureStart = "2030-01-01";
      const futureEnd = "2030-12-31";

      vi.mocked(prisma.order.count).mockResolvedValue(0);
      vi.mocked(prisma.order.aggregate).mockResolvedValue({
        _sum: { total: null },
        _avg: {},
        _count: {},
        _max: {},
        _min: {},
      });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

      const request = createMockNextRequest(
        `http://localhost:3000/api/owner/analytics?startDate=${futureStart}&endDate=${futureEnd}`
      );
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(200);
      expect(result.data.analytics.totalOrders).toBe(0);
      expect(result.data.analytics.totalRevenue).toBe(0);
    });

    it("should handle empty date range (startDate === endDate)", async () => {
      const sameDate = "2024-01-15";

      vi.mocked(prisma.order.count).mockResolvedValue(2);
      vi.mocked(prisma.order.aggregate).mockResolvedValue({
        _sum: { total: 450 },
        _avg: {},
        _count: {},
        _max: {},
        _min: {},
      });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([
        { date: new Date(sameDate), revenue: 450, orderCount: 2 },
      ]);

      const request = createMockNextRequest(
        `http://localhost:3000/api/owner/analytics?startDate=${sameDate}&endDate=${sameDate}`
      );
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(200);
      expect(result.data.analytics.totalOrders).toBe(2);
    });
  });

  describe("Response Data Structure", () => {
    beforeEach(() => {
      vi.mocked(dal.getSession).mockResolvedValue(mockOwnerSession);
    });

    it("should return complete analytics structure", async () => {
      vi.mocked(prisma.order.count).mockResolvedValue(10);
      vi.mocked(prisma.order.aggregate).mockResolvedValue({
        _sum: { total: 2150 },
        _avg: {},
        _count: {},
        _max: {},
        _min: {},
      });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([
        { status: "COMPLETED", _count: { id: 6 } },
        { status: "PENDING", _count: { id: 2 } },
      ] as any);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([
        {
          productId: "prod-1",
          _sum: { quantity: 25 },
          _count: { id: 10 },
        },
      ] as any);
      vi.mocked(prisma.product.findMany).mockResolvedValue([mockProducts[0]]);
      vi.mocked(prisma.order.findMany).mockResolvedValue(mockOrders);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([
        { date: new Date("2024-01-15"), revenue: 750, orderCount: 3 },
      ]);

      const request = createMockNextRequest("http://localhost:3000/api/owner/analytics");
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(200);
      expect(result.data).toHaveProperty("success", true);
      expect(result.data).toHaveProperty("analytics");
      expect(result.data.analytics).toHaveProperty("totalOrders");
      expect(result.data.analytics).toHaveProperty("totalRevenue");
      expect(result.data.analytics).toHaveProperty("ordersChange");
      expect(result.data.analytics).toHaveProperty("revenueChange");
      expect(result.data.analytics).toHaveProperty("ordersByStatus");
      expect(result.data.analytics).toHaveProperty("popularProducts");
      expect(result.data.analytics).toHaveProperty("recentOrders");
      expect(result.data.analytics).toHaveProperty("revenueByDay");
    });

    it("should format revenueByDay dates as YYYY-MM-DD strings", async () => {
      vi.mocked(prisma.order.count).mockResolvedValue(0);
      vi.mocked(prisma.order.aggregate).mockResolvedValue({
        _sum: { total: null },
        _avg: {},
        _count: {},
        _max: {},
        _min: {},
      });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([
        { date: new Date("2024-01-15T10:30:00Z"), revenue: 750, orderCount: 3 },
        { date: new Date("2024-01-16T14:20:00Z"), revenue: 650, orderCount: 2 },
      ]);

      const request = createMockNextRequest("http://localhost:3000/api/owner/analytics");
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(200);
      expect(result.data.analytics.revenueByDay).toHaveLength(2);
      expect(result.data.analytics.revenueByDay[0].date).toBe("2024-01-15");
      expect(result.data.analytics.revenueByDay[1].date).toBe("2024-01-16");
    });

    it("should round percentage changes to 1 decimal place", async () => {
      // Set up precise calculations: 7 current, 5 previous = 40% increase
      vi.mocked(prisma.order.count).mockResolvedValueOnce(7).mockResolvedValueOnce(5);
      vi.mocked(prisma.order.aggregate)
        .mockResolvedValueOnce({
          _sum: { total: 1750.5555 },
          _avg: {},
          _count: {},
          _max: {},
          _min: {},
        })
        .mockResolvedValueOnce({
          _sum: { total: 1250 },
          _avg: {},
          _count: {},
          _max: {},
          _min: {},
        });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

      const request = createMockNextRequest(
        "http://localhost:3000/api/owner/analytics?startDate=2024-01-15&endDate=2024-01-20"
      );
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(200);
      expect(result.data.analytics.ordersChange).toBe(40); // Exactly 40, not 40.0
      expect(result.data.analytics.revenueChange).toBe(40); // Rounded to 1 decimal
    });
  });

  describe("Error Handling", () => {
    beforeEach(() => {
      vi.mocked(dal.getSession).mockResolvedValue(mockOwnerSession);
    });

    it("should return 500 when database query fails", async () => {
      vi.mocked(prisma.order.count).mockRejectedValue(new Error("Database connection failed"));

      const request = createMockNextRequest("http://localhost:3000/api/owner/analytics");
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(500);
      expect(result.data).toEqual({ error: "Failed to fetch analytics" });
    });

    it("should handle null revenue gracefully", async () => {
      vi.mocked(prisma.order.count).mockResolvedValue(5);
      vi.mocked(prisma.order.aggregate).mockResolvedValue({
        _sum: { total: null }, // No revenue (all orders cancelled?)
        _avg: {},
        _count: {},
        _max: {},
        _min: {},
      });
      vi.mocked(prisma.order.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.orderItem.groupBy).mockResolvedValue([]);
      vi.mocked(prisma.product.findMany).mockResolvedValue([]);
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);
      vi.mocked(prisma.$queryRaw).mockResolvedValue([]);

      const request = createMockNextRequest("http://localhost:3000/api/owner/analytics");
      const response = await GET(request as any);
      const result = await parseNextResponse(response);

      expect(result.status).toBe(200);
      expect(result.data.analytics.totalRevenue).toBe(0);
    });
  });
});
