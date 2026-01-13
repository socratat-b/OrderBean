// Test utilities and helper functions for Phase 1 Admin Dashboard tests

import { UserRole, OrderStatus } from "@/app/generated/prisma";

/**
 * Mock session data for testing
 */
export const mockOwnerSession = {
  userId: "owner-user-id-123",
  role: "OWNER" as UserRole,
};

export const mockStaffSession = {
  userId: "staff-user-id-456",
  role: "STAFF" as UserRole,
};

export const mockCustomerSession = {
  userId: "customer-user-id-789",
  role: "CUSTOMER" as UserRole,
};

/**
 * Mock product data
 */
export const mockProduct = {
  id: "prod-1",
  name: "Americano",
  description: "Classic black coffee",
  price: 95,
  category: "Coffee",
  imageUrl: "https://example.com/americano.jpg",
  available: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export const mockProducts = [
  mockProduct,
  {
    id: "prod-2",
    name: "Latte",
    description: "Espresso with steamed milk",
    price: 120,
    category: "Coffee",
    imageUrl: "https://example.com/latte.jpg",
    available: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "prod-3",
    name: "Cappuccino",
    description: "Espresso with foamed milk",
    price: 115,
    category: "Coffee",
    imageUrl: "https://example.com/cappuccino.jpg",
    available: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

/**
 * Mock order data
 */
export const mockOrder = {
  id: "order-1",
  userId: "customer-user-id-789",
  status: "COMPLETED" as OrderStatus,
  total: 215,
  createdAt: new Date("2024-01-15T10:30:00Z"),
  updatedAt: new Date("2024-01-15T11:00:00Z"),
  user: {
    name: "John Doe",
    email: "john@example.com",
  },
  orderItems: [
    {
      id: "item-1",
      orderId: "order-1",
      productId: "prod-1",
      quantity: 2,
      price: 95,
      product: {
        name: "Americano",
      },
    },
    {
      id: "item-2",
      orderId: "order-1",
      productId: "prod-2",
      quantity: 1,
      price: 120,
      product: {
        name: "Latte",
      },
    },
  ],
};

export const mockOrders = [
  mockOrder,
  {
    id: "order-2",
    userId: "customer-user-id-789",
    status: "PENDING" as OrderStatus,
    total: 330,
    createdAt: new Date("2024-01-16T14:20:00Z"),
    updatedAt: new Date("2024-01-16T14:20:00Z"),
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
    },
    orderItems: [
      {
        id: "item-3",
        orderId: "order-2",
        productId: "prod-2",
        quantity: 2,
        price: 120,
        product: {
          name: "Latte",
        },
      },
      {
        id: "item-4",
        orderId: "order-2",
        productId: "prod-1",
        quantity: 1,
        price: 95,
        product: {
          name: "Americano",
        },
        },
    ],
  },
];

/**
 * Mock analytics data
 */
export const mockAnalyticsResponse = {
  success: true,
  analytics: {
    totalOrders: 10,
    totalRevenue: 2150,
    ordersChange: 25.5,
    revenueChange: 15.3,
    ordersByStatus: [
      { status: "COMPLETED", count: 6 },
      { status: "PENDING", count: 2 },
      { status: "PREPARING", count: 1 },
      { status: "READY", count: 1 },
    ],
    popularProducts: [
      {
        product: mockProduct,
        totalQuantitySold: 25,
        orderCount: 10,
      },
      {
        product: mockProducts[1],
        totalQuantitySold: 20,
        orderCount: 8,
      },
    ],
    recentOrders: mockOrders,
    revenueByDay: [
      { date: "2024-01-15", revenue: 750, orderCount: 3 },
      { date: "2024-01-16", revenue: 650, orderCount: 2 },
      { date: "2024-01-17", revenue: 500, orderCount: 2 },
      { date: "2024-01-18", revenue: 250, orderCount: 1 },
    ],
  },
};

/**
 * Helper to create a mock NextRequest
 */
export function createMockNextRequest(
  url: string,
  method: string = "GET",
  body?: Record<string, unknown>
): Request {
  return new Request(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

/**
 * Helper to parse NextResponse
 */
export async function parseNextResponse(response: Response) {
  return {
    status: response.status,
    data: await response.json(),
  };
}

/**
 * Mock Prisma client with chainable query methods
 */
export function createMockPrismaClient() {
  return {
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
  };
}

/**
 * Date helper for consistent test dates
 */
export const testDates = {
  today: new Date("2024-01-20T12:00:00Z"),
  yesterday: new Date("2024-01-19T12:00:00Z"),
  lastWeek: new Date("2024-01-13T12:00:00Z"),
  lastMonth: new Date("2023-12-20T12:00:00Z"),
};

/**
 * Helper to format currency for tests
 */
export function formatCurrency(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}

/**
 * Helper to create mock revenue data for chart testing
 */
export function createMockRevenueData(days: number = 7) {
  const data = [];
  const baseDate = new Date("2024-01-14");

  for (let i = 0; i < days; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    data.push({
      date: date.toISOString().split("T")[0],
      revenue: Math.random() * 1000 + 500, // Random revenue between 500-1500
      orderCount: Math.floor(Math.random() * 10) + 1, // Random orders 1-10
    });
  }

  return data;
}

/**
 * Helper to wait for async operations in tests
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Helper to create mock CSV blob for testing
 */
export function createMockCSVData(headers: string[], rows: string[][]): string {
  const csvRows = [headers.join(","), ...rows.map((row) => row.join(","))];
  return csvRows.join("\n");
}
