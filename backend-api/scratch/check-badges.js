const prisma = require('../src/config/prisma');

async function main() {
  console.log('🔍 [Database TrustBadge Check] Querying TrustBadge table...');
  try {
    const badges = await prisma.trustBadge.findMany({
      select: {
        id: true,
        name: true,
        badge_url: true,
        min_supporters: true
      }
    });

    console.log(`\nFound ${badges.length} trust badges in the database:`);
    badges.forEach(b => {
      console.log(`- ID: ${b.id} | Name: "${b.name}" | Min Supporters: ${b.min_supporters}`);
      console.log(`  Badge URL: ${b.badge_url}`);
    });
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
