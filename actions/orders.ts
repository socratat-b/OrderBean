// actions/orders.ts
"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";
import { revalidateTag } from "next/cache";

export async function createOrder(items: { productId: string; quantity: number }[]) {
  const session = await verifySession();

  if (!session?.userId) {
    redirect("/login");
  }

  if (items.length === 0) {
    return { error: "Your order is empty!" };
  }

  try {
    // Calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return { error: `Product not found: ${item.productId}` };
      }

      total += product.price * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create order with order items
    const order = await prisma.order.create({
      data: {
        userId: session.userId,
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

    // Invalidate profile stats cache for this user
    revalidateTag(`profile-stats-${session.userId}`);

    return { success: true, order };
  } catch (error) {
    console.error("Error creating order:", error);
    return { error: "Failed to place order" };
  }
}
