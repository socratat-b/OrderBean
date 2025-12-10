// app/api/owner/products/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface CreateProductBody {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  available?: boolean;
}

// GET /api/owner/products - List all products (OWNER only)
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

    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}

// POST /api/owner/products - Create new product (OWNER only)
export async function POST(request: NextRequest) {
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

    const body: CreateProductBody = await request.json();
    const { name, description, price, category, imageUrl, available } = body;

    // Validate required fields
    if (!name || !price || !category) {
      return NextResponse.json(
        { error: "Name, price, and category are required" },
        { status: 400 },
      );
    }

    // Validate price
    if (price <= 0) {
      return NextResponse.json(
        { error: "Price must be greater than 0" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        category,
        imageUrl,
        available: available ?? true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 },
    );
  }
}
