import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Attempting to connect to the database...");
    await prisma.$connect();
    console.log("Successfully connected to the database!");
    
    // Try a simple query
    const configCount = await prisma.config.count();
    console.log(`Connection works. Found ${configCount} config records.`);
  } catch (e) {
    console.error("Failed to connect:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
