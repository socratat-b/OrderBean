// prisma/seed-owner.ts
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Creating owner user...");

  const hashedPassword = await bcrypt.hash("owner123", 10);

  const owner = await prisma.user.create({
    data: {
      email: "owner@coffee.com",
      password: hashedPassword,
      name: "Coffee Shop Owner",
      role: "OWNER",
    },
  });

  console.log("✅ Created owner user:", owner.email);
  console.log("🔑 Password: owner123");
  console.log("🎉 Owner seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
