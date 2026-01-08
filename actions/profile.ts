"use server";

import { getSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Server-side data fetching (for Server Components)
export async function getProfileStatsServer() {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    // Only customers can access their profile stats
    if (session.role !== "CUSTOMER") {
      return null;
    }

    // Get user orders with items
    const orders = await prisma.order.findMany({
      where: {
        userId: session.userId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Calculate statistics
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
    const completedOrders = orders.filter(
      (order) => order.status === "COMPLETED"
    ).length;

    // Find favorite product (most ordered)
    const productCounts: Record<string, { name: string; count: number }> = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const productId = item.productId;
        const productName = item.product.name;

        if (!productCounts[productId]) {
          productCounts[productId] = { name: productName, count: 0 };
        }
        productCounts[productId].count += item.quantity;
      });
    });

    const favoriteProduct = Object.values(productCounts).sort(
      (a, b) => b.count - a.count
    )[0];

    return {
      totalOrders,
      totalSpent,
      completedOrders,
      favoriteProduct: favoriteProduct
        ? {
            name: favoriteProduct.name,
            orderCount: favoriteProduct.count,
          }
        : null,
    };
  } catch (error) {
    console.error("Failed to fetch profile stats:", error);
    return null;
  }
}

interface UpdateProfileData {
  name?: string;
  phone?: string | null;
  barangay?: string | null;
  street?: string | null;
  landmark?: string | null;
}

export async function updateProfile(data: UpdateProfileData) {
  try {
    const session = await getSession();
    if (!session) {
      return { error: "Unauthorized" };
    }

    // Only customers can update their profile
    if (session.role !== "CUSTOMER") {
      return { error: "This feature is only available for customers" };
    }

    // Validate name if provided
    if (data.name !== undefined) {
      if (!data.name || typeof data.name !== "string" || data.name.trim().length === 0) {
        return { error: "Name is required and must be a non-empty string" };
      }

      if (data.name.trim().length < 2) {
        return { error: "Name must be at least 2 characters long" };
      }
    }

    // Validate phone if provided (Philippine format)
    if (data.phone !== undefined && data.phone !== null && data.phone.trim() !== "") {
      const phoneRegex = /^(09|\+639)\d{9}$/;
      if (!phoneRegex.test(data.phone.replace(/\s/g, ""))) {
        return { error: "Invalid phone format. Use 09XXXXXXXXX or +639XXXXXXXXX" };
      }
    }

    // Build update data object
    const updateData: UpdateProfileData = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.phone !== undefined) {
      updateData.phone = data.phone === null || data.phone.trim() === "" ? null : data.phone.trim();
    }
    if (data.barangay !== undefined) {
      updateData.barangay = data.barangay === null || data.barangay.trim() === "" ? null : data.barangay.trim();
    }
    if (data.street !== undefined) {
      updateData.street = data.street === null || data.street.trim() === "" ? null : data.street.trim();
    }
    if (data.landmark !== undefined) {
      updateData.landmark = data.landmark === null || data.landmark.trim() === "" ? null : data.landmark.trim();
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: {
        id: session.userId,
      },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        barangay: true,
        street: true,
        landmark: true,
        role: true,
      },
    });

    // Revalidate the profile page to show updated data
    revalidatePath("/profile");

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { error: "Failed to update profile" };
  }
}
