// app/api/orders/route.ts
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/dal";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { orderEvents, ORDER_EVENTS } from "@/lib/events";

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

    // Check stock availability for products with stock tracking enabled
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;

      if (product.stockEnabled) {
        if (product.stockQuantity < item.quantity) {
          return NextResponse.json(
            {
              error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`,
            },
            { status: 400 },
          );
        }
      }
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

    // Create order with items and deduct stock in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
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

      // Deduct stock for products with stock tracking enabled
      for (const item of items) {
        const product = products.find((p) => p.id === item.productId);
        if (product && product.stockEnabled) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return newOrder;
    });

    // Check for low stock and emit alerts
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product && product.stockEnabled) {
        const newStockQuantity = product.stockQuantity - item.quantity;

        // Check if stock is low or out of stock
        if (newStockQuantity <= product.lowStockThreshold) {
          // Emit low stock alert event
          await orderEvents.emit(ORDER_EVENTS.LOW_STOCK_ALERT, {
            productId: product.id,
            productName: product.name,
            stockQuantity: newStockQuantity,
            lowStockThreshold: product.lowStockThreshold,
            timestamp: Date.now(),
          });
        }
      }
    }

    // Invalidate the user's orders cache for ISR
    revalidatePath("/orders");

    // Invalidate profile stats cache (will update stats on next visit)
    // Note: revalidateTag API changed in Next.js 16
    // revalidateTag(`profile-stats-${userId}`);

    // Emit event for real-time updates
    await orderEvents.emit(ORDER_EVENTS.ORDER_CREATED, {
      orderId: order.id,
      userId: order.userId,
      status: order.status,
      timestamp: Date.now(),
    });

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
