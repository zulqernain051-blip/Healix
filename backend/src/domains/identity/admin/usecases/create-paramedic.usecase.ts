import { prisma } from '../../../../common/config/database';
import { AppError } from '../../../../common/errors/AppError';
import * as bcrypt from 'bcrypt';

export class CreateParamedicUseCase {
  async execute(payload: any, admin: any) {
    const { email, phone, fullName, password, cnic, certificationNumber } = payload;
    
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) throw new AppError('Email is already registered', 409);

    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) throw new AppError('Phone is already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email, phone, fullName, passwordHash, role: 'PARAMEDIC', status: 'ACTIVE',
          paramedic: {
            create: {
              cnic,
              certificationNumber,
              verificationStatus: 'VERIFIED'
            }
          }
        }
      });

      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          targetUserId: user.id,
          action: 'CREATE_PARAMEDIC',
          entityType: 'USER',
          entityId: user.id,
          reason: 'Created via admin panel'
        }
      });

      return user;
    });
  }
}
