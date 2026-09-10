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
      const passwordHash = await bcrypt.hash('Admin@1234', 10);
      
      await prisma.user.create({
        data: {
          email: 'admin@healix.pk',
          phone: '+923000000000',
          fullName: 'Healix System Administrator',
          passwordHash,
          role: 'ADMIN',
          status: 'ACTIVE',
          admin: { create: {} }
        }
      });
      logger.info('[SEED] Default admin seeded: admin@healix.pk (Admin@1234)');
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
