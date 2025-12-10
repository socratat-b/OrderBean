// prisma/seed.ts
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create coffee products
  const products = [
    {
      name: "Espresso",
      description: "Strong and bold shot of pure coffee",
      price: 2.5,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400",
      available: true,
    },
    {
      name: "Cappuccino",
      description: "Espresso with steamed milk and foam",
      price: 4.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
      available: true,
    },
    {
      name: "Latte",
      description: "Smooth espresso with lots of steamed milk",
      price: 4.5,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400",
      available: true,
    },
    {
      name: "Americano",
      description: "Espresso with hot water",
      price: 3.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400",
      available: true,
    },
    {
      name: "Mocha",
      description: "Chocolate and espresso with steamed milk",
      price: 5.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1607260550778-aa9d29444ce1?w=400",
      available: true,
    },
    {
      name: "Croissant",
      description: "Buttery and flaky French pastry",
      price: 3.5,
      category: "Pastry",
      imageUrl:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
      available: true,
    },
    {
      name: "Blueberry Muffin",
      description: "Freshly baked with real blueberries",
      price: 3.0,
      category: "Pastry",
      imageUrl:
        "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400",
      available: true,
    },
    {
      name: "Chocolate Chip Cookie",
      description: "Warm and gooey chocolate chip cookie",
      price: 2.5,
      category: "Pastry",
      imageUrl:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400",
      available: true,
    },
  ];

  // Create each product
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
    console.log(`✅ Created: ${product.name}`);
  }

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
