// app/components/DemoModeBanner.tsx
"use client";

import { useState } from "react";

export default function DemoModeBanner() {
  const [dismissed, setDismissed] = useState(false);

  // Only show in production if using test keys
  const isTestMode = process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY?.includes("test");

  if (dismissed || !isTestMode) return null;

  return (
    <div className="relative bg-warning/20 border-b border-warning/30 px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5 flex-shrink-0 text-warning"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-warning">
              <span className="font-bold">Demo Mode:</span> This site is using test
              payments. No real money will be charged.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-warning hover:text-warning/80"
          aria-label="Dismiss banner"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
