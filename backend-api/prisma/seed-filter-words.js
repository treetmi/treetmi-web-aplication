const prisma = require('../src/config/prisma');

const GAMBLING_KEYWORDS = [
  'slot', 'judi', 'gacor', 'maxwin', 'zeus', 'scatter', 'pragmatic', 'olympus', 
  'bonanza', 'jackpot', 'sbobet', 'togel', 'casino', 'kasino', 'bandar', 
  'betting', 'slot88', 'slot777', 'lotto', 'poker', 'roulette', 'baccarat', 
  'judol', 'slotter', 'depo', 'wd', 'deposit', 'withdraw'
];

const PROFANITY_WORDS = [
  'anjing', 'babi', 'monyet', 'bangsat', 'kontol', 'memek', 'ngentot', 
  'jembut', 'pantek', 'asu', 'bajingan', 'bego', 'goblok', 'tolol', 
  'peler', 'perek', 'lonte', 'sundal', 'pecun', 'fuck', 'shit', 'bitch'
];

async function main() {
  console.log('🌱 Seeding filter words to PostgreSQL...');
  
  let insertedCount = 0;
  
  // Insert gambling keywords
  for (const word of GAMBLING_KEYWORDS) {
    try {
      await prisma.filterWord.upsert({
        where: { word: word.toLowerCase() },
        update: {},
        create: {
          word: word.toLowerCase(),
          type: 'GAMBLING'
        }
      });
      insertedCount++;
    } catch (e) {
      console.error(`Failed to insert ${word}:`, e.message);
    }
  }
  
  // Insert profanity words
  for (const word of PROFANITY_WORDS) {
    try {
      await prisma.filterWord.upsert({
        where: { word: word.toLowerCase() },
        update: {},
        create: {
          word: word.toLowerCase(),
          type: 'PROFANITY'
        }
      });
      insertedCount++;
    } catch (e) {
      console.error(`Failed to insert ${word}:`, e.message);
    }
  }
  
  console.log(`✅ Finished seeding! Total inserted/upserted words: ${insertedCount}`);
}

main()
  .catch(e => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
