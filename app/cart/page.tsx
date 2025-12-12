// app/cart/page.tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { user, token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (!user || !token) {
      router.push("/login");
      return;
    }

    if (items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
        throw new Error(data.error || "Failed to place order");
      }

      const data = await response.json();

      // Clear cart after successful order
      clearCart();

      // Show success message
      alert(`Order placed successfully! Order ID: ${data.order.id}`);

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
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mx-auto h-24 w-24 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            Your cart is empty
          </h2>
          <p className="mt-2 text-gray-600">
            Add some delicious items to get started!
          </p>
          <Link
            href="/menu"
            className="mt-8 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <p className="mt-2 text-sm text-gray-600">
          {items.length} {items.length === 1 ? "item" : "items"} in your cart
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
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
                  <h3 className="font-semibold text-gray-900">
                    {item.product.name}
                  </h3>
                  {item.product.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {item.product.description}
                    </p>
                  )}
                  <p className="mt-2 text-sm font-medium text-gray-900">
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
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <span className="ml-auto font-semibold text-gray-900">
                    ₱{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromCart(item.product.id)}
                className="text-red-500 hover:text-red-700"
                title="Remove from cart"
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
        <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">
                ₱{total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery</span>
              <span className="font-medium text-gray-900">Free</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-lg font-bold text-gray-900">
                  ₱{total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {!user && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-3">
              <p className="text-sm text-yellow-800">
                Please{" "}
                <Link href="/login" className="font-semibold underline">
                  login
                </Link>{" "}
                to place your order.
              </p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? "Placing Order..."
                : user
                  ? "Place Order"
                  : "Login to Checkout"}
            </button>

            <button
              onClick={clearCart}
              className="w-full rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Clear Cart
            </button>

            <Link
              href="/menu"
              className="block w-full rounded-lg border border-gray-300 px-6 py-3 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
