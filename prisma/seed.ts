import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.preorder.createMany({
    data: [
      { name: "Multi variant 3", products: 1, preorderWhen: "out-of-stock", startsAt: new Date("2025-12-15T20:24:00"), status: false },
      { name: "Multi variant 2", products: 1, preorderWhen: "regardless-of-stock", startsAt: new Date("2025-12-15T20:24:00"), endsAt: new Date("2025-12-15T20:27:00"), status: true },
      { name: "Multi variants 1", products: 1, preorderWhen: "regardless-of-stock", startsAt: new Date("2025-12-15T20:24:00"), status: true },
      { name: "Partial payment", products: 1, preorderWhen: "regardless-of-stock", startsAt: new Date("2025-08-17T16:56:00"), status: true },
      { name: "Shipping not sure", products: 1, preorderWhen: "regardless-of-stock", startsAt: new Date("2025-08-17T16:56:00"), status: true },
      { name: "Full payment", products: 1, preorderWhen: "regardless-of-stock", startsAt: new Date("2025-08-17T16:56:00"), status: true },
      { name: "Coming soon", products: 1, preorderWhen: "regardless-of-stock", startsAt: new Date("2025-12-11T04:42:00"), status: true },
      { name: "With ends", products: 1, preorderWhen: "regardless-of-stock", startsAt: new Date("2025-08-14T03:59:00"), status: true },
    ],
  });
  console.log("✅ Seeded successfully!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());