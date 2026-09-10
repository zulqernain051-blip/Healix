import { prisma } from '../../../../common/config/database';
import { Role } from '@prisma/client';
import crypto from 'crypto';

export class InviteUserUseCase {
  static async execute(data: { email?: string; phone?: string; role: Role }, adminUserId: string) {
    if (!data.email && !data.phone) {
      throw { statusCode: 400, message: 'Must provide either email or phone for invitation.' };
    }
    if (data.role !== 'DOCTOR' && data.role !== 'PARAMEDIC') {
      throw { statusCode: 400, message: 'Can only invite DOCTOR or PARAMEDIC.' };
    }

    // Check if user already exists
    if (data.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw { statusCode: 400, message: 'User with this email already exists.' };
    }
    if (data.phone) {
      const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
      if (existing) throw { statusCode: 400, message: 'User with this phone already exists.' };
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.invitation.create({
      data: {
        email: data.email,
        phone: data.phone,
        role: data.role,
        tokenHash,
        expiresAt,
        createdBy: adminUserId,
      }
    });

    await prisma.adminAuditLog.create({
      data: {
        adminId: adminUserId,
        action: `INVITE_${data.role}`,
        entityType: 'INVITATION',
        entityId: invitation.id,
        reason: 'Invited via Admin Portal'
      }
    });

    return { success: true, token: rawToken, message: `Invitation created successfully for ${data.role}` };
  }
}
