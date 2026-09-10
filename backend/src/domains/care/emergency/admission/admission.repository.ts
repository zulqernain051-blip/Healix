import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { prisma } from '../../../../common/config/database';

export class AdmissionRepository {
  static async updateAdmissionStatusAndCreateFollowUp(admissionId: string, status: 'REQUESTED' | 'ADMITTED' | 'DISCHARGED', dischargeNotes?: string) {
    return prisma.$transaction(async (tx) => {
      const admission = await tx.admission.findUnique({
        where: { id: admissionId }
      });

      if (!admission) {
        throw new AppError('', HTTP_STATUS.NOT_FOUND);
      }

      const updateData: any = { status };
      if (status === 'ADMITTED') {
        updateData.admittedAt = new Date();
      } else if (status === 'DISCHARGED') {
        updateData.dischargedAt = new Date();
        updateData.dischargeNotes = dischargeNotes || 'Patient discharged from facility.';
      }

      const updated = await tx.admission.update({
        where: { id: admissionId },
        data: updateData
      });

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
