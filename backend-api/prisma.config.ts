import { defineConfig } from '@prisma/config';
import * as dotenv from 'dotenv';

// Paksa load file .env ke dalam process.env
dotenv.config();

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});