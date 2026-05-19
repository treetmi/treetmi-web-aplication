const prisma = require('./src/config/prisma');

async function main() {
  console.log('🧹 Clearing old data from the database...');
  await prisma.avatar.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.bankAccount.deleteMany();
  await prisma.mabarQueue.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.gamePackage.deleteMany();
  await prisma.user.deleteMany();

  console.log('👥 Seeding Creators/Streamers into PostgreSQL...');
  
  // 1. Create Users
  const budi = await prisma.user.create({
    data: {
      username: 'BudiGamer',
      email: 'budi@gmail.com',
      balance: 520000.00,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
      youtube_url: 'https://youtube.com',
      discord_url: 'https://discord.com',
      is_live: true,
    }
  });

  const sultan = await prisma.user.create({
    data: {
      username: 'SultanTech',
      email: 'sultan@github.com',
      balance: 2450000.00,
      avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop',
      youtube_url: 'https://youtube.com',
      discord_url: 'https://discord.com',
      is_live: false,
    }
  });

  const rian = await prisma.user.create({
    data: {
      username: 'RianDesign',
      email: 'rian@behance.net',
      balance: 80000.00,
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      youtube_url: 'https://youtube.com',
      discord_url: 'https://discord.com',
      is_live: true,
    }
  });

  const clara = await prisma.user.create({
    data: {
      username: 'ClaraSketch',
      email: 'clara@instagram.com',
      balance: 0.00,
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
      youtube_url: 'https://youtube.com',
      discord_url: 'https://discord.com',
      is_live: false,
    }
  });

  console.log('🏦 Seeding Bank Accounts...');
  
  // 2. Create Bank Accounts
  await prisma.bankAccount.create({
    data: {
      streamer_id: budi.id,
      bank_name: 'BCA',
      account_number: '8820491024',
      account_holder_name: 'Budi Setiawan'
    }
  });

  await prisma.bankAccount.create({
    data: {
      streamer_id: sultan.id,
      bank_name: 'MANDIRI',
      account_number: '124000982718',
      account_holder_name: 'Sultan Al-Farabi'
    }
  });

  await prisma.bankAccount.create({
    data: {
      streamer_id: rian.id,
      bank_name: 'GOPAY',
      account_number: '08127382619',
      account_holder_name: 'Rian Hidayat'
    }
  });

  await prisma.bankAccount.create({
    data: {
      streamer_id: clara.id,
      bank_name: 'OVO',
      account_number: '085290481024',
      account_holder_name: 'Clara Devina'
    }
  });

  console.log('🎮 Seeding Mabar/Donation Packages...');
  
  // 3. Create Packages
  await prisma.gamePackage.createMany({
    data: [
      {
        streamer_id: budi.id,
        game_name: 'Mabar Mobile Legends (Tier Mythic)',
        price_per_slot: 25000.00,
        status: 'ACTIVE'
      },
      {
        streamer_id: budi.id,
        game_name: 'Mabar PUBG Mobile (Rank Push)',
        price_per_slot: 35000.00,
        status: 'ACTIVE'
      },
      {
        streamer_id: sultan.id,
        game_name: 'Tech Stack Strategy Session',
        price_per_slot: 150000.00,
        status: 'ACTIVE'
      }
    ]
  });

  console.log('💸 Seeding Transactions...');

  // 4. Create Transactions
  await prisma.transaction.create({
    data: {
      reference_id: 'TRX-1001',
      streamer_id: budi.id,
      sender_name: 'GamerSangar',
      gross_amount: 50000.00,
      platform_fee: 2500.00,
      net_amount: 47500.00,
      type: 'MABAR',
      status: 'SUCCESS',
      message: 'Mabar bro 2 slot ya, gas push mythic star!'
    }
  });

  await prisma.transaction.create({
    data: {
      reference_id: 'TRX-1002',
      streamer_id: sultan.id,
      sender_name: 'AhmadStartup',
      gross_amount: 300000.00,
      platform_fee: 15000.00,
      net_amount: 285000.00,
      type: 'MABAR',
      status: 'SUCCESS',
      message: 'Konsultasi arsitektur microservices nodejs'
    }
  });

  await prisma.transaction.create({
    data: {
      reference_id: 'TRX-1003',
      streamer_id: rian.id,
      sender_name: 'AndiPratama',
      gross_amount: 20000.00,
      platform_fee: 1000.00,
      net_amount: 19000.00,
      type: 'DONATION',
      status: 'SUCCESS',
      message: 'Kopi darat buat nemenin begadang desain!'
    }
  });

  console.log('📤 Seeding Creator Withdrawal Requests...');

  // 5. Create Withdrawals
  await prisma.withdrawal.create({
    data: {
      id: 'a5f22312-3211-4ca0-9810-77a012377701',
      streamer_id: rian.id,
      amount_requested: 150000.00,
      disbursement_fee: 5000.00,
      status: 'PENDING',
      reference_id: 'REF-WD7701'
    }
  });

  await prisma.withdrawal.create({
    data: {
      id: 'b5f22312-3211-4ca0-9810-77a012377702',
      streamer_id: budi.id,
      amount_requested: 300000.00,
      disbursement_fee: 5000.00,
      status: 'SUCCESS',
      reference_id: 'REF-WD7702'
    }
  });

  await prisma.withdrawal.create({
    data: {
      id: 'c5f22312-3211-4ca0-9810-77a012377703',
      streamer_id: sultan.id,
      amount_requested: 1000000.00,
      disbursement_fee: 5000.00,
      status: 'FAILED',
      reference_id: 'REF-WD7703'
    }
  });
  
  console.log('🖼️ Seeding Master Avatars...');
  await prisma.avatar.createMany({
    data: [
      { name: 'Casual Gamer Guy', url: '/avatars/avatar-1.svg' },
      { name: 'Tech Hacker Girl', url: '/avatars/avatar-2.svg' },
      { name: 'Retro Console Gamer', url: '/avatars/avatar-3.svg' },
      { name: 'VR Sci-Fi Head', url: '/avatars/avatar-4.svg' },
      { name: 'Cute Anime Girl', url: '/avatars/avatar-5.svg' },
      { name: 'Esports Pro Streamer', url: '/avatars/avatar-6.svg' },
      { name: 'Cyberpunk Neon Kid', url: '/avatars/avatar-7.svg' },
      { name: 'Pixel Art Specialist', url: '/avatars/avatar-8.svg' }
    ]
  });

  console.log('\n🎉 PostgreSQL Database successfully seeded with rich mock/dummy data!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
