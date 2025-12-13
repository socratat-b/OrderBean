// app/api/staff/orders/route.ts
import { OrderStatus } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";

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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status");

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

    const orders = await prisma.order.findMany({
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
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
