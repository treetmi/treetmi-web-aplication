const prisma = require('../src/config/prisma');

async function run() {
  try {
    await prisma.$connect();
    const result = await prisma.$queryRaw`SELECT version();`;
    console.log("\n==================================================");
    console.log("POSTGRESQL SERVER VERSION DETAILS:");
    console.log("==================================================");
    console.log(result[0].version);
    console.log("==================================================\n");
  } catch (err) {
    console.error("Error querying PostgreSQL version:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
