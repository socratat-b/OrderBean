// app/menu/MenuClient.tsx - Client Component for interactivity
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  available: boolean;
}

interface MenuClientProps {
  initialProducts: Product[];
}

export default function MenuClient({ initialProducts }: MenuClientProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    addToast(`${product.name} added to cart!`, "success");
  };

  // TODO: Add real-time listener when implementing Phase 7
  // useEffect(() => {
  //   // When you add Supabase/Pusher/WebSocket:
  //   const subscription = supabase
  //     .channel('products')
  //     .on('postgres_changes', { event: '*', schema: 'public', table: 'Product' }, () => {
  //       router.refresh() // Refetch server component data
  //     })
  //     .subscribe()
  //
  //   return () => subscription.unsubscribe()
  // }, [router])

  // Get unique categories
  const categories = ["All", ...new Set(initialProducts.map((p) => p.category))];

  // Filter products by category
  const filteredProducts =
    selectedCategory === "All"
      ? initialProducts
      : initialProducts.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-dvh bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Our Menu
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Discover our selection of delicious coffee and pastries
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-card-foreground border border-border shadow-sm hover:bg-muted"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Count */}
        <p className="mb-6 text-center text-sm text-muted-foreground">
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "item" : "items"}
        </p>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-muted-foreground">
              No products found in this category.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-lg"
              >
                {/* Product Image */}
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-16 w-16"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Availability Badge */}
                  {!product.available && (
                    <div className="bg-opacity-60 absolute inset-0 flex items-center justify-center bg-black">
                      <span className="rounded-full bg-card px-4 py-2 text-sm font-bold text-card-foreground">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="text-lg font-bold text-card-foreground">
                      {product.name}
                    </h3>
                    <span className="ml-3 text-xl font-bold whitespace-nowrap text-primary">
                      ₱{product.price.toFixed(2)}
                    </span>
                  </div>

                  {product.description && (
                    <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                  )}

                  {/* Category Tag */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-block rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                      {product.category}
                    </span>
                  </div>

                  {/* Spacer to push footer to bottom */}
                  <div className="flex-1"></div>

                  {/* Card Footer - Add to Cart Button */}
                  <div className="border-t border-border pt-4 mt-auto">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.available}
                      className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                        product.available
                          ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                          : "cursor-not-allowed bg-muted text-muted-foreground"
                      }`}
                    >
                      {product.available ? "Add to Cart" : "Out of Stock"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
