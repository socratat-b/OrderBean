// app/menu/MenuClient.tsx - Client Component for interactivity
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { motion, AnimatePresence } from "motion/react";

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

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardItem = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
};

export default function MenuClient({ initialProducts }: MenuClientProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    addToast(`${product.name} added to cart!`, "success");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.category-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
        <motion.div
          className="mb-10 text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.h1
            className="text-4xl font-bold tracking-tight text-foreground md:text-5xl"
            variants={fadeUp}
          >
            Our Menu
          </motion.h1>
          <motion.p
            className="mt-3 text-lg text-muted-foreground"
            variants={fadeUp}
          >
            Discover our selection of delicious coffee and pastries
          </motion.p>
        </motion.div>

        {/* Category Filter - Mobile (Custom Dropdown) */}
        <motion.div
          className="mb-6 md:hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: easeOut }}
        >
          <label className="block text-sm font-semibold text-foreground mb-3 text-center">
            Filter by Category
          </label>
          <div className="relative category-dropdown max-w-md mx-auto">
            {/* Dropdown Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full rounded-xl border-2 border-border bg-card px-4 py-3.5 text-left text-base font-bold text-card-foreground shadow-md focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            >
              <div className="flex items-center justify-between">
                <span>
                  {selectedCategory} ({selectedCategory === "All" ? initialProducts.length : initialProducts.filter((p) => p.category === selectedCategory).length})
                </span>
                <svg
                  className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute z-50 mt-2 w-full rounded-xl border-2 border-border bg-card shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-80 overflow-y-auto">
                  {categories.map((category) => {
                    const count = category === "All"
                      ? initialProducts.length
                      : initialProducts.filter((p) => p.category === category).length;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3.5 text-left text-base font-semibold transition-colors ${
                          selectedCategory === category
                            ? 'bg-primary text-primary-foreground'
                            : 'text-card-foreground hover:bg-muted'
                        }`}
                      >
                        {category} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Category Filter - Desktop (Buttons) */}
        <motion.div
          className="mb-8 hidden md:flex flex-wrap justify-center gap-3"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full px-6 py-2.5 text-sm font-semibold transition-all ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-card-foreground border border-border shadow-sm hover:bg-muted"
              }`}
              variants={fadeUp}
              whileTap={{ scale: 0.95 }}
            >
              {category}
            </motion.button>
          ))}
        </motion.div>

        {/* Products Count */}
        <motion.p
          className="mb-6 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1 ? "item" : "items"}
        </motion.p>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div
            className="py-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-lg text-muted-foreground">
              No products found in this category.
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            key={selectedCategory}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
                variants={cardItem}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
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
                    <motion.button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.available}
                      className={`w-full rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                        product.available
                          ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                          : "cursor-not-allowed bg-muted text-muted-foreground"
                      }`}
                      whileTap={product.available ? { scale: 0.95 } : undefined}
                    >
                      {product.available ? "Add to Cart" : "Out of Stock"}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
