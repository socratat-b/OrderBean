// app/menu/page.tsx - Server Component with ISR
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import MenuClient from "./MenuClient";

// Cached function for fetching products
// Following Next.js ISR best practices for ORM/database queries
const getCachedProducts = unstable_cache(
  async () => {
    return await prisma.product.findMany({
      orderBy: { name: "asc" },
    });
  },
  ["products"], // Cache key
  {
    revalidate: 3600, // Revalidate every 1 hour (3600 seconds)
    tags: ["products"], // Cache tag for on-demand revalidation
  }
);

export default async function MenuPage() {
  const products = await getCachedProducts();

  return <MenuClient initialProducts={products} />;
}
