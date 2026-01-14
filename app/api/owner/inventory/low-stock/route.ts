// app/api/owner/inventory/low-stock/route.ts
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { NextRequest, NextResponse } from "next/server";

// GET /api/owner/inventory/low-stock - Get products with low stock (OWNER only)
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

    // Find all products where stock tracking is enabled
    const allProducts = await prisma.product.findMany({
      where: {
        stockEnabled: true,
      },
      select: {
        id: true,
        name: true,
        category: true,
        stockQuantity: true,
        lowStockThreshold: true,
      },
    });

    // Filter products where stock quantity is at or below threshold
    const lowStockProducts = allProducts
      .filter((product) => product.stockQuantity <= product.lowStockThreshold)
      .sort((a, b) => {
        // Sort by stock quantity ascending (lowest first), then by name
        if (a.stockQuantity !== b.stockQuantity) {
          return a.stockQuantity - b.stockQuantity;
        }
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({
      success: true,
      count: lowStockProducts.length,
      products: lowStockProducts,
    });
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    return NextResponse.json(
      { error: "Failed to fetch low stock products" },
      { status: 500 },
    );
  }
}
