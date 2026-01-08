"use server";

import { cache } from "react";
import { unstable_cache, revalidatePath } from "next/cache";
import { getSession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

// Helper function to fetch stats for a specific user
// Cached with Next.js cache (5 minutes) and tagged for revalidation
const getCachedProfileStats = (userId: string) =>
  unstable_cache(
    async () => {
      // Use parallel queries for better performance
      const [orderAggregates, completedCount, favoriteProductData] = await Promise.all([
        // Get total orders and total spent using aggregation
        prisma.order.aggregate({
          where: { userId },
          _count: true,
          _sum: { total: true },
        }),

        // Get completed orders count
        prisma.order.count({
          where: {
            userId,
            status: "COMPLETED",
          },
        }),

        // Get favorite product (most ordered) using raw SQL for efficiency
        prisma.$queryRaw<Array<{ productId: string; productName: string; totalQuantity: bigint }>>`
          SELECT
            oi."productId",
            p.name as "productName",
            SUM(oi.quantity) as "totalQuantity"
          FROM "OrderItem" oi
          INNER JOIN "Order" o ON oi."orderId" = o.id
          INNER JOIN "Product" p ON oi."productId" = p.id
          WHERE o."userId" = ${userId}
          GROUP BY oi."productId", p.name
          ORDER BY "totalQuantity" DESC
          LIMIT 1
        `,
      ]);

      return {
        totalOrders: orderAggregates._count,
        totalSpent: orderAggregates._sum.total ?? 0,
        completedOrders: completedCount,
        favoriteProduct: favoriteProductData[0]
          ? {
              name: favoriteProductData[0].productName,
              orderCount: Number(favoriteProductData[0].totalQuantity),
            }
          : null,
      };
    },
    [`profile-stats-${userId}`],
    {
      revalidate: 300, // Cache for 5 minutes
      tags: [`profile-stats-${userId}`],
    }
  )();

// Server-side data fetching (for Server Components)
// Wrapped with React.cache() to deduplicate calls within the same render
export const getProfileStatsServer = cache(async () => {
  try {
    const session = await getSession();
    if (!session) {
      return null;
    }

    // Only customers can access their profile stats
    if (session.role !== "CUSTOMER") {
      return null;
    }

    return await getCachedProfileStats(session.userId);
  } catch (error) {
    console.error("Failed to fetch profile stats:", error);
    return null;
  }
});

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
