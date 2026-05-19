const prisma = require('../src/config/prisma');

async function main() {
  console.log('🔍 [Database Avatar Check] Querying Avatar table...');
  try {
    const avatars = await prisma.avatar.findMany({
      select: {
        id: true,
        name: true,
        url: true
      }
    });

    console.log(`\nFound ${avatars.length} avatars in the database:`);
    avatars.forEach(a => {
      console.log(`- ID: ${a.id} | Name: "${a.name}"`);
      console.log(`  URL: ${a.url.substring(0, 100)}${a.url.length > 100 ? '...' : ''} (${a.url.length} chars)`);
    });
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
