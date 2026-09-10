import { prisma } from '../../../../common/config/database';
import * as bcrypt from 'bcrypt';
import crypto from 'crypto';



export class RegisterInvitedUseCase {
  static async execute(data: any) {
    const tokenHash = crypto.createHash('sha256').update(data.invitationToken).digest('hex');

    const invitation = await prisma.invitation.findUnique({ where: { tokenHash } });
    if (!invitation) throw { statusCode: 400, message: 'Invalid invitation token.' };
    if (invitation.usedAt) throw { statusCode: 400, message: 'Invitation has already been used.' };
    if (invitation.expiresAt < new Date()) throw { statusCode: 400, message: 'Invitation has expired.' };

    if (invitation.email && data.email !== invitation.email) {
      throw { statusCode: 400, message: 'Email does not match invitation.' };
    }
    if (invitation.phone && data.phone !== invitation.phone) {
      throw { statusCode: 400, message: 'Phone does not match invitation.' };
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    return await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          phone: data.phone,
          fullName: data.fullName,
          passwordHash,
          role: invitation.role, // Enforced from invitation
          status: 'PENDING_VERIFICATION', // Will need admin approval to activate credentials
        }
      });

      if (invitation.role === 'DOCTOR') {
        await tx.doctor.create({
          data: {
            userId: user.id,
            pmdcNumber: data.professionalId || '',
            specialization: data.specialization || 'General',
            experienceYears: 0,
            verificationStatus: 'PENDING',
          }
        });
      } else if (invitation.role === 'PARAMEDIC') {
        await tx.paramedic.create({
          data: {
            userId: user.id,
            certificationNumber: data.professionalId || '',
            verificationStatus: 'PENDING',
            currentHospitalId: null,
          }
        });
      }

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() }
      });

      return { user };
    });
  }
}
