require('dotenv').config();
const { deleteFromR2 } = require('../src/config/r2');

async function main() {
  const url = 'https://cdn-storage.treetmi.id/uploads/1779184688719-avatar-master-avatar-custom-1-1779184688719.png';
  console.log(`🧹 Attempting to delete URL: ${url}`);
  const result = await deleteFromR2(url);
  console.log(`Result: ${result}`);
}

main();
