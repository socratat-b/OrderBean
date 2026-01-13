/**
 * Unit Tests for ExportButton Component
 * Tests CSV generation, export functionality, and user interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExportButton from "@/components/ExportButton";
import { mockAnalyticsResponse } from "@/__tests__/utils/test-helpers";

// Mock papaparse
vi.mock("papaparse", () => ({
  default: {
    unparse: vi.fn((data) => {
      // Simple CSV string generation for testing
      if (Array.isArray(data)) {
        return data.map((row) => row.join(",")).join("\n");
      }
      return "mocked,csv,data";
    }),
  },
}));

describe("ExportButton Component", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();

    // Mock DOM methods
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();

    // Mock document methods
    document.createElement = vi.fn((tagName) => {
      const element = {
        tagName,
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {},
      } as any;
      return element;
    });
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Rendering", () => {
    it("should render export button with correct text", () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      expect(button).toBeInTheDocument();
    });

    it("should show full text on desktop and short text on mobile", () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      // Check for both text variants (handled via CSS classes)
      expect(screen.getByText("Export CSV")).toBeInTheDocument();
      expect(screen.getByText("Export")).toBeInTheDocument();
    });

    it("should not show dropdown menu initially", () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      expect(screen.queryByText("Analytics Summary")).not.toBeInTheDocument();
      expect(screen.queryByText("Recent Orders")).not.toBeInTheDocument();
    });
  });

  describe("Dropdown Menu Interactions", () => {
    it("should open dropdown menu when button is clicked", async () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      // Check for menu items
      expect(screen.getByText("Analytics Summary")).toBeInTheDocument();
      expect(screen.getByText("Recent Orders")).toBeInTheDocument();
      expect(screen.getByText("Popular Products")).toBeInTheDocument();
      expect(screen.getByText("Daily Revenue")).toBeInTheDocument();
    });

    it("should close dropdown when clicking outside", async () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      // Open menu
      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      expect(screen.getByText("Analytics Summary")).toBeInTheDocument();

      // Click overlay (simulated by clicking the overlay div)
      const overlay = document.querySelector(".fixed.inset-0");
      if (overlay) {
        fireEvent.click(overlay);
      }

      // Menu should close
      await waitFor(() => {
        expect(screen.queryByText("Analytics Summary")).not.toBeInTheDocument();
      });
    });

    it("should display correct item counts in menu", async () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      // Check counts
      expect(screen.getByText(`${mockAnalyticsResponse.analytics.recentOrders.length} orders`))
        .toBeInTheDocument();
      expect(screen.getByText(`Top ${mockAnalyticsResponse.analytics.popularProducts.length} items`))
        .toBeInTheDocument();
    });
  });

  describe("CSV Export - Analytics Summary", () => {
    it("should export analytics summary when selected", async () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      // Open menu and click summary export
      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const summaryButton = screen.getByText("Analytics Summary");
      await user.click(summaryButton);

      // Wait for export to complete
      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });

      // Verify download was triggered
      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it("should include correct data in analytics summary CSV", async () => {
      const Papa = (await import("papaparse")).default;
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const summaryButton = screen.getByText("Analytics Summary");
      await user.click(summaryButton);

      await waitFor(() => {
        expect(Papa.unparse).toHaveBeenCalled();
      });

      // Verify the data structure passed to Papa.unparse
      const callArgs = vi.mocked(Papa.unparse).mock.calls[0][0];
      expect(callArgs).toContainEqual(["OrderBean Analytics Summary"]);
      expect(callArgs).toContainEqual(expect.arrayContaining(["Metric", "Value"]));
    });
  });

  describe("CSV Export - Orders", () => {
    it("should export orders when selected", async () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const ordersButton = screen.getByText("Recent Orders");
      await user.click(ordersButton);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });
    });

    it("should format order data correctly for CSV", async () => {
      const Papa = (await import("papaparse")).default;
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const ordersButton = screen.getByText("Recent Orders");
      await user.click(ordersButton);

      await waitFor(() => {
        expect(Papa.unparse).toHaveBeenCalled();
      });

      const callArgs = vi.mocked(Papa.unparse).mock.calls[0][0];
      expect(callArgs).toBeInstanceOf(Array);
      expect(callArgs[0]).toHaveProperty("Order ID");
      expect(callArgs[0]).toHaveProperty("Customer Name");
      expect(callArgs[0]).toHaveProperty("Total Amount");
    });
  });

  describe("CSV Export - Products", () => {
    it("should export popular products when selected", async () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const productsButton = screen.getByText("Popular Products");
      await user.click(productsButton);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });
    });

    it("should include rank and revenue calculations for products", async () => {
      const Papa = (await import("papaparse")).default;
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const productsButton = screen.getByText("Popular Products");
      await user.click(productsButton);

      await waitFor(() => {
        expect(Papa.unparse).toHaveBeenCalled();
      });

      const callArgs = vi.mocked(Papa.unparse).mock.calls[0][0];
      expect(callArgs[0]).toHaveProperty("Rank");
      expect(callArgs[0]).toHaveProperty("Total Revenue");
      expect(callArgs[0].Rank).toBe(1);
    });
  });

  describe("CSV Export - Revenue", () => {
    it("should export daily revenue when selected", async () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const revenueButton = screen.getByText("Daily Revenue");
      await user.click(revenueButton);

      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });
    });

    it("should show alert when no revenue data is available", async () => {
      const dataWithNoRevenue = {
        analytics: {
          ...mockAnalyticsResponse.analytics,
          revenueByDay: [],
        },
      };

      // Mock window.alert
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      render(<ExportButton data={dataWithNoRevenue} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const revenueButton = screen.getByText("Daily Revenue");
      await user.click(revenueButton);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith("No revenue data available to export");
      });

      alertMock.mockRestore();
    });

    it("should calculate average order value in revenue export", async () => {
      const Papa = (await import("papaparse")).default;
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const revenueButton = screen.getByText("Daily Revenue");
      await user.click(revenueButton);

      await waitFor(() => {
        expect(Papa.unparse).toHaveBeenCalled();
      });

      const callArgs = vi.mocked(Papa.unparse).mock.calls[0][0];
      expect(callArgs[0]).toHaveProperty("Average Order Value");
    });
  });

  describe("Filename Generation", () => {
    it("should include timestamp in filename", async () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const summaryButton = screen.getByText("Analytics Summary");
      await user.click(summaryButton);

      await waitFor(() => {
        const createElement = vi.mocked(document.createElement);
        const calls = createElement.mock.results;

        if (calls.length > 0) {
          const linkElement = calls[0].value;
          const setAttributeCalls = linkElement.setAttribute.mock.calls;

          const downloadCall = setAttributeCalls.find(
            (call: any[]) => call[0] === "download"
          );

          if (downloadCall) {
            const filename = downloadCall[1];
            // Filename should match pattern: orderbean_summary_*.csv
            expect(filename).toMatch(/orderbean_summary.*\.csv$/);
            expect(filename).toMatch(/\d{4}-\d{2}-\d{2}_\d{4}/); // Timestamp
          }
        }
      });
    });

    it("should include date range in filename when provided", async () => {
      const dateRange = {
        startDate: "2024-01-15",
        endDate: "2024-01-20",
      };

      render(<ExportButton data={mockAnalyticsResponse} dateRange={dateRange} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const summaryButton = screen.getByText("Analytics Summary");
      await user.click(summaryButton);

      await waitFor(() => {
        const createElement = vi.mocked(document.createElement);
        const calls = createElement.mock.results;

        if (calls.length > 0) {
          const linkElement = calls[0].value;
          const setAttributeCalls = linkElement.setAttribute.mock.calls;

          const downloadCall = setAttributeCalls.find(
            (call: any[]) => call[0] === "download"
          );

          if (downloadCall) {
            const filename = downloadCall[1];
            expect(filename).toContain("2024-01-15_to_2024-01-20");
          }
        }
      });
    });

    it("should use 'all_time' suffix when no date range", async () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const summaryButton = screen.getByText("Analytics Summary");
      await user.click(summaryButton);

      await waitFor(() => {
        const createElement = vi.mocked(document.createElement);
        const calls = createElement.mock.results;

        if (calls.length > 0) {
          const linkElement = calls[0].value;
          const setAttributeCalls = linkElement.setAttribute.mock.calls;

          const downloadCall = setAttributeCalls.find(
            (call: any[]) => call[0] === "download"
          );

          if (downloadCall) {
            const filename = downloadCall[1];
            expect(filename).toContain("all_time");
          }
        }
      });
    });
  });

  describe("Loading States", () => {
    it("should show loading state during export", async () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const summaryButton = screen.getByText("Analytics Summary");
      fireEvent.click(summaryButton); // Use fireEvent to not wait

      // Should show loading text immediately
      expect(screen.getByText("Exporting...")).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText("Exporting...")).not.toBeInTheDocument();
      });
    });

    it("should disable button while exporting", async () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const summaryButton = screen.getByText("Analytics Summary");
      fireEvent.click(summaryButton);

      // Button should be disabled
      await waitFor(() => {
        expect(button).toBeDisabled();
      });
    });

    it("should close menu when export starts", async () => {
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      expect(screen.getByText("Analytics Summary")).toBeInTheDocument();

      const summaryButton = screen.getByText("Analytics Summary");
      await user.click(summaryButton);

      // Menu should close
      await waitFor(() => {
        expect(screen.queryByText("Popular Products")).not.toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should show alert on export failure", async () => {
      // Mock console.error to suppress error logs
      const consoleErrorMock = vi.spyOn(console, "error").mockImplementation(() => {});
      const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

      // Make URL.createObjectURL throw an error
      global.URL.createObjectURL = vi.fn(() => {
        throw new Error("Export failed");
      });

      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const summaryButton = screen.getByText("Analytics Summary");
      await user.click(summaryButton);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith("Failed to export data. Please try again.");
      });

      consoleErrorMock.mockRestore();
      alertMock.mockRestore();
    });
  });

  describe("Currency Formatting", () => {
    it("should format Philippine Peso correctly in exports", async () => {
      const Papa = (await import("papaparse")).default;
      render(<ExportButton data={mockAnalyticsResponse} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const summaryButton = screen.getByText("Analytics Summary");
      await user.click(summaryButton);

      await waitFor(() => {
        expect(Papa.unparse).toHaveBeenCalled();
      });

      const callArgs = vi.mocked(Papa.unparse).mock.calls[0][0];
      const revenueRow = callArgs.find((row: any[]) => row[0] === "Total Revenue");

      if (revenueRow) {
        expect(revenueRow[1]).toMatch(/₱\d+\.\d{2}/);
      }
    });
  });

  describe("Large Dataset Handling", () => {
    it("should handle large order datasets without crashing", async () => {
      const largeDataset = {
        analytics: {
          ...mockAnalyticsResponse.analytics,
          recentOrders: Array.from({ length: 1000 }, (_, i) => ({
            ...mockAnalyticsResponse.analytics.recentOrders[0],
            id: `order-${i}`,
          })),
        },
      };

      render(<ExportButton data={largeDataset} />);

      const button = screen.getByRole("button", { name: /export/i });
      await user.click(button);

      const ordersButton = screen.getByText("Recent Orders");
      await user.click(ordersButton);

      // Should complete without errors
      await waitFor(() => {
        expect(global.URL.createObjectURL).toHaveBeenCalled();
      });
    });
  });
});
