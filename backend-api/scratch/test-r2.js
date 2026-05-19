require('dotenv').config();
const { uploadToR2 } = require('../src/config/r2');

async function main() {
  console.log('☁️ [R2 Test] Running Cloudflare R2 upload test with dotenv loaded...');
  const buffer = Buffer.from('Treetmi R2 Integration Test File');
  try {
    const url = await uploadToR2(buffer, 'test-r2-upload.txt', 'text/plain');
    if (url) {
      console.log('🎉 [R2 Test] Upload SUCCESSFUL! CDN URL:', url);
    } else {
      console.log('⚠️ [R2 Test] R2 client is not configured or not loaded.');
    }
  } catch (error) {
    console.error('❌ [R2 Test] R2 Upload Failed with Error:', error);
  }
}

main();
