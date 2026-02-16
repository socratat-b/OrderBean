// app/menu/page.tsx - Server Component with ISR
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import MenuClient from "./MenuClient";

const PRODUCTS_PER_PAGE = 12;

// Cached function for fetching first page of products
const getCachedProducts = unstable_cache(
  async () => {
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        orderBy: { name: "asc" },
        take: PRODUCTS_PER_PAGE,
      }),
      prisma.product.count(),
    ]);

    return {
      products,
      pagination: {
        total,
        page: 1,
        limit: PRODUCTS_PER_PAGE,
        totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
        hasMore: total > PRODUCTS_PER_PAGE,
      },
    };
  },
  ["products"], // Cache key
  {
    revalidate: 3600, // Revalidate every 1 hour (3600 seconds)
    tags: ["products"], // Cache tag for on-demand revalidation
  }
);

export default async function MenuPage() {
  const { products, pagination } = await getCachedProducts();

  return <MenuClient initialProducts={products} initialPagination={pagination} />;
}
