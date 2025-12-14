// app/api/webhooks/paymongo/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentSource, fromAtomicAmount } from "@/lib/paymongo";
import { orderEvents, ORDER_EVENTS } from "@/lib/events";
import { revalidatePath } from "next/cache";

/**
 * PayMongo Webhook Handler
 * Handles payment events from PayMongo (source.chargeable, payment.paid, etc.)
 *
 * To set up webhooks in PayMongo dashboard:
 * 1. Go to Developers > Webhooks
 * 2. Add endpoint URL: https://yourdomain.com/api/webhooks/paymongo
 * 3. Select events: source.chargeable, payment.paid, payment.failed
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("PayMongo webhook received:", JSON.stringify(body, null, 2));

    // PayMongo sends events in this format:
    // { data: { id, type, attributes: { type, data: { id, type, attributes } } } }
    const event = body.data;

    if (!event) {
      return NextResponse.json(
        { error: "Invalid webhook payload" },
        { status: 400 }
      );
    }

    const eventType = event.attributes?.type;
    const eventData = event.attributes?.data;

    console.log("Event type:", eventType);
    console.log("Event data:", eventData);

    // Handle source.chargeable event (when source becomes ready for payment)
    if (eventType === "source.chargeable") {
      const sourceId = eventData.id;
      const sourceAttributes = eventData.attributes;

      console.log("Source chargeable:", sourceId);
      console.log("Source status:", sourceAttributes.status);

      // You can create payment here or handle it in the success callback
      // For GCash, we'll handle order creation in the success page
      // since the user is redirected after payment

      return NextResponse.json({
        success: true,
        message: "Source chargeable event received",
      });
    }

    // Handle payment.paid event (when payment is successfully completed)
    if (eventType === "payment.paid") {
      const paymentId = eventData.id;
      const paymentAttributes = eventData.attributes;
      const sourceId = paymentAttributes.source?.id;

      console.log("Payment paid:", paymentId);
      console.log("Source ID:", sourceId);
      console.log("Amount:", paymentAttributes.amount);

      // Here you can create the order if not already created
      // This is a backup in case the success page fails
      // We'll implement order creation logic in the success page

      return NextResponse.json({
        success: true,
        message: "Payment paid event received",
      });
    }

    // Handle payment.failed event
    if (eventType === "payment.failed") {
      const paymentId = eventData.id;
      const paymentAttributes = eventData.attributes;

      console.log("Payment failed:", paymentId);
      console.log("Error:", paymentAttributes.last_payment_error);

      // Handle failed payment (notify user, log, etc.)

      return NextResponse.json({
        success: true,
        message: "Payment failed event received",
      });
    }

    // Unknown event type
    console.log("Unknown event type:", eventType);

    return NextResponse.json({
      success: true,
      message: "Event received",
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
