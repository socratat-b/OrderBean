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

  // Delete in correct order (respect foreign keys)
  console.log("🗑️  Clearing existing data...");

  // 1. Delete OrderItems first (they reference Products and Orders)
  await prisma.orderItem.deleteMany({});
  console.log("   ✅ Cleared OrderItems");

  // 2. Delete Orders (they reference Users)
  await prisma.order.deleteMany({});
  console.log("   ✅ Cleared Orders");

  // 3. Now safe to delete Products
  await prisma.product.deleteMany({});
  console.log("   ✅ Cleared Products");

  // Create coffee products with Philippine Peso prices
  const products = [
    // COFFEE - Hot Espresso-Based
    {
      name: "Espresso",
      description: "Strong and bold shot of pure coffee",
      price: 95.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400",
      available: true,
    },
    {
      name: "Cappuccino",
      description: "Espresso with steamed milk and foam",
      price: 145.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400",
      available: true,
    },
    {
      name: "Latte",
      description: "Smooth espresso with lots of steamed milk",
      price: 155.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400",
      available: true,
    },
    {
      name: "Americano",
      description: "Espresso with hot water",
      price: 120.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400",
      available: true,
    },
    {
      name: "Mocha",
      description: "Chocolate and espresso with steamed milk",
      price: 165.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1607260550778-aa9d29444ce1?w=400",
      available: true,
    },
    {
      name: "Flat White",
      description: "Velvety microfoam with espresso",
      price: 150.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1520031441872-265e4ff70366?w=400",
      available: true,
    },
    {
      name: "Macchiato",
      description: "Espresso with a dollop of foamed milk",
      price: 125.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400",
      available: true,
    },
    {
      name: "Caramel Latte",
      description: "Creamy latte with sweet caramel syrup",
      price: 175.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1599750746212-b2f0fa572e0f?w=400",
      available: true,
    },
    {
      name: "Vanilla Latte",
      description: "Classic latte with smooth vanilla flavor",
      price: 175.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1579992357154-faf4bde95b3d?w=400",
      available: true,
    },
    {
      name: "Hazelnut Latte",
      description: "Rich latte with nutty hazelnut notes",
      price: 175.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400",
      available: true,
    },
    {
      name: "Cortado",
      description: "Equal parts espresso and steamed milk",
      price: 135.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400",
      available: true,
    },

    // COFFEE - Cold
    {
      name: "Iced Americano",
      description: "Chilled espresso with cold water",
      price: 130.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400",
      available: true,
    },
    {
      name: "Iced Latte",
      description: "Cold espresso with milk over ice",
      price: 165.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400",
      available: true,
    },
    {
      name: "Cold Brew",
      description: "Smooth, slow-steeped coffee served cold",
      price: 155.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400",
      available: true,
    },
    {
      name: "Iced Caramel Macchiato",
      description: "Layered vanilla, milk, espresso, and caramel",
      price: 185.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1562904403-a5106bef8120?w=400",
      available: true,
    },
    {
      name: "Affogato",
      description: "Vanilla ice cream drowned in hot espresso",
      price: 165.0,
      category: "Coffee",
      imageUrl:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400",
      available: true,
    },

    // PASTRIES - Sweet
    {
      name: "Croissant",
      description: "Buttery and flaky French pastry",
      price: 125.0,
      category: "Pastry",
      imageUrl:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
      available: true,
    },
    {
      name: "Pain au Chocolat",
      description: "Croissant filled with rich chocolate",
      price: 135.0,
      category: "Pastry",
      imageUrl:
        "https://images.unsplash.com/photo-1623334044303-241021148842?w=400",
      available: true,
    },
    {
      name: "Cinnamon Roll",
      description: "Soft roll with cinnamon and cream cheese frosting",
      price: 145.0,
      category: "Pastry",
      imageUrl:
        "https://images.unsplash.com/photo-1585503418537-88331351ad99?w=400",
      available: true,
    },
    {
      name: "Blueberry Muffin",
      description: "Freshly baked with real blueberries",
      price: 95.0,
      category: "Pastry",
      imageUrl:
        "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400",
      available: true,
    },
    {
      name: "Banana Bread",
      description: "Moist and sweet banana loaf slice",
      price: 105.0,
      category: "Pastry",
      imageUrl:
        "https://images.unsplash.com/photo-1606312619070-d48b4cff36f2?w=400",
      available: true,
    },
    {
      name: "Chocolate Chip Cookie",
      description: "Warm and gooey chocolate chip cookie",
      price: 75.0,
      category: "Pastry",
      imageUrl:
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400",
      available: true,
    },
    {
      name: "Brownie",
      description: "Fudgy chocolate brownie",
      price: 115.0,
      category: "Pastry",
      imageUrl:
        "https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400",
      available: true,
    },
    {
      name: "Glazed Donut",
      description: "Classic glazed donut",
      price: 65.0,
      category: "Pastry",
      imageUrl:
        "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400",
      available: true,
    },
    {
      name: "Blueberry Scone",
      description: "Buttery scone with blueberries",
      price: 110.0,
      category: "Pastry",
      imageUrl:
        "https://images.unsplash.com/photo-1618897996318-5a901fa6ca71?w=400",
      available: true,
    },

    // DESSERTS
    {
      name: "Cheesecake Slice",
      description: "Creamy New York-style cheesecake",
      price: 165.0,
      category: "Dessert",
      imageUrl:
        "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400",
      available: true,
    },
    {
      name: "Tiramisu",
      description: "Classic Italian coffee-flavored dessert",
      price: 175.0,
      category: "Dessert",
      imageUrl:
        "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
      available: true,
    },
    {
      name: "Chocolate Cake Slice",
      description: "Rich and moist chocolate layer cake",
      price: 155.0,
      category: "Dessert",
      imageUrl:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
      available: true,
    },

    // BEVERAGES - Non-Coffee
    {
      name: "Hot Chocolate",
      description: "Rich and creamy hot cocoa",
      price: 135.0,
      category: "Beverage",
      imageUrl:
        "https://images.unsplash.com/photo-1542990253-a781e04c0082?w=400",
      available: true,
    },
    {
      name: "Matcha Latte",
      description: "Japanese green tea with steamed milk",
      price: 165.0,
      category: "Beverage",
      imageUrl:
        "https://images.unsplash.com/photo-1536013290507-12c4e31da0e1?w=400",
      available: true,
    },
    {
      name: "Chai Tea Latte",
      description: "Spiced tea with steamed milk",
      price: 155.0,
      category: "Beverage",
      imageUrl:
        "https://images.unsplash.com/photo-1578899952107-9d8d3a862c24?w=400",
      available: true,
    },
    {
      name: "Earl Grey Tea",
      description: "Classic black tea with bergamot",
      price: 95.0,
      category: "Beverage",
      imageUrl:
        "https://images.unsplash.com/photo-1597318111126-a8b04d36c6e0?w=400",
      available: true,
    },
    {
      name: "Green Tea",
      description: "Light and refreshing Japanese green tea",
      price: 85.0,
      category: "Beverage",
      imageUrl:
        "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=400",
      available: true,
    },
    {
      name: "Berry Smoothie",
      description: "Blended mixed berries with yogurt",
      price: 175.0,
      category: "Beverage",
      imageUrl:
        "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400",
      available: true,
    },
    {
      name: "Mango Smoothie",
      description: "Tropical mango smoothie",
      price: 175.0,
      category: "Beverage",
      imageUrl:
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
      available: true,
    },
    {
      name: "Fresh Orange Juice",
      description: "Freshly squeezed orange juice",
      price: 125.0,
      category: "Beverage",
      imageUrl:
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400",
      available: true,
    },

    // FOOD - Savory
    {
      name: "Club Sandwich",
      description: "Triple-decker with turkey, bacon, lettuce, tomato",
      price: 215.0,
      category: "Food",
      imageUrl:
        "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400",
      available: true,
    },
    {
      name: "Chicken Panini",
      description: "Grilled chicken with pesto and mozzarella",
      price: 195.0,
      category: "Food",
      imageUrl:
        "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400",
      available: true,
    },
    {
      name: "Caprese Panini",
      description: "Fresh mozzarella, tomato, basil, balsamic",
      price: 185.0,
      category: "Food",
      imageUrl:
        "https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400",
      available: true,
    },
    {
      name: "Everything Bagel with Cream Cheese",
      description: "Toasted bagel with herb cream cheese",
      price: 115.0,
      category: "Food",
      imageUrl:
        "https://images.unsplash.com/photo-1551106652-a5bcf4b29ab6?w=400",
      available: true,
    },
    {
      name: "Avocado Toast",
      description: "Smashed avocado on sourdough with cherry tomatoes",
      price: 165.0,
      category: "Food",
      imageUrl:
        "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400",
      available: true,
    },
    {
      name: "Caesar Salad",
      description: "Crisp romaine with parmesan and croutons",
      price: 185.0,
      category: "Food",
      imageUrl:
        "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
      available: true,
    },
    {
      name: "Greek Salad",
      description: "Fresh vegetables with feta and olives",
      price: 175.0,
      category: "Food",
      imageUrl:
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
      available: true,
    },
    {
      name: "Quiche Lorraine",
      description: "Savory egg tart with bacon and cheese",
      price: 155.0,
      category: "Food",
      imageUrl:
        "https://images.unsplash.com/photo-1606787620819-8bdf0c44c293?w=400",
      available: true,
    },
  ];

  // Create each product
  console.log("📦 Creating products...");
  for (const product of products) {
    await prisma.product.create({
      data: product,
    });
    console.log(
      `   ✅ Created: ${product.name} - ₱${product.price.toFixed(2)}`,
    );
  }

  console.log("🎉 Seeding complete!");
  console.log(`📦 Total products: ${products.length}`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
