// Server Component - Fetches initial data
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import StaffDashboardClient from "./_components/StaffDashboardClient";

export const dynamic = "force-dynamic";

const STAFF_ORDERS_PER_PAGE = 20;

async function getOrders() {
  const session = await verifySession();

  // Verify staff role
  if (session.role !== "STAFF" && session.role !== "OWNER") {
    throw new Error("Access denied");
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      take: STAFF_ORDERS_PER_PAGE + 1,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.order.count(),
  ]);

  const hasMore = orders.length > STAFF_ORDERS_PER_PAGE;
  const data = hasMore ? orders.slice(0, STAFF_ORDERS_PER_PAGE) : orders;
  const nextCursor = hasMore ? data[data.length - 1].id : undefined;

  // Serialize dates for client
  return {
    orders: data.map(order => ({
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })),
    pagination: {
      total,
      limit: STAFF_ORDERS_PER_PAGE,
      nextCursor,
      hasMore,
    },
  };
}

export default async function StaffPage() {
  try {
    const { orders, pagination } = await getOrders();

    return <StaffDashboardClient initialOrders={orders} initialPagination={pagination} />;
  } catch (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-error font-semibold">
            {error instanceof Error ? error.message : "Failed to load orders"}
          </p>
          <a
            href="/staff"
            className="mt-4 inline-block rounded-xl bg-primary px-6 py-3 text-primary-foreground font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
          >
            Retry
          </a>
        </div>
      </div>
    );
  }
}
