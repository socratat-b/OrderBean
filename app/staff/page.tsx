// Server Component - Fetches initial data
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import StaffDashboardClient from "./_components/StaffDashboardClient";

export const dynamic = "force-dynamic";

async function getOrders() {
  const session = await verifySession();

  // Verify staff role
  if (session.role !== "STAFF" && session.role !== "OWNER") {
    throw new Error("Access denied");
  }

  const orders = await prisma.order.findMany({
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
  });

  // Serialize dates for client
  return orders.map(order => ({
    ...order,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  }));
}

export default async function StaffPage() {
  try {
    const orders = await getOrders();

    return <StaffDashboardClient initialOrders={orders} />;
  } catch (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-error font-semibold">
            {error instanceof Error ? error.message : "Failed to load orders"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-xl bg-primary px-6 py-3 text-primary-foreground font-bold hover:opacity-90 transition-all shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
}
