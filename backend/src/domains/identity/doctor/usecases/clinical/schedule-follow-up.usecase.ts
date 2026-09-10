import { DoctorRepository } from '../../doctor.repository';
import { CareRequestRepository } from '../../../../care/requests/repository/care-request.repository';
import { prisma } from '../../../../../common/config/database';
import { randomUUID } from 'crypto';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';

export class ScheduleFollowUpUseCase {
  constructor(private readonly doctorRepository = DoctorRepository) {}

  async execute(caseId: string, doctorId: string, data: { targetDate: Date, instructions?: string, preferCurrentNurse?: boolean }) {
    // 1. Verify case exists and belongs to doctor
    const caseAssignment = await this.doctorRepository.findCaseById(caseId);
    if (!caseAssignment) throw new AppError('Case not found', HTTP_STATUS.NOT_FOUND);
    if (caseAssignment.doctorId !== doctorId) throw new AppError('Unauthorized: This case is not assigned to you', HTTP_STATUS.FORBIDDEN);
    if (caseAssignment.status !== 'IN_REVIEW') throw new AppError(`Cannot schedule follow-up for a case in status: ${caseAssignment.status}`, HTTP_STATUS.BAD_REQUEST);

    // 2. Validate date (must be in the future)
    if (data.targetDate < new Date()) {
      throw new AppError('Follow-up date cannot be in the past', HTTP_STATUS.BAD_REQUEST);
    }

    // 3. Fallback location
    const fallbackLocation = {
      address: caseAssignment.visit?.request?.patient?.address || 'Unknown',
      latitude: caseAssignment.visit?.request?.patient?.latitude || 0,
      longitude: caseAssignment.visit?.request?.patient?.longitude || 0
    };

    // 4. Create the ONE_TIME CareRequest
    const dto = {
      patientId: caseAssignment.visit!.request!.patientId,
      type: 'NURSE_VISIT',
      scheduleType: 'ONE_TIME',
      durationMinutes: 60,
      preferredDate: data.targetDate,
      notes: data.instructions ? `Follow-up: ${data.instructions}` : 'Doctor scheduled follow-up',
    };

    const request = await CareRequestRepository.createCareRequest(dto as any, 'ROUTINE', fallbackLocation);

    // 5. Prefer current nurse if requested and available
    if (data.preferCurrentNurse && caseAssignment.visit?.nurseId) {
      await prisma.$transaction(async (tx) => {
        // Update request status to ASSIGNED
        await tx.careRequest.update({
          where: { id: request.id },
          data: { status: 'ASSIGNED' }
        });

        // Create Visit directly
        const nextVisit = await tx.visit.create({
          data: {
            requestId: request.id,
            nurseId: caseAssignment.visit!.nurseId,
            doctorId: doctorId,
            status: 'SCHEDULED',
            agreedStartTime: data.targetDate
          }
        });

        await tx.visitQrToken.create({
          data: {
            visitId: nextVisit.id,
            token: randomUUID(),
            status: 'PENDING',
            expiresAt: new Date(data.targetDate.getTime() + 7 * 24 * 60 * 60 * 1000)
          }
        });
      });
    }

    // 6. Record Clinical Decision
    await this.doctorRepository.createClinicalDecision(
      caseId,
      doctorId,
      'FOLLOW_UP',
      data.instructions || 'Scheduled follow-up visit',
      false
    );

    return {
      success: true,
      careRequestId: request.id,
      assignedToCurrentNurse: Boolean(data.preferCurrentNurse && caseAssignment.visit?.nurseId)
    };
  }
}
