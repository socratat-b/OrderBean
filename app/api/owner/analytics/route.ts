// app/api/owner/analytics/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/owner/analytics - View business analytics (OWNER only)
export async function GET(request: NextRequest) {
  try {
    // Get user info from headers (set by proxy.ts)
    const userRole = request.headers.get("x-user-role");

    // Check if user is OWNER
    if (userRole !== "OWNER") {
      return NextResponse.json(
        { error: "Forbidden - Owner access required" },
        { status: 403 },
      );
    }

    // Get total orders count
    const totalOrders = await prisma.order.count();

    // Get total revenue
    const revenueData = await prisma.order.aggregate({
      _sum: {
        total: true,
      },
    });
    const totalRevenue = revenueData._sum.total || 0;

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    // Get popular products (most ordered)
    const popularProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    // Get product details for popular products
    const productIds = popularProducts.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    // Combine popular products with their details
    const popularProductsWithDetails = popularProducts.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        product,
        totalQuantitySold: item._sum.quantity || 0,
        orderCount: item._count.id,
      };
    });

    // Get recent orders (last 10)
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      analytics: {
        totalOrders,
        totalRevenue,
        ordersByStatus: ordersByStatus.map((item) => ({
          status: item.status,
          count: item._count.id,
        })),
        popularProducts: popularProductsWithDetails,
        recentOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
