// app/payment/failed/page.tsx
"use client";

import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import { useEffect } from "react";

export default function PaymentFailedPage() {
  const { addToast } = useToast();

  useEffect(() => {
    addToast("Payment was cancelled or failed", "error");
  }, [addToast]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8 text-error"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18 18 6M6 6l12 12"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-foreground">
          Payment Failed
        </h2>
        <p className="mt-2 text-muted-foreground">
          Your payment was not completed. This could be due to:
        </p>
        <ul className="mt-4 space-y-2 text-left text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-error">•</span>
            <span>Payment was cancelled</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-error">•</span>
            <span>Insufficient funds in your GCash account</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-error">•</span>
            <span>Payment timeout or network issues</span>
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Your cart items are still saved. You can try again.
        </p>
        <div className="mt-8 space-y-3">
          <Link
            href="/cart"
            className="block w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            Return to Cart
          </Link>
          <Link
            href="/menu"
            className="block w-full rounded-lg border border-border px-6 py-3 text-sm font-semibold text-card-foreground hover:bg-muted transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
