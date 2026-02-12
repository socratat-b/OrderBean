"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  imageUrl: string | null;
  available: boolean;
}

interface FeaturedProductsProps {
  products: Product[];
  loading: boolean;
  onAddToCart: (product: Product) => void;
}

const easeOut = [0.25, 0.46, 0.45, 0.94] as const;

const sectionHeader = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: i * 0.15,
      ease: easeOut,
    },
  }),
};

export default function FeaturedProducts({
  products,
  loading,
  onAddToCart,
}: FeaturedProductsProps) {
  return (
    <section id="menu" className="bg-background scroll-mt-20 py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionHeader}
          className="text-center"
        >
          <div className="bg-muted text-muted-foreground mb-4 inline-block rounded-full px-4 py-2 text-sm font-semibold">
            Our Menu
          </div>
          <h2 className="text-foreground text-4xl font-black md:text-5xl">
            Featured Favorites
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
            Handcrafted with love, served with a smile. Discover our most
            popular items.
          </p>
        </motion.div>

        {/* Products Grid */}
        {loading ? (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-border bg-card animate-pulse rounded-2xl border p-6"
              >
                <div className="bg-muted mb-4 h-48 rounded-xl"></div>
                <div className="bg-muted mb-2 h-6 rounded"></div>
                <div className="bg-muted h-4 w-2/3 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                custom={i}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group border-border bg-card relative overflow-hidden rounded-2xl border p-6 shadow-sm transition-shadow hover:shadow-xl"
              >
                {product.imageUrl && (
                  <div className="mb-4 overflow-hidden rounded-xl">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={400}
                      height={300}
                      className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                )}
                <div className="bg-accent bg-opacity-20 text-accent-foreground mb-2 inline-block rounded-full px-3 py-1 text-xs font-semibold">
                  {product.category}
                </div>
                <h3 className="text-foreground text-xl font-bold">
                  {product.name}
                </h3>
                <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                  {product.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-foreground text-2xl font-bold">
                    ₱{product.price.toFixed(2)}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onAddToCart(product)}
                    className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
                  >
                    Order
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link
            href="/menu"
            className="border-primary bg-background text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-xl border-2 px-8 py-4 text-base font-semibold transition-all"
          >
            View Full Menu
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
