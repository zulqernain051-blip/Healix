import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from the .env file in the backend root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL is required'
  }).url('DATABASE_URL must be a valid connection URL'),
  JWT_SECRET: z.string({
    required_error: 'JWT_SECRET is required'
  }).min(10, 'JWT_SECRET must be at least 10 characters long'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string({
    required_error: 'JWT_REFRESH_SECRET is required'
  }).min(10, 'JWT_REFRESH_SECRET must be at least 10 characters long'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d')
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(JSON.stringify(result.error.format(), null, 2));
  process.exit(1);
}

export const config = result.data;
export type ConfigType = typeof config;
