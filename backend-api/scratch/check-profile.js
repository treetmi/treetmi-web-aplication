const prisma = require('../src/config/prisma');

async function main() {
  console.log('🔍 [Database User Check] Querying nodesapi user...');
  try {
    const user = await prisma.user.findFirst({
      where: {
        username: 'nodesapi'
      }
    });

    if (user) {
      console.log('User found:');
      console.log(`- ID: ${user.id}`);
      console.log(`- Username: ${user.username}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Avatar URL: ${user.avatar_url}`);
    } else {
      console.log('❌ User nodesapi not found!');
    }
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
