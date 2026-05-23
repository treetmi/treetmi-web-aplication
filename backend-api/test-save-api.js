const jwt = require('jsonwebtoken');
const http = require('http');

const token = jwt.sign(
  { id: '6d5cb7c0-b7ad-4cbb-8747-ace57cf62472', username: 'admin', isAdmin: true },
  'streamplay_super_secret_key_2026',
  { expiresIn: '1d' }
);

const payload = JSON.stringify({
  logoText: "treetmi.id",
  logoUrl: "",
  iconUrl: "",
  companyName: "PT Karya Putri Cikal",
  ahuNumber: "AHU-A089891.AH.01.30.Tahun 2026",
  pseNumber: "",
  nibNumber: "1905260078829",
  ahuLogo: "https://cdn-storage.treetmi.id/settings/setting-ahu-logo-1779397551762.webp",
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
  showLeaderboard: true,
  seoTitle: "TreetMi.id- Platform Dukungan Kreator Terbesar di Indonesia",
  metaDesc: "Beri dukungan langsung berupa donasi, mabar, dan jasa murni kepada streamer, game developer, dan designer favoritmu dengan fee potongan terendah.",
  keywords: "donasi, creator platform, streamer, game developer, coder, designer, treetmi, mabar",
  feeDonation: 5.00,
  feeMabar: 5.00,
  feeGift: 10.00,
  rates: {
    USD: 16000,
    MYR: 3400,
    SGD: 11800,
    PHP: 280,
    THB: 440
  }
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/admin/settings',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
    'Authorization': `Bearer ${token}`
  }
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log("RESPONSE STATUS:", res.statusCode);
    console.log("RESPONSE BODY:", data);
  });
});

req.on('error', (e) => {
  console.error("REQUEST ERROR:", e.message);
});

req.write(payload);
req.end();
