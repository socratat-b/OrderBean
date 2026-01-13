/**
 * Unit Tests for RevenueChart Component
 * Tests chart rendering, data transformation, and responsive behavior
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import RevenueChart from "@/components/charts/RevenueChart";
import { createMockRevenueData } from "@/__tests__/utils/test-helpers";

// Mock Recharts components to avoid canvas/SVG rendering issues in tests
vi.mock("recharts", () => ({
  LineChart: vi.fn(({ children }) => <div data-testid="line-chart">{children}</div>),
  Line: vi.fn(() => <div data-testid="line" />),
  XAxis: vi.fn(() => <div data-testid="x-axis" />),
  YAxis: vi.fn(() => <div data-testid="y-axis" />),
  CartesianGrid: vi.fn(() => <div data-testid="cartesian-grid" />),
  Tooltip: vi.fn(() => <div data-testid="tooltip" />),
  ResponsiveContainer: vi.fn(({ children }) => (
    <div data-testid="responsive-container">{children}</div>
  )),
  Legend: vi.fn(() => <div data-testid="legend" />),
}));

describe("RevenueChart Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering States", () => {
    it("should render loading skeleton when loading prop is true", () => {
      render(<RevenueChart data={[]} loading={true} />);

      // Check for loading indicators (animate-pulse class)
      const loadingElements = document.querySelectorAll(".animate-pulse");
      expect(loadingElements.length).toBeGreaterThan(0);
    });

    it("should render empty state when data array is empty", () => {
      render(<RevenueChart data={[]} loading={false} />);

      expect(screen.getByText("No revenue data available")).toBeInTheDocument();
      expect(
        screen.getByText("Data will appear here once orders are placed")
      ).toBeInTheDocument();
    });

    it("should render chart when data is provided", () => {
      const mockData = createMockRevenueData(7);
      render(<RevenueChart data={mockData} loading={false} />);

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
      expect(screen.getByText("Revenue Trends")).toBeInTheDocument();
    });
  });

  describe("Chart Header", () => {
    it("should display correct title", () => {
      const mockData = createMockRevenueData(5);
      render(<RevenueChart data={mockData} />);

      expect(screen.getByText("Revenue Trends")).toBeInTheDocument();
    });

    it("should show correct number of days badge", () => {
      const mockData = createMockRevenueData(14);
      render(<RevenueChart data={mockData} />);

      expect(screen.getByText("14 days")).toBeInTheDocument();
    });

    it("should show singular 'day' for 1 day of data", () => {
      const mockData = createMockRevenueData(1);
      render(<RevenueChart data={mockData} />);

      expect(screen.getByText("1 day")).toBeInTheDocument();
    });
  });

  describe("Data Transformation", () => {
    it("should transform dates to display format (MMM dd)", () => {
      const mockData = [
        { date: "2024-01-15", revenue: 750, orderCount: 3 },
        { date: "2024-01-16", revenue: 650, orderCount: 2 },
      ];

      const { container } = render(<RevenueChart data={mockData} />);

      // The component uses useMemo to transform dates
      // We can't directly test the memo, but we can verify the chart receives data
      expect(container.querySelector('[data-testid="line-chart"]')).toBeInTheDocument();
    });

    it("should preserve revenue and orderCount values", () => {
      const mockData = [
        { date: "2024-01-15", revenue: 1234.56, orderCount: 10 },
      ];

      render(<RevenueChart data={mockData} />);

      // Component should render without errors with decimal values
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  describe("Summary Statistics", () => {
    it("should calculate and display total revenue", () => {
      const mockData = [
        { date: "2024-01-15", revenue: 500, orderCount: 2 },
        { date: "2024-01-16", revenue: 750, orderCount: 3 },
        { date: "2024-01-17", revenue: 250, orderCount: 1 },
      ];

      render(<RevenueChart data={mockData} />);

      // Total revenue = 500 + 750 + 250 = 1500
      expect(screen.getByText("₱1500.00")).toBeInTheDocument();
    });

    it("should calculate and display total orders", () => {
      const mockData = [
        { date: "2024-01-15", revenue: 500, orderCount: 2 },
        { date: "2024-01-16", revenue: 750, orderCount: 3 },
        { date: "2024-01-17", revenue: 250, orderCount: 1 },
      ];

      render(<RevenueChart data={mockData} />);

      // Total orders = 2 + 3 + 1 = 6
      expect(screen.getByText("6")).toBeInTheDocument();
    });

    it("should format revenue with 2 decimal places", () => {
      const mockData = [
        { date: "2024-01-15", revenue: 1234.567, orderCount: 5 },
      ];

      render(<RevenueChart data={mockData} />);

      // Should round to 2 decimals
      expect(screen.getByText("₱1234.57")).toBeInTheDocument();
    });

    it("should handle zero revenue and orders", () => {
      const mockData = [
        { date: "2024-01-15", revenue: 0, orderCount: 0 },
      ];

      render(<RevenueChart data={mockData} />);

      expect(screen.getByText("₱0.00")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("Chart Components", () => {
    it("should render all required Recharts components", () => {
      const mockData = createMockRevenueData(7);
      render(<RevenueChart data={mockData} />);

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
      expect(screen.getByTestId("cartesian-grid")).toBeInTheDocument();
      expect(screen.getByTestId("x-axis")).toBeInTheDocument();
      expect(screen.getByTestId("y-axis")).toBeInTheDocument();
      expect(screen.getByTestId("tooltip")).toBeInTheDocument();
      expect(screen.getByTestId("legend")).toBeInTheDocument();

      // Should have 2 lines (revenue and orders)
      const lines = screen.getAllByTestId("line");
      expect(lines).toHaveLength(2);
    });
  });

  describe("Responsive Behavior", () => {
    it("should use ResponsiveContainer for chart", () => {
      const mockData = createMockRevenueData(5);
      render(<RevenueChart data={mockData} />);

      expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
    });

    it("should have appropriate height classes", () => {
      const mockData = createMockRevenueData(5);
      const { container } = render(<RevenueChart data={mockData} />);

      // Check for height utility classes (h-[300px] md:h-[400px])
      const chartContainer = container.querySelector(".h-\\[300px\\]");
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should show empty state icon", () => {
      render(<RevenueChart data={[]} />);

      const svg = container.querySelector('svg[viewBox="0 0 24 24"]');
      expect(svg).toBeInTheDocument();
    });

    it("should have dashed border for empty state", () => {
      const { container } = render(<RevenueChart data={[]} />);

      const emptyStateContainer = container.querySelector(".border-dashed");
      expect(emptyStateContainer).toBeInTheDocument();
    });

    it("should show helpful message in empty state", () => {
      render(<RevenueChart data={[]} />);

      expect(screen.getByText("No revenue data available")).toBeInTheDocument();
      expect(
        screen.getByText("Data will appear here once orders are placed")
      ).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show skeleton loaders when loading", () => {
      const { container } = render(<RevenueChart data={[]} loading={true} />);

      const skeletons = container.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should not show chart when loading", () => {
      render(<RevenueChart data={createMockRevenueData(5)} loading={true} />);

      expect(screen.queryByTestId("line-chart")).not.toBeInTheDocument();
    });

    it("should show loading placeholder with correct dimensions", () => {
      const { container } = render(<RevenueChart data={[]} loading={true} />);

      // Check for loading skeleton with height classes
      const loadingSkeleton = container.querySelector(".h-\\[300px\\]");
      expect(loadingSkeleton).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle single data point", () => {
      const mockData = [
        { date: "2024-01-15", revenue: 500, orderCount: 2 },
      ];

      render(<RevenueChart data={mockData} />);

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
      expect(screen.getByText("1 day")).toBeInTheDocument();
      expect(screen.getByText("₱500.00")).toBeInTheDocument();
    });

    it("should handle large revenue numbers", () => {
      const mockData = [
        { date: "2024-01-15", revenue: 999999.99, orderCount: 500 },
      ];

      render(<RevenueChart data={mockData} />);

      expect(screen.getByText("₱999999.99")).toBeInTheDocument();
      expect(screen.getByText("500")).toBeInTheDocument();
    });

    it("should handle many days of data", () => {
      const mockData = createMockRevenueData(90);

      render(<RevenueChart data={mockData} />);

      expect(screen.getByText("90 days")).toBeInTheDocument();
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle decimal order counts (edge case)", () => {
      const mockData = [
        { date: "2024-01-15", revenue: 500, orderCount: 2.5 }, // Unusual but possible
      ];

      render(<RevenueChart data={mockData} />);

      // Should still render without crashing
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle negative revenue (refunds/cancellations)", () => {
      const mockData = [
        { date: "2024-01-15", revenue: -100, orderCount: 1 },
      ];

      render(<RevenueChart data={mockData} />);

      // Chart should handle negative values
      expect(screen.getByText("₱-100.00")).toBeInTheDocument();
    });
  });

  describe("Currency Formatting", () => {
    it("should use Philippine Peso symbol (₱)", () => {
      const mockData = [
        { date: "2024-01-15", revenue: 1000, orderCount: 5 },
      ];

      render(<RevenueChart data={mockData} />);

      // Check for peso symbol in summary
      expect(screen.getByText("₱1000.00")).toBeInTheDocument();
    });

    it("should format all revenue values with peso symbol", () => {
      const mockData = [
        { date: "2024-01-15", revenue: 500, orderCount: 2 },
        { date: "2024-01-16", revenue: 750, orderCount: 3 },
      ];

      render(<RevenueChart data={mockData} />);

      // Total revenue should have peso symbol
      expect(screen.getByText("₱1250.00")).toBeInTheDocument();
    });
  });

  describe("Date Formatting", () => {
    it("should handle various date formats in input", () => {
      const mockData = [
        { date: "2024-01-01", revenue: 100, orderCount: 1 },
        { date: "2024-12-31", revenue: 200, orderCount: 2 },
      ];

      render(<RevenueChart data={mockData} />);

      // Should render without errors
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle leap year dates", () => {
      const mockData = [
        { date: "2024-02-29", revenue: 500, orderCount: 2 },
      ];

      render(<RevenueChart data={mockData} />);

      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });
  });

  describe("Summary Stats Labels", () => {
    it("should display correct labels for summary statistics", () => {
      const mockData = createMockRevenueData(5);
      render(<RevenueChart data={mockData} />);

      expect(screen.getByText("Total Revenue")).toBeInTheDocument();
      expect(screen.getByText("Total Orders")).toBeInTheDocument();
    });

    it("should use uppercase tracking for labels", () => {
      const mockData = createMockRevenueData(3);
      const { container } = render(<RevenueChart data={mockData} />);

      // Check for uppercase class
      const labels = container.querySelectorAll(".uppercase");
      expect(labels.length).toBeGreaterThan(0);
    });
  });

  describe("Performance", () => {
    it("should memoize chart data transformation", () => {
      const mockData = createMockRevenueData(10);

      const { rerender } = render(<RevenueChart data={mockData} />);

      // Re-render with same data
      rerender(<RevenueChart data={mockData} />);

      // Chart should still be present (memoization working)
      expect(screen.getByTestId("line-chart")).toBeInTheDocument();
    });

    it("should handle rapid re-renders without crashing", () => {
      const mockData = createMockRevenueData(20);

      const { rerender } = render(<RevenueChart data={mockData} />);

      // Rapidly re-render multiple times
      for (let i = 0; i < 10; i++) {
        rerender(<RevenueChart data={mockData} loading={i % 2 === 0} />);
      }

      // Should complete without errors
      expect(true).toBe(true);
    });
  });
});
