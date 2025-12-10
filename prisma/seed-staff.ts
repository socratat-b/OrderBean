// prisma/seed-staff.ts
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Creating staff user...");

  const hashedPassword = await bcrypt.hash("staff123", 10);

  const staff = await prisma.user.create({
    data: {
      email: "staff@coffee.com",
      password: hashedPassword,
      name: "Staff Member",
      role: "STAFF",
    },
  });

  console.log("✅ Created staff user:", staff.email);
  console.log("🔑 Password: staff123");
  console.log("🎉 Staff seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
