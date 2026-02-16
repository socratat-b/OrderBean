// app/api/staff/orders/route.ts
import { OrderStatus } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";
import { rateLimitByUser } from "@/lib/rate-limit";

// GET /api/staff/orders - View all orders (STAFF & OWNER only)
export async function GET(request: NextRequest) {
  try {
    // Verify session using DAL
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is STAFF or OWNER
    if (session.role !== "STAFF" && session.role !== "OWNER") {
      return NextResponse.json(
        { error: "Forbidden - Staff access required" },
        { status: 403 },
      );
    }

    const limited = await rateLimitByUser(session.userId);
    if (limited) return limited;

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");
    const cursor = searchParams.get("cursor");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    // Validate and type the status
    const validStatuses: OrderStatus[] = [
      "PENDING",
      "PREPARING",
      "READY",
      "COMPLETED",
      "CANCELLED",
    ];
    const status =
      statusParam && validStatuses.includes(statusParam as OrderStatus)
        ? (statusParam as OrderStatus)
        : undefined;

    // Build where clause with proper typing
    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
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
                  price: true,
                  category: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit + 1,
        ...(cursor
          ? {
              cursor: { id: cursor },
              skip: 1,
            }
          : {}),
      }),
      prisma.order.count({ where }),
    ]);

    const hasMore = orders.length > limit;
    const data = hasMore ? orders.slice(0, limit) : orders;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return NextResponse.json({
      success: true,
      count: data.length,
      orders: data,
      pagination: {
        total,
        limit,
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
