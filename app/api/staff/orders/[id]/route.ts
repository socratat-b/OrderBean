// app/api/staff/orders/[id]/route.ts
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface UpdateOrderBody {
  status: "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELLED";
}

// PATCH /api/staff/orders/[id] - Update order status (STAFF & OWNER only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

    const body: UpdateOrderBody = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = [
      "PENDING",
      "PREPARING",
      "READY",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error:
            "Invalid status. Must be: PENDING, PREPARING, READY, COMPLETED, or CANCELLED",
        },
        { status: 400 },
      );
    }

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
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
    });

    // Invalidate the user's orders cache for ISR
    revalidatePath("/orders");

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
