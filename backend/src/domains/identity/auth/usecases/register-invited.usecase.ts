import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { AppError } from '../../../../common/errors/AppError';
import { RegisterInvitedPayload } from '../auth.types';
import { InvitationRepository } from '../invitation.repository';

export class RegisterInvitedUseCase {
  static async execute(data: RegisterInvitedPayload) {
    const tokenHash = crypto.createHash('sha256').update(data.invitationToken).digest('hex');
    const invitation = await InvitationRepository.findByTokenHash(tokenHash);
    if (!invitation) throw new AppError('Invalid invitation token.', 400);
    if (invitation.usedAt) throw new AppError('Invitation has already been used.', 400);
    if (invitation.expiresAt <= new Date()) throw new AppError('Invitation has expired.', 400);
    if (!['DOCTOR','PARAMEDIC','ADMIN','NURSE','PATIENT'].includes(invitation.role)) throw new AppError('Unsupported invitation role.', 400);
    if (invitation.email && data.email.trim().toLowerCase() !== invitation.email.trim().toLowerCase()) {
      throw new AppError('Email does not match invitation.', 400);
    }
    if (invitation.phone && data.phone !== invitation.phone) throw new AppError('Phone does not match invitation.', 400);
    if (['DOCTOR','PARAMEDIC','NURSE'].includes(invitation.role) && !data.professionalId) throw new AppError('Professional credential is required.', 400);
    const passwordHash = await bcrypt.hash(data.password, 12);
    return InvitationRepository.register(invitation.id, invitation.role, data, passwordHash);
  }
}
