import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { prisma } from '../../../../common/config/database';

export class AdmissionRepository {
  static findById(admissionId: string) {
    return prisma.admission.findUnique({ where: { id: admissionId } });
  }

  static async updateAdmissionStatusAndCreateFollowUp(admissionId: string, status: 'REQUESTED' | 'ADMITTED' | 'DISCHARGED', dischargeNotes?: string) {
    return prisma.$transaction(async (tx) => {
      const admission = await tx.admission.findUnique({
        where: { id: admissionId }
      });

      if (!admission) {
        throw new AppError('Admission not found', HTTP_STATUS.NOT_FOUND);
      }

      if (admission.status === status) return admission;
      const allowed: Record<string, string[]> = { REQUESTED: ['ADMITTED'], ADMITTED: ['DISCHARGED'], DISCHARGED: [] };
      if (!allowed[admission.status]?.includes(status)) throw new AppError(`Cannot change admission from ${admission.status} to ${status}`, HTTP_STATUS.CONFLICT);

      const updateData: any = { status };
      if (status === 'ADMITTED') {
        updateData.admittedAt = new Date();
      } else if (status === 'DISCHARGED') {
        updateData.dischargedAt = new Date();
        updateData.dischargeNotes = dischargeNotes || 'Patient discharged from facility.';
      }

      const claimed = await tx.admission.updateMany({
        where: { id: admissionId, status: admission.status },
        data: updateData
      });
      if (claimed.count === 0) throw new AppError('Admission status changed concurrently. Please reload.', HTTP_STATUS.CONFLICT);
      const updated = await tx.admission.findUniqueOrThrow({ where: { id: admissionId } });

      // Business Rule: On Discharge, auto-draft a follow-up care request
      if (status === 'DISCHARGED') {
        await tx.careRequest.create({
          data: {
            patientId: admission.patientId,
            type: 'NURSE_VISIT',
            status: 'DRAFT',
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // scheduled tomorrow
            notes: `Auto-drafted clinical follow-up visit. Discharge Notes: ${updateData.dischargeNotes}`
          }
        });
      }

      return updated;
    });
  }
}
