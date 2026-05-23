const prisma = require('./src/config/prisma');

async function restore() {
  try {
    console.log("Restoring original settings values...");
    const restored = await prisma.siteSetting.update({
      where: { id: '6d5cb7c0-b7ad-4cbb-8747-ace57cf62472' },
      data: {
        logoText: 'treetmi.id',
        logoUrl: '',
        iconUrl: '',
        companyName: 'PT Karya Putri Cikal',
        seoTitle: 'TreetMi.id- Platform Dukungan Kreator Terbesar di Indonesia',
        metaDesc: 'Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.',
        keywords: 'donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar',
        feeDonation: 5.00,
        feeMabar: 5.00,
        feeGift: 10.00,
        ahuNumber: 'AHU-A089891.AH.01.30.Tahun 2026',
        pseNumber: '',
        nibNumber: '1905260078829',
        ahuLogo: 'https://cdn-storage.treetmi.id/settings/setting-ahu-logo-1779397551762.webp',
        pseLogo: '',
        nibLogo: '',
        paymentGateway: 'MIDTRANS',
        paymentSandbox: true,
        midtransMerchantId: '',
        midtransClientKey: '',
        midtransServerKey: '',
        xenditApiKey: '',
        discordUrl: '',
        xUrl: '',
        instagramUrl: '',
        tiktokUrl: '',
        showLeaderboard: true
      }
    });
    console.log("SUCCESS! Restored original settings:", restored);
  } catch (err) {
    console.error("ERROR RESTORING:", err);
  } finally {
    await prisma.$disconnect();
  }
}

restore();
