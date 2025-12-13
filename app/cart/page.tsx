// app/cart/page.tsx
"use client";

import { createOrder } from "@/actions/orders";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (items.length === 0) {
      alert("Your order is empty!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await createOrder(
        items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        }))
      );

      if (result.error) {
        throw new Error(result.error);
      }

      // Clear order after successful placement
      clearCart();

      // Show success message
      alert(`Order placed successfully! Order ID: ${result.order?.id}`);

      // Redirect to orders page
      router.push("/orders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <div className="text-center">
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
            Your order is empty
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Back to Menu Button */}
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
          Back to Menu
        </Link>

        <h1 className="text-3xl font-bold text-foreground">Your Order</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} in your order
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-error/10 border border-error/20 p-4">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex gap-4 rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              {/* Product Image */}
              {item.product.imageUrl && (
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />
              )}

              {/* Product Info */}
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-card-foreground">
                    {item.product.name}
                  </h3>
                  {item.product.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
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
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-card-foreground hover:bg-muted transition-colors"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium text-card-foreground">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-card-foreground hover:bg-muted transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <span className="ml-auto font-semibold text-card-foreground">
                    ₱{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.product.id)}
                className="text-error hover:text-error/80 transition-colors"
                title="Remove from order"
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
              </button>
            </div>
          ))}
        </div>

        {/* Cart Summary */}
        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-card-foreground">Order Summary</h2>

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

          <div className="mt-6 space-y-3">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>

            <button
              onClick={clearCart}
              className="w-full rounded-lg border border-border px-6 py-3 text-sm font-semibold text-card-foreground hover:bg-muted transition-colors"
            >
              Clear Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
