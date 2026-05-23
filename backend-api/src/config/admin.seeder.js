const prisma = require('./prisma');
const { hashPassword } = require('./admin-auth');

/**
 * Seed superadmin ke database jika belum ada superadmin terdaftar
 */
async function seedSuperadmin() {
  try {
    const adminCount = await prisma.superadmin.count();
    if (adminCount === 0) {
      console.log('🌱 Seeding default Superadmin account...');
      const hashedPassword = hashPassword('admin123');
      await prisma.superadmin.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          twoFactorEnabled: false
        }
      });
      console.log('👑 Default Superadmin seeded successfully (Username: admin, Password: admin123)');
    }
  } catch (error) {
    console.error('❌ Failed to seed Superadmin:', error);
  }
}

module.exports = { seedSuperadmin };
