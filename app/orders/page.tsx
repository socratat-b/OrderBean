// app/orders/page.tsx - Server Component with ISR
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import OrdersClient from "./OrdersClient";

const ORDERS_PER_PAGE = 10;

// Cached function for fetching user's orders (first page)
async function getCachedOrders(userId: string) {
  const getCachedOrdersForUser = unstable_cache(
    async () => {
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
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
          take: ORDERS_PER_PAGE + 1,
        }),
        prisma.order.count({ where: { userId } }),
      ]);

      const hasMore = orders.length > ORDERS_PER_PAGE;
      const data = hasMore ? orders.slice(0, ORDERS_PER_PAGE) : orders;
      const nextCursor = hasMore ? data[data.length - 1].id : undefined;

      return {
        orders: data,
        pagination: {
          total,
          limit: ORDERS_PER_PAGE,
          nextCursor,
          hasMore,
        },
      };
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
  const { orders, pagination } = await getCachedOrders(session.userId);

  return <OrdersClient initialOrders={orders} initialPagination={pagination} />;
}
