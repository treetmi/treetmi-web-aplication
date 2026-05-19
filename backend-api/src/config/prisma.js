const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv').config();

/**
 * Inisialisasi Prisma Client dengan Driver Adapter (Wajib di Prisma 7 
 * jika URL tidak didefinisikan di schema).
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

console.log('⚙️ Prisma Client Configured with Driver Adapter (PG)');

module.exports = prisma;
