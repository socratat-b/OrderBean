// app/api/orders/route.ts
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Define proper types
interface OrderItemInput {
  productId: string;
  quantity: number;
}

interface CreateOrderBody {
  items: OrderItemInput[];
}

// GET /api/orders - Get user's orders (Protected)
export async function GET(request: NextRequest) {
  try {
    // Verify session using DAL
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
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

// POST /api/orders - Create new order (Protected)
export async function POST(request: NextRequest) {
  try {
    // Verify session using DAL
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

    const body: CreateOrderBody = await request.json();
    const { items } = body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 },
      );
    }

    // Fetch products to calculate total
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        available: true,
      },
    });

    // Check if all products exist
    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Some products are not available" },
        { status: 400 },
      );
    }

    // Calculate total
    let total = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Product not found");

      const price = product.price;
      total += price * item.quantity;

      return {
        productId: item.productId,
        quantity: item.quantity,
        price: price, // Store price at time of order
      };
    });

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        status: "PENDING",
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Invalidate the user's orders cache for ISR
    revalidatePath("/orders");

    return NextResponse.json(
      {
        success: true,
        message: "Order placed successfully!",
        order,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 },
    );
  }
}
