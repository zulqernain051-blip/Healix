import { prisma } from './database';
import bcrypt from 'bcrypt';
import { logger } from '../utils/logger';

export async function seedAdmin() {
  try {
    // Check if admin exists
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    });

    if (adminCount === 0) {
      logger.info('[SEED] No admin user detected. Seeding default admin account...');
      const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
      const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
      if (!password || !email) { logger.warn('[SEED] Configure ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD to create the first administrator.'); return; }
      if (password.length < 12) throw new Error('Bootstrap administrator password must be at least 12 characters');
      const passwordHash = await bcrypt.hash(password, 12);
      
      await prisma.user.create({
        data: {
          email: email.trim().toLowerCase(),
          phone: '+923000000000',
          fullName: 'Healix System Administrator',
          passwordHash,
          role: 'ADMIN',
          status: 'ACTIVE',
          admin: { create: {} }
        }
      });
      logger.info('[SEED] Administrator created; credentials are not logged.');
    }

    // Seed default configs
    const configCount = await prisma.platformConfig.count();
    if (configCount === 0) {
      logger.info('[SEED] Seeding default platform configurations...');
      await prisma.platformConfig.createMany({
        data: [
          { key: 'platform_fee_pct', value: '10' },
          { key: 'escalation_sla_max_minutes', value: '15' }
        ]
      });
      logger.info('[SEED] Platform configurations successfully seeded.');
    }
  } catch (e: any) {
    logger.error(`[SEED ERROR] Failed to seed default admin or config: ${e.message}`);
  }
}
