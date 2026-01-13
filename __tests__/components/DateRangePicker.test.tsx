/**
 * Unit Tests for DateRangePicker Component
 * Tests preset selection, custom date input, URL parameter handling
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DateRangePicker from "@/components/DateRangePicker";

// Mock Next.js navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("DateRangePicker Component", () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    mockSearchParams.delete("startDate");
    mockSearchParams.delete("endDate");
  });

  describe("Rendering", () => {
    it("should render date filter component", () => {
      render(<DateRangePicker />);

      expect(screen.getByText("Date Filter")).toBeInTheDocument();
    });

    it("should render all preset buttons", () => {
      render(<DateRangePicker />);

      expect(screen.getByText("All Time")).toBeInTheDocument();
      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("Yesterday")).toBeInTheDocument();
      expect(screen.getByText("Last 7 Days")).toBeInTheDocument();
      expect(screen.getByText("Last 30 Days")).toBeInTheDocument();
      expect(screen.getByText("This Month")).toBeInTheDocument();
      expect(screen.getByText("Last Month")).toBeInTheDocument();
      expect(screen.getByText("Custom Range")).toBeInTheDocument();
    });

    it("should have 'All Time' selected by default", () => {
      const { container } = render(<DateRangePicker />);

      const allTimeButton = screen.getByText("All Time").closest("button");
      expect(allTimeButton).toHaveClass("bg-primary");
    });

    it("should not show custom date inputs initially", () => {
      render(<DateRangePicker />);

      expect(screen.queryByLabelText("Start Date")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("End Date")).not.toBeInTheDocument();
    });

    it("should not show clear button when 'All Time' is selected", () => {
      render(<DateRangePicker />);

      expect(screen.queryByText("Clear Filter")).not.toBeInTheDocument();
    });
  });

  describe("Preset Selection", () => {
    it("should select 'Today' preset when clicked", async () => {
      render(<DateRangePicker />);

      const todayButton = screen.getByText("Today");
      await user.click(todayButton);

      expect(todayButton.closest("button")).toHaveClass("bg-primary");
    });

    it("should show clear button when a preset is selected", async () => {
      render(<DateRangePicker />);

      const todayButton = screen.getByText("Today");
      await user.click(todayButton);

      expect(screen.getByText("Clear Filter")).toBeInTheDocument();
    });

    it("should update URL with date parameters when preset is selected", async () => {
      render(<DateRangePicker />);

      const last7DaysButton = screen.getByText("Last 7 Days");
      await user.click(last7DaysButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
        const callArgs = mockPush.mock.calls[0][0];
        expect(callArgs).toContain("startDate=");
        expect(callArgs).toContain("endDate=");
      });
    });

    it("should call onDateChange callback when preset is selected", async () => {
      const onDateChangeMock = vi.fn();
      render(<DateRangePicker onDateChange={onDateChangeMock} />);

      const todayButton = screen.getByText("Today");
      await user.click(todayButton);

      await waitFor(() => {
        expect(onDateChangeMock).toHaveBeenCalled();
        const [startDate, endDate] = onDateChangeMock.mock.calls[0];
        expect(startDate).toBeInstanceOf(Date);
        expect(endDate).toBeInstanceOf(Date);
      });
    });

    it("should show date range display when preset is selected", async () => {
      render(<DateRangePicker />);

      const yesterdayButton = screen.getByText("Yesterday");
      await user.click(yesterdayButton);

      await waitFor(() => {
        expect(screen.getByText(/Showing data from/i)).toBeInTheDocument();
      });
    });
  });

  describe("Custom Date Range", () => {
    it("should show custom date inputs when 'Custom Range' is clicked", async () => {
      render(<DateRangePicker />);

      const customButton = screen.getByText("Custom Range");
      await user.click(customButton);

      expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
      expect(screen.getByLabelText("End Date")).toBeInTheDocument();
    });

    it("should hide custom inputs when switching to another preset", async () => {
      render(<DateRangePicker />);

      // First select custom
      const customButton = screen.getByText("Custom Range");
      await user.click(customButton);

      expect(screen.getByLabelText("Start Date")).toBeInTheDocument();

      // Then select a preset
      const todayButton = screen.getByText("Today");
      await user.click(todayButton);

      expect(screen.queryByLabelText("Start Date")).not.toBeInTheDocument();
    });

    it("should update start date when custom date is entered", async () => {
      render(<DateRangePicker />);

      const customButton = screen.getByText("Custom Range");
      await user.click(customButton);

      const startDateInput = screen.getByLabelText("Start Date") as HTMLInputElement;
      await user.type(startDateInput, "2024-01-15");

      expect(startDateInput.value).toBe("2024-01-15");
    });

    it("should update end date when custom date is entered", async () => {
      render(<DateRangePicker />);

      const customButton = screen.getByText("Custom Range");
      await user.click(customButton);

      const endDateInput = screen.getByLabelText("End Date") as HTMLInputElement;
      await user.type(endDateInput, "2024-01-20");

      expect(endDateInput.value).toBe("2024-01-20");
    });

    it("should only trigger callback when both custom dates are set", async () => {
      const onDateChangeMock = vi.fn();
      render(<DateRangePicker onDateChange={onDateChangeMock} />);

      const customButton = screen.getByText("Custom Range");
      await user.click(customButton);

      const startDateInput = screen.getByLabelText("Start Date");
      await user.type(startDateInput, "2024-01-15");

      // Should not call callback yet (only start date set)
      expect(onDateChangeMock).not.toHaveBeenCalled();

      const endDateInput = screen.getByLabelText("End Date");
      await user.type(endDateInput, "2024-01-20");

      // Now both are set, callback should be called
      await waitFor(() => {
        expect(onDateChangeMock).toHaveBeenCalled();
      });
    });
  });

  describe("Clear Filter", () => {
    it("should clear filter when clear button is clicked", async () => {
      render(<DateRangePicker />);

      // Select a preset
      const todayButton = screen.getByText("Today");
      await user.click(todayButton);

      // Click clear
      const clearButton = screen.getByText("Clear Filter");
      await user.click(clearButton);

      // Should revert to "All Time"
      const allTimeButton = screen.getByText("All Time").closest("button");
      expect(allTimeButton).toHaveClass("bg-primary");
    });

    it("should remove URL parameters when cleared", async () => {
      render(<DateRangePicker />);

      // Select preset
      const todayButton = screen.getByText("Today");
      await user.click(todayButton);

      // Clear
      const clearButton = screen.getByText("Clear Filter");
      await user.click(clearButton);

      await waitFor(() => {
        const lastCall = mockPush.mock.calls[mockPush.mock.calls.length - 1][0];
        expect(lastCall).not.toContain("startDate=");
        expect(lastCall).not.toContain("endDate=");
      });
    });

    it("should call onDateChange with null values when cleared", async () => {
      const onDateChangeMock = vi.fn();
      render(<DateRangePicker onDateChange={onDateChangeMock} />);

      // Select preset
      const todayButton = screen.getByText("Today");
      await user.click(todayButton);

      // Clear
      const clearButton = screen.getByText("Clear Filter");
      await user.click(clearButton);

      await waitFor(() => {
        const calls = onDateChangeMock.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall).toEqual([null, null]);
      });
    });

    it("should hide custom inputs when cleared from custom range", async () => {
      render(<DateRangePicker />);

      // Select custom
      const customButton = screen.getByText("Custom Range");
      await user.click(customButton);

      expect(screen.getByLabelText("Start Date")).toBeInTheDocument();

      // Clear
      const clearButton = screen.getByText("Clear Filter");
      await user.click(clearButton);

      expect(screen.queryByLabelText("Start Date")).not.toBeInTheDocument();
    });
  });

  describe("URL Parameter Handling", () => {
    it("should parse URL parameters on mount", () => {
      mockSearchParams.set("startDate", "2024-01-15");
      mockSearchParams.set("endDate", "2024-01-20");

      render(<DateRangePicker />);

      // Component should parse and display the date range
      waitFor(() => {
        expect(screen.getByText(/Showing data from/i)).toBeInTheDocument();
      });
    });

    it("should handle invalid date formats in URL gracefully", () => {
      mockSearchParams.set("startDate", "invalid-date");
      mockSearchParams.set("endDate", "also-invalid");

      // Should not crash
      render(<DateRangePicker />);

      expect(screen.getByText("Date Filter")).toBeInTheDocument();
    });

    it("should detect matching preset from URL params", () => {
      // Set URL to today's date range (will be detected as "Today" preset)
      const today = new Date();
      const dateStr = today.toISOString().split("T")[0];

      mockSearchParams.set("startDate", dateStr);
      mockSearchParams.set("endDate", dateStr);

      render(<DateRangePicker />);

      // Should auto-select "Today" preset
      waitFor(() => {
        const todayButton = screen.getByText("Today").closest("button");
        expect(todayButton).toHaveClass("bg-primary");
      });
    });

    it("should set custom preset when URL dates don't match any preset", () => {
      mockSearchParams.set("startDate", "2024-01-10");
      mockSearchParams.set("endDate", "2024-01-15");

      render(<DateRangePicker />);

      // Should select "Custom Range" and show inputs
      waitFor(() => {
        const customButton = screen.getByText("Custom Range").closest("button");
        expect(customButton).toHaveClass("bg-primary");
        expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
      });
    });
  });

  describe("Date Range Display", () => {
    it("should show formatted date range when dates are selected", async () => {
      render(<DateRangePicker />);

      const last7DaysButton = screen.getByText("Last 7 Days");
      await user.click(last7DaysButton);

      await waitFor(() => {
        const display = screen.getByText(/Showing data from/i);
        expect(display).toBeInTheDocument();
        // Should contain formatted dates like "Jan 14, 2024 to Jan 20, 2024"
        expect(display.textContent).toMatch(/\w+ \d{1,2}, \d{4} to \w+ \d{1,2}, \d{4}/);
      });
    });

    it("should not show date range display when 'All Time' is selected", () => {
      render(<DateRangePicker />);

      expect(screen.queryByText(/Showing data from/i)).not.toBeInTheDocument();
    });

    it("should update date range display when preset changes", async () => {
      render(<DateRangePicker />);

      // Select first preset
      const todayButton = screen.getByText("Today");
      await user.click(todayButton);

      await waitFor(() => {
        expect(screen.getByText(/Showing data from/i)).toBeInTheDocument();
      });

      // Change to different preset
      const yesterdayButton = screen.getByText("Yesterday");
      await user.click(yesterdayButton);

      // Display should still be visible with updated dates
      await waitFor(() => {
        expect(screen.getByText(/Showing data from/i)).toBeInTheDocument();
      });
    });
  });

  describe("Preset Date Calculations", () => {
    it("should calculate 'Today' as start and end of today", async () => {
      const onDateChangeMock = vi.fn();
      render(<DateRangePicker onDateChange={onDateChangeMock} />);

      const todayButton = screen.getByText("Today");
      await user.click(todayButton);

      await waitFor(() => {
        expect(onDateChangeMock).toHaveBeenCalled();
        const [startDate, endDate] = onDateChangeMock.mock.calls[0];

        // Both should be today
        const today = new Date();
        expect(startDate?.getDate()).toBe(today.getDate());
        expect(endDate?.getDate()).toBe(today.getDate());
      });
    });

    it("should calculate 'Last 7 Days' correctly", async () => {
      const onDateChangeMock = vi.fn();
      render(<DateRangePicker onDateChange={onDateChangeMock} />);

      const last7DaysButton = screen.getByText("Last 7 Days");
      await user.click(last7DaysButton);

      await waitFor(() => {
        expect(onDateChangeMock).toHaveBeenCalled();
        const [startDate, endDate] = onDateChangeMock.mock.calls[0];

        if (startDate && endDate) {
          // Difference should be 6 days (inclusive of today = 7 days)
          const daysDiff = Math.floor(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          expect(daysDiff).toBe(6);
        }
      });
    });

    it("should calculate 'Last 30 Days' correctly", async () => {
      const onDateChangeMock = vi.fn();
      render(<DateRangePicker onDateChange={onDateChangeMock} />);

      const last30DaysButton = screen.getByText("Last 30 Days");
      await user.click(last30DaysButton);

      await waitFor(() => {
        expect(onDateChangeMock).toHaveBeenCalled();
        const [startDate, endDate] = onDateChangeMock.mock.calls[0];

        if (startDate && endDate) {
          // Difference should be 29 days (inclusive of today = 30 days)
          const daysDiff = Math.floor(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          expect(daysDiff).toBe(29);
        }
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid preset switching", async () => {
      render(<DateRangePicker />);

      // Rapidly switch between presets
      await user.click(screen.getByText("Today"));
      await user.click(screen.getByText("Yesterday"));
      await user.click(screen.getByText("Last 7 Days"));
      await user.click(screen.getByText("Last 30 Days"));

      // Should not crash and last preset should be selected
      const last30DaysButton = screen.getByText("Last 30 Days").closest("button");
      expect(last30DaysButton).toHaveClass("bg-primary");
    });

    it("should handle partial custom date entry", async () => {
      render(<DateRangePicker />);

      const customButton = screen.getByText("Custom Range");
      await user.click(customButton);

      const startDateInput = screen.getByLabelText("Start Date");
      await user.type(startDateInput, "2024-01-15");

      // Should not crash with only start date set
      expect(screen.getByLabelText("End Date")).toBeInTheDocument();
    });

    it("should handle switching from custom to preset before entering dates", async () => {
      render(<DateRangePicker />);

      // Click custom
      const customButton = screen.getByText("Custom Range");
      await user.click(customButton);

      // Immediately switch to preset without entering dates
      const todayButton = screen.getByText("Today");
      await user.click(todayButton);

      // Should work without errors
      expect(todayButton.closest("button")).toHaveClass("bg-primary");
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for date inputs", async () => {
      render(<DateRangePicker />);

      const customButton = screen.getByText("Custom Range");
      await user.click(customButton);

      expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
      expect(screen.getByLabelText("End Date")).toBeInTheDocument();
    });

    it("should have accessible button roles", () => {
      render(<DateRangePicker />);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should have proper input types for dates", async () => {
      render(<DateRangePicker />);

      const customButton = screen.getByText("Custom Range");
      await user.click(customButton);

      const startDateInput = screen.getByLabelText("Start Date") as HTMLInputElement;
      const endDateInput = screen.getByLabelText("End Date") as HTMLInputElement;

      expect(startDateInput.type).toBe("date");
      expect(endDateInput.type).toBe("date");
    });
  });

  describe("Visual States", () => {
    it("should highlight selected preset button", async () => {
      render(<DateRangePicker />);

      const todayButton = screen.getByText("Today").closest("button");
      await user.click(screen.getByText("Today"));

      expect(todayButton).toHaveClass("bg-primary");
      expect(todayButton).toHaveClass("text-primary-foreground");
    });

    it("should not highlight unselected preset buttons", () => {
      render(<DateRangePicker />);

      const yesterdayButton = screen.getByText("Yesterday").closest("button");

      expect(yesterdayButton).not.toHaveClass("bg-primary");
      expect(yesterdayButton).toHaveClass("bg-muted");
    });

    it("should show date range display with proper styling", async () => {
      const { container } = render(<DateRangePicker />);

      const todayButton = screen.getByText("Today");
      await user.click(todayButton);

      await waitFor(() => {
        const display = container.querySelector(".bg-primary\\/10");
        expect(display).toBeInTheDocument();
      });
    });
  });
});
