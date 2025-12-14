// app/payment/success/page.tsx
"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { addToast } = useToast();
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent duplicate processing (useRef persists across renders)
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processPayment = async () => {
      try {
        // Get cart items from localStorage
        const cartData = localStorage.getItem("cart");
        if (!cartData) {
          setStatus("error");
          setErrorMessage("Cart is empty");
          return;
        }

        const cartItems = JSON.parse(cartData);
        if (!Array.isArray(cartItems) || cartItems.length === 0) {
          setStatus("error");
          setErrorMessage("Cart is empty");
          return;
        }

        // Create order now that payment is confirmed
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: cartItems.map((item: any) => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to create order");
        }

        const data = await response.json();

        // Clear cart after successful order
        clearCart();

        // Set success state
        setOrderId(data.order.id);
        setStatus("success");
        addToast("Payment successful! Order placed.", "success");
      } catch (error) {
        console.error("Error processing payment:", error);
        setStatus("error");
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to process payment"
        );
        addToast("Failed to create order", "error");
      }
    };

    processPayment();
  }, []);

  if (status === "processing") {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <h2 className="mt-6 text-2xl font-bold text-foreground">
            Processing Payment...
          </h2>
          <p className="mt-2 text-muted-foreground">
            Please wait while we confirm your payment.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
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
            Payment Error
          </h2>
          <p className="mt-2 text-muted-foreground">{errorMessage}</p>
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

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8 text-success"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-foreground">
          Payment Successful!
        </h2>
        <p className="mt-2 text-muted-foreground">
          Your order has been placed successfully.
        </p>
        {orderId && (
          <p className="mt-2 text-sm text-muted-foreground">
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>
        )}
        <div className="mt-8 space-y-3">
          <Link
            href="/orders"
            className="block w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            View My Orders
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

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
