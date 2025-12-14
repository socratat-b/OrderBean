// lib/paymongo.ts
import "server-only";

const PAYMONGO_API_URL = "https://api.paymongo.com/v1";
const SECRET_KEY = process.env.PAYMONGO_SECRET_KEY!;

if (!SECRET_KEY) {
  throw new Error("PAYMONGO_SECRET_KEY is not set in environment variables");
}

// PayMongo API Types
export type PaymentMethod = "gcash" | "paymaya" | "grab_pay" | "card";

export interface PayMongoSource {
  id: string;
  type: string;
  attributes: {
    amount: number;
    billing: {
      name: string;
      email: string;
      phone: string;
    };
    currency: string;
    livemode: boolean;
    redirect: {
      checkout_url: string;
      failed: string;
      success: string;
    };
    status: "pending" | "chargeable" | "cancelled" | "expired" | "paid";
    type: PaymentMethod;
  };
}

export interface PayMongoPayment {
  id: string;
  type: string;
  attributes: {
    amount: number;
    currency: string;
    description: string;
    livemode: boolean;
    source: {
      id: string;
      type: string;
    };
    status: "pending" | "paid" | "failed";
  };
}

export interface CreateSourceParams {
  amount: number; // in centavos (e.g., 10000 = ₱100.00)
  type: PaymentMethod;
  currency?: string;
  redirect: {
    success: string;
    failed: string;
  };
  billing: {
    name: string;
    email: string;
    phone: string;
  };
}

// Helper to encode Basic Auth
function getAuthHeader(): string {
  const encodedKey = Buffer.from(SECRET_KEY + ":").toString("base64");
  return `Basic ${encodedKey}`;
}

/**
 * Create a payment source (GCash, PayMaya, etc.)
 * @see https://developers.paymongo.com/reference/create-a-source
 */
export async function createPaymentSource(
  params: CreateSourceParams
): Promise<PayMongoSource> {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/sources`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: params.amount,
            redirect: params.redirect,
            billing: params.billing,
            type: params.type,
            currency: params.currency || "PHP",
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("PayMongo API Error:", error);
      throw new Error(
        error.errors?.[0]?.detail || "Failed to create payment source"
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating payment source:", error);
    throw error;
  }
}

/**
 * Create a payment from a chargeable source
 * @see https://developers.paymongo.com/reference/create-a-payment
 */
export async function createPayment(
  sourceId: string,
  amount: number,
  description: string,
  currency: string = "PHP"
): Promise<PayMongoPayment> {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: getAuthHeader(),
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount,
            source: {
              id: sourceId,
              type: "source",
            },
            currency,
            description,
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("PayMongo Payment Error:", error);
      throw new Error(
        error.errors?.[0]?.detail || "Failed to create payment"
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

/**
 * Retrieve a payment source by ID
 * @see https://developers.paymongo.com/reference/retrieve-a-source
 */
export async function getPaymentSource(
  sourceId: string
): Promise<PayMongoSource> {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/sources/${sourceId}`, {
      method: "GET",
      headers: {
        Authorization: getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.errors?.[0]?.detail || "Failed to retrieve payment source"
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error retrieving payment source:", error);
    throw error;
  }
}

/**
 * Retrieve a payment by ID
 * @see https://developers.paymongo.com/reference/retrieve-a-payment
 */
export async function getPayment(paymentId: string): Promise<PayMongoPayment> {
  try {
    const response = await fetch(`${PAYMONGO_API_URL}/payments/${paymentId}`, {
      method: "GET",
      headers: {
        Authorization: getAuthHeader(),
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.errors?.[0]?.detail || "Failed to retrieve payment"
      );
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("Error retrieving payment:", error);
    throw error;
  }
}

/**
 * Convert peso amount to centavos
 * Example: 100 PHP -> 10000 centavos
 */
export function toAtomicAmount(amountInPesos: number): number {
  return Math.round(amountInPesos * 100);
}

/**
 * Convert centavos to peso amount
 * Example: 10000 centavos -> 100 PHP
 */
export function fromAtomicAmount(amountInCentavos: number): number {
  return amountInCentavos / 100;
}
