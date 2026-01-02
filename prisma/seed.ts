import { prisma } from '../lib/prisma';
import { bookSeedData } from '../lib/book/bookseeddata';

async function main() {
  console.log("🌱 Starting database seeding...");
  await prisma.book.deleteMany();

  await prisma.book.createMany({
    data: bookSeedData,
  });

  console.log("✅ Database seeding completed.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });