"use client";

import { useState, useEffect } from "react";
import type { Order, OrderStatus } from "./types";

interface StatusFiltersProps {
  statusFilters: OrderStatus[];
  selectedStatus: OrderStatus;
  searchFilteredOrders: Order[];
  onStatusChange: (status: OrderStatus) => void;
}

export function StatusFilters({
  statusFilters,
  selectedStatus,
  searchFilteredOrders,
  onStatusChange,
}: StatusFiltersProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".custom-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [isDropdownOpen]);

  const getCount = (status: OrderStatus) => {
    return status === "ALL"
      ? searchFilteredOrders.length
      : searchFilteredOrders.filter((order) => order.status === status).length;
  };

  return (
    <>
      {/* Mobile Dropdown */}
      <div className="mb-6 md:hidden">
        <label className="block text-sm font-semibold text-foreground mb-3">Filter by Status</label>
        <div className="relative custom-dropdown">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-3.5 text-left text-base font-bold text-card-foreground shadow-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          >
            <div className="flex items-center justify-between">
              <span>
                {selectedStatus} ({getCount(selectedStatus)})
              </span>
              <svg
                className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </button>

          {isDropdownOpen && (
            <div className="absolute z-50 mt-2 w-full rounded-xl border-2 border-border bg-card shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="max-h-80 overflow-y-auto">
                {statusFilters.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      onStatusChange(status);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3.5 text-left text-base font-semibold transition-colors ${
                      selectedStatus === status
                        ? "bg-primary text-primary-foreground"
                        : "text-card-foreground hover:bg-muted"
                    }`}
                  >
                    {status} ({getCount(status)})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Buttons */}
      <div className="mb-6 hidden md:flex md:flex-wrap md:gap-2">
        {statusFilters.map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              selectedStatus === status
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card text-card-foreground hover:bg-muted border border-border"
            }`}
          >
            {status} ({getCount(status)})
          </button>
        ))}
      </div>
    </>
  );
}
