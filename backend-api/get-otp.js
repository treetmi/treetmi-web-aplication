const prisma = require('./src/config/prisma');
async function main() {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: 'BudiGamer' },
        { username: 'budigamer' }
      ]
    }
  });
  console.log(`ACTIVE OTP for BudiGamer: ${user ? user.otp_code : 'NOT FOUND'}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
