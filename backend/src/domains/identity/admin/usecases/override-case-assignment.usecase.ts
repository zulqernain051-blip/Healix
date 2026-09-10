import { prisma } from '../../../../common/config/database';
import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';

export class OverrideCaseAssignmentUseCase {
  async execute(caseId: string, newDoctorId: string, adminId: string, reason: string) {
    return prisma.$transaction(async (tx: any) => {
      // 1. Fetch current case
      const caseAssignment = await tx.caseAssignment.findUnique({
        where: { id: caseId }
      });

      if (!caseAssignment) {
        throw new AppError('Case not found', HTTP_STATUS.NOT_FOUND);
      }
      if (caseAssignment.status === 'RESOLVED') {
        throw new AppError('Cannot reassign a resolved case', HTTP_STATUS.BAD_REQUEST);
      }

      // 2. Validate new doctor
      const newDoctor = await tx.doctor.findUnique({
        where: { id: newDoctorId },
        select: { id: true, userId: true, verificationStatus: true }
      });

      if (!newDoctor || newDoctor.verificationStatus !== 'VERIFIED') {
        throw new AppError('Target doctor is not verified or does not exist', HTTP_STATUS.BAD_REQUEST);
      }

      // 3. Update assignment
      const updatedCase = await tx.caseAssignment.update({
        where: { id: caseId },
        data: {
          doctorId: newDoctor.id,
          status: caseAssignment.status === 'IN_REVIEW' ? 'IN_REVIEW' : 'ASSIGNED',
          acceptedAt: new Date()
        }
      });

      // 4. Assignment Log
      await tx.assignmentLog.create({
        data: {
          visitId: updatedCase.visitId,
          method: 'MANUAL',
          assignedTo: newDoctor.userId,
          reason: `Admin Override: \${reason}`
        }
      });

      // 5. Admin Audit Log
      await tx.adminAuditLog.create({
        data: {
          adminId,
          targetUserId: newDoctor.userId,
          action: 'OVERRIDE_CASE_ASSIGNMENT',
          entityType: 'CASE',
          entityId: caseId,
          reason,
          metadataJson: JSON.stringify({ previousDoctorId: caseAssignment.doctorId })
        }
      });

      return updatedCase;
    });
  }
}
