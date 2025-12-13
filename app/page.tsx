// app/page.tsx - Server Component with ISR
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";

// Cache for 1 hour (same as menu page)
export const revalidate = 3600;

// Cached function for fetching featured products
const getCachedFeaturedProducts = unstable_cache(
  async () => {
    return await prisma.product.findMany({
      where: { available: true },
      take: 3, // First 3 products as featured
      orderBy: { createdAt: "desc" }, // Most recent first
    });
  },
  ["featured-products"], // Cache key
  {
    revalidate: 3600, // Revalidate every 1 hour
    tags: ["products"], // Same tag as menu - invalidates together
  }
);

export default async function HomePage() {
  const featuredProducts = await getCachedFeaturedProducts();

  return <HomeClient featuredProducts={featuredProducts} />;
}
