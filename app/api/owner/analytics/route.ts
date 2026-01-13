// app/api/owner/analytics/route.ts
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { Prisma } from "@/app/generated/prisma/client";

// GET /api/owner/analytics - View business analytics (OWNER only)
// Supports date filtering via query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export async function GET(request: NextRequest) {
  try {
    // Verify session using DAL
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is OWNER
    if (session.role !== "OWNER") {
      return NextResponse.json(
        { error: "Forbidden - Owner access required" },
        { status: 403 },
      );
    }

    // Parse date range from query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    let dateFilter: { createdAt?: { gte: Date; lte: Date } } = {};
    let previousPeriodFilter: { createdAt?: { gte: Date; lte: Date } } = {};

    if (startDateParam && endDateParam) {
      const startDate = startOfDay(new Date(startDateParam));
      const endDate = endOfDay(new Date(endDateParam));

      // Current period filter
      dateFilter = {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      };

      // Calculate previous period for comparison
      const daysDiff = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const previousStartDate = startOfDay(subDays(startDate, daysDiff));
      const previousEndDate = endOfDay(subDays(endDate, daysDiff));

      previousPeriodFilter = {
        createdAt: {
          gte: previousStartDate,
          lte: previousEndDate,
        },
      };
    }

    // Get total orders count for current period
    const totalOrders = await prisma.order.count({
      where: dateFilter,
    });

    // Get total orders count for previous period (for comparison)
    const previousPeriodOrders = await prisma.order.count({
      where: previousPeriodFilter,
    });

    // Calculate percentage change in orders
    const ordersChange =
      previousPeriodOrders > 0
        ? ((totalOrders - previousPeriodOrders) / previousPeriodOrders) * 100
        : totalOrders > 0
        ? 100
        : 0;

    // Get total revenue for current period
    const revenueData = await prisma.order.aggregate({
      where: dateFilter,
      _sum: {
        total: true,
      },
    });
    const totalRevenue = revenueData._sum.total || 0;

    // Get previous period revenue
    const previousRevenueData = await prisma.order.aggregate({
      where: previousPeriodFilter,
      _sum: {
        total: true,
      },
    });
    const previousRevenue = previousRevenueData._sum.total || 0;

    // Calculate percentage change in revenue
    const revenueChange =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : totalRevenue > 0
        ? 100
        : 0;

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      where: dateFilter,
      by: ["status"],
      _count: {
        id: true,
      },
    });

    // Get popular products (most ordered) with date filtering
    const popularProductsRaw = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: dateFilter.createdAt
        ? {
            order: {
              createdAt: dateFilter.createdAt,
            },
          }
        : undefined,
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
    const productIds = popularProductsRaw.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    // Combine popular products with their details
    const popularProducts = popularProductsRaw.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        product,
        totalQuantitySold: item._sum.quantity || 0,
        orderCount: item._count.id,
      };
    });

    // Get recent orders (last 10) with date filtering
    const recentOrders = await prisma.order.findMany({
      where: dateFilter,
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

    // Get daily revenue data for chart (last 30 days or filtered period)
    const revenueByDay = dateFilter.createdAt
      ? await prisma.$queryRaw<
          Array<{ date: Date; revenue: number; orderCount: number }>
        >(
          Prisma.sql`
            SELECT
              DATE("createdAt") as date,
              SUM(total)::float as revenue,
              COUNT(*)::int as "orderCount"
            FROM "Order"
            WHERE "createdAt" >= ${dateFilter.createdAt.gte} AND "createdAt" <= ${dateFilter.createdAt.lte}
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
            LIMIT 90
          `
        )
      : await prisma.$queryRaw<
          Array<{ date: Date; revenue: number; orderCount: number }>
        >(
          Prisma.sql`
            SELECT
              DATE("createdAt") as date,
              SUM(total)::float as revenue,
              COUNT(*)::int as "orderCount"
            FROM "Order"
            GROUP BY DATE("createdAt")
            ORDER BY date DESC
            LIMIT 90
          `
        );

    return NextResponse.json({
      success: true,
      analytics: {
        totalOrders,
        totalRevenue,
        ordersChange: Math.round(ordersChange * 10) / 10, // Round to 1 decimal
        revenueChange: Math.round(revenueChange * 10) / 10,
        ordersByStatus: ordersByStatus.map((item) => ({
          status: item.status,
          count: item._count.id,
        })),
        popularProducts,
        recentOrders,
        revenueByDay: revenueByDay.map((day) => ({
          date: day.date.toISOString().split("T")[0], // Format as YYYY-MM-DD
          revenue: Number(day.revenue),
          orderCount: day.orderCount,
        })),
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
