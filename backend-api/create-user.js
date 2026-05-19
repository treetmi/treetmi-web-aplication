const prisma = require('./src/config/prisma');

async function main() {
  const args = process.argv.slice(2);
  const usernameInput = args[0] || 'budigamer';
  const emailInput = args[1] || `${usernameInput}@treetmi.id`;

  console.log(`Checking database for user: "${usernameInput}"...`);

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { username: usernameInput }
  });

  if (existing) {
    console.log('User already exists in the database:\n', JSON.stringify(existing, null, 2));
    return;
  }

  console.log(`Creating new creator account with username: "${usernameInput}" and email: "${emailInput}"...`);

  const newUser = await prisma.user.create({
    data: {
      username: usernameInput,
      email: emailInput,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
      youtube_url: 'https://youtube.com',
      discord_url: 'https://discord.com',
      is_live: true,
      balance: 1500000.00 // Default starter balance (Rp 1.500.000)
    }
  });

  // Create default packages for the newly created user/creator
  console.log('Creating default packages/services...');
  await prisma.gamePackage.createMany({
    data: [
      {
        streamer_id: newUser.id,
        game_name: 'Custom Consultation 1-on-1',
        price_per_slot: 75000.00,
        status: 'ACTIVE'
      },
      {
        streamer_id: newUser.id,
        game_name: 'Full Code & Tech Review',
        price_per_slot: 120000.00,
        status: 'ACTIVE'
      }
    ]
  });

  console.log('\n🎉 Successfully created creator/admin account in PostgreSQL database!');
  console.log(JSON.stringify(newUser, null, 2));
}

main()
  .catch((e) => {
    console.error('Error creating user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
