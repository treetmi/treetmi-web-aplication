const prisma = require('../src/config/prisma');

async function main() {
  console.log('🔍 [Database User Check] Querying database...');
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        avatar_url: true,
        email_verified: true
      }
    });

    console.log(`\nFound ${users.length} users in the database:`);
    console.table(users);
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
