import { getSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only customers can access their profile stats
    if (session.role !== "CUSTOMER") {
      return NextResponse.json(
        { error: "This feature is only available for customers" },
        { status: 403 }
      );
    }

    // Get user orders with items
    const orders = await prisma.order.findMany({
      where: {
        userId: session.userId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const completedOrders = orders.filter(
      (order) => order.status === "COMPLETED"
    ).length;

    // Find favorite product (most ordered)
    const productCounts: Record<string, { name: string; count: number }> = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productId = item.productId;
        const productName = item.product.name;

        if (!productCounts[productId]) {
          productCounts[productId] = { name: productName, count: 0 };
        }
        productCounts[productId].count += item.quantity;
      });
    });

    const favoriteProduct = Object.values(productCounts).sort(
      (a, b) => b.count - a.count
    )[0];

    return NextResponse.json({
      totalOrders,
      totalSpent,
      completedOrders,
      favoriteProduct: favoriteProduct
        ? {
            name: favoriteProduct.name,
            orderCount: favoriteProduct.count,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to fetch profile stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile stats" },
      { status: 500 }
    );
  }
}
