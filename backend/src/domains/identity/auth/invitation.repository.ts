import { prisma } from '../../../common/config/database';
import { RegisterInvitedPayload } from './auth.types';
import { AppError } from '../../../common/errors/AppError';

export class InvitationRepository {
  static findByTokenHash(tokenHash: string) {
    return prisma.invitation.findUnique({ where: { tokenHash } });
  }

  static register(invitationId: string, role: 'ADMIN' | 'DOCTOR' | 'PARAMEDIC' | 'NURSE' | 'PATIENT', data: RegisterInvitedPayload, passwordHash: string) {
    return prisma.$transaction(async tx => {
      const claimed = await tx.invitation.updateMany({
        where: { id: invitationId, usedAt: null, expiresAt: { gt: new Date() } },
        data: { usedAt: new Date() }
      });
      if (claimed.count === 0) throw new AppError('Invitation is expired or already used.', 400);
      const user = await tx.user.create({ data: {
        email: data.email.trim().toLowerCase(), phone: data.phone, fullName: data.fullName,
        passwordHash, role,
        emailVerificationRequired: role !== 'DOCTOR' && role !== 'PARAMEDIC',
        status: role === 'DOCTOR' || role === 'PARAMEDIC' ? 'ACTIVE' : 'PENDING_VERIFICATION'
      } });
      if (role === 'DOCTOR') {
        await tx.doctor.create({ data: { userId: user.id, cnic: data.cnic, pmdcNumber: data.professionalId!,
          bio: data.specialization, verificationStatus: 'VERIFIED', verificationApprovedAt: new Date() } });
      } else if (role === 'PATIENT') {
        await tx.patient.create({data:{userId:user.id,cnic:data.cnic}});
      } else if (role === 'NURSE') {
        await tx.nurse.create({data:{userId:user.id,cnic:data.cnic,pncNumber:data.professionalId!,verificationStatus:'PENDING'}});
      } else if (role === 'ADMIN') {
        await tx.administrator.create({ data: { userId: user.id } });
      } else {
        await tx.paramedic.create({ data: { userId: user.id, cnic: data.cnic,
          certificationNumber: data.professionalId!, verificationStatus: 'VERIFIED' } });
      }
      return { user };
    });
  }
}
