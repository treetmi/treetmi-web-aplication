const prisma = require('./src/config/prisma');

async function test() {
  try {
    console.log("Checking DB Connection and querying settings...");
    let settings = await prisma.siteSetting.findFirst();
    console.log("Existing Settings Row:", settings);

    const dataPayload = {
      logoText: "treetmi",
      logoUrl: "",
      iconUrl: "",
      companyName: "PT Asosiasi Karya Treetmi",
      seoTitle: "Treetmi.id - Platform Dukungan Kreator Terbesar di Indonesia",
      metaDesc: "Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.",
      keywords: "donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar",
      feeDonation: 5.00,
      feeMabar: 8.00,
      feeGift: 10.00,
      ahuNumber: "",
      pseNumber: "",
      nibNumber: "",
      ahuLogo: "",
      pseLogo: "",
      nibLogo: "",
      paymentGateway: "MIDTRANS",
      paymentSandbox: true,
      midtransMerchantId: "",
      midtransClientKey: "",
      midtransServerKey: "",
      xenditApiKey: "",
      discordUrl: "",
      xUrl: "",
      instagramUrl: "",
      tiktokUrl: "",
      showLeaderboard: false
    };

    if (settings) {
      console.log("Updating setting row...");
      settings = await prisma.siteSetting.update({
        where: { id: settings.id },
        data: dataPayload
      });
    } else {
      console.log("Creating new setting row...");
      settings = await prisma.siteSetting.create({
        data: dataPayload
      });
    }
    console.log("SUCCESS! Saved Settings:", settings);
  } catch (err) {
    console.error("ERROR EXECUTING PRISMA CALL:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
