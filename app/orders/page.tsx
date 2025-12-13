// app/orders/page.tsx - Server Component with ISR
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import OrdersClient from "./OrdersClient";

// Cached function for fetching user's orders
// Cache for 1 minute since orders update more frequently than products
async function getCachedOrders(userId: string) {
  const getCachedOrdersForUser = unstable_cache(
    async () => {
      return await prisma.order.findMany({
        where: { userId },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    },
    [`user-orders-${userId}`], // User-specific cache key
    {
      revalidate: 60, // Revalidate every 1 minute
      tags: [`user-orders-${userId}`], // Tag for on-demand revalidation
    }
  );

  return await getCachedOrdersForUser();
}

export default async function OrdersPage() {
  // Verify session and get user ID
  const session = await verifySession();
  const orders = await getCachedOrders(session.userId);

  return <OrdersClient orders={orders} />;
}
