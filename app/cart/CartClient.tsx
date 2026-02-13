// app/cart/CartClient.tsx - Client Component for cart interactivity
"use client";

import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CartClientProps {
  user: User | null;
}

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function CartClient({ user }: CartClientProps) {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { addToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCheckout = async () => {
    // Redirect to login if not authenticated
    if (!user) {
      router.push("/login?redirect=/cart");
      return;
    }

    if (items.length === 0) {
      addToast("Your cart is empty!", "warning");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create PayMongo payment source (GCash checkout)
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create payment");
      }

      const data = await response.json();

      // Show info toast
      addToast("Redirecting to GCash payment...", "info", 3000);

      // Redirect to GCash checkout
      window.location.href = data.checkoutUrl;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Something went wrong";
      setError(errorMessage);
      addToast(errorMessage, "error");
      setLoading(false);
    }
  };

  const handleClearCart = () => {
    setShowClearConfirm(true);
  };

  const confirmClearCart = () => {
    clearCart();
    setShowClearConfirm(false);
    addToast("Cart cleared successfully", "info");
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mx-auto h-24 w-24 text-muted-foreground"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
          <h2 className="mt-6 text-2xl font-bold text-foreground">
            Your cart is empty
          </h2>
          <p className="mt-2 text-muted-foreground">
            Add some delicious items to get started!
          </p>
          <Link
            href="/menu"
            className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            Browse Menu
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1
            className="text-3xl font-bold text-foreground"
            variants={fadeUp}
          >
            Shopping Cart
          </motion.h1>
          <motion.p
            className="mt-2 text-sm text-muted-foreground"
            variants={fadeUp}
          >
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </motion.p>
        </motion.div>

        {error && (
          <div className="mt-4 rounded-lg bg-error/10 border border-error/20 p-4">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -60, transition: { duration: 0.3 } }}
                transition={{ duration: 0.4, ease: easeOut }}
                className="flex gap-4 rounded-lg border border-border bg-card p-4 shadow-sm"
              >
                {/* Product Image */}
                {item.product.imageUrl && (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-24 w-24 flex-shrink-0 rounded-lg object-cover"
                  />
                )}

                {/* Product Info */}
                <div className="flex flex-1 flex-col justify-between min-w-0">
                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      {item.product.name}
                    </h3>
                    {item.product.description && (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {item.product.description}
                      </p>
                    )}
                    <p className="mt-2 text-sm font-medium text-primary">
                      ₱{item.product.price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <motion.button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-card-foreground hover:bg-muted transition-colors"
                        whileTap={{ scale: 0.9 }}
                      >
                        -
                      </motion.button>
                      <span className="w-8 text-center font-medium text-card-foreground">
                        {item.quantity}
                      </span>
                      <motion.button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-card-foreground hover:bg-muted transition-colors"
                        whileTap={{ scale: 0.9 }}
                      >
                        +
                      </motion.button>
                    </div>

                    <span className="ml-auto font-semibold text-card-foreground">
                      ₱{(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Remove Button - Fixed Position */}
                <motion.button
                  onClick={() => removeFromCart(item.product.id)}
                  className="flex-shrink-0 self-start text-error hover:text-error/80 transition-colors"
                  title="Remove from cart"
                  whileTap={{ scale: 0.9 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-6 w-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Cart Summary */}
        <motion.div
          className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
        >
          <h2 className="text-lg font-semibold text-card-foreground">
            Order Summary
          </h2>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-card-foreground">
                ₱{total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span className="font-medium text-card-foreground">Free</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-card-foreground">
                  Total
                </span>
                <span className="text-lg font-bold text-primary">
                  ₱{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Guest Warning - Only show if not logged in */}
          {!user && (
            <div className="mt-4 rounded-lg bg-warning/10 border border-warning/20 p-3">
              <p className="text-sm text-warning">
                Please{" "}
                <Link href="/login?redirect=/cart" className="font-semibold underline">
                  login
                </Link>{" "}
                to place your order.
              </p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <motion.button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                "Processing..."
              ) : user ? (
                <>
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
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                    />
                  </svg>
                  Pay with GCash
                </>
              ) : (
                "Login to Checkout"
              )}
            </motion.button>

            <motion.button
              onClick={handleClearCart}
              className="w-full rounded-lg border border-border px-6 py-3 text-sm font-semibold text-card-foreground hover:bg-muted transition-colors"
              whileTap={{ scale: 0.97 }}
            >
              Clear Cart
            </motion.button>

            <Link
              href="/menu"
              className="block w-full rounded-lg border border-border px-6 py-3 text-center text-sm font-semibold text-card-foreground hover:bg-muted transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Clear Cart Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
            />
            {/* Modal */}
            <motion.div
              className="relative w-full max-w-md rounded-lg bg-card p-6 shadow-xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25, ease: easeOut }}
            >
              <h3 className="text-lg font-semibold text-card-foreground">
                Clear Cart?
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Are you sure you want to clear all items from your cart? This action cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <motion.button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-card-foreground hover:bg-muted transition-colors"
                  whileTap={{ scale: 0.97 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmClearCart}
                  className="flex-1 rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white hover:bg-error/90 transition-colors"
                  whileTap={{ scale: 0.97 }}
                >
                  Clear Cart
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
