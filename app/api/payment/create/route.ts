// app/api/payment/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/dal";
import { createPaymentSource, toAtomicAmount } from "@/lib/paymongo";
import { prisma } from "@/lib/prisma";

interface PaymentRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

    // Get user details for billing
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body: PaymentRequest = await request.json();
    const { items } = body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Order must contain at least one item" },
        { status: 400 }
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

    // Check if all products exist and are available
    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Some products are not available" },
        { status: 400 }
      );
    }

    // Calculate total
    let totalInPesos = 0;
    items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Product not found");
      totalInPesos += product.price * item.quantity;
    });

    // Convert to centavos (atomic amount)
    const totalInCentavos = toAtomicAmount(totalInPesos);

    // Get app URL from environment
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Create PayMongo payment source (GCash)
    const source = await createPaymentSource({
      amount: totalInCentavos,
      type: "gcash",
      redirect: {
        success: `${appUrl}/payment/success`,
        failed: `${appUrl}/payment/failed`,
      },
      billing: {
        name: user.name,
        email: user.email,
        phone: "+639000000000", // Default phone, can be made dynamic later
      },
    });

    // Store pending payment in database (optional, for tracking)
    // You can create a Payment table to track payment attempts
    // For now, we'll just return the checkout URL

    return NextResponse.json({
      success: true,
      checkoutUrl: source.attributes.redirect.checkout_url,
      sourceId: source.id,
      amount: totalInPesos,
      currency: "PHP",
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create payment",
      },
      { status: 500 }
    );
  }
}
