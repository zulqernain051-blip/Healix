import { DoctorRepository } from '../../doctor.repository';
import { CareRepository } from '../../../../care/requests/care.repository';
import { CareRequestRepository } from '../../../../care/requests/repository/care-request.repository';
import { prisma } from '../../../../../common/config/database';
import { randomUUID } from 'crypto';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';

export class SubmitCarePlanUseCase {
  constructor(
    private readonly doctorRepository = DoctorRepository,
    private readonly careRepository = CareRepository
  ) {}

  async execute(caseId: string, doctorId: string, data: any) {
    const caseAssignment = await this.doctorRepository.findCaseById(caseId);
    if (!caseAssignment) {
      throw new AppError('Case not found', HTTP_STATUS.NOT_FOUND);
    }
    if (caseAssignment.doctorId !== doctorId) {
      throw new AppError('Unauthorized: This case is not assigned to you', HTTP_STATUS.FORBIDDEN);
    }

    if (caseAssignment.status === 'RESOLVED') {
      throw new AppError('Cannot modify a resolved case', HTTP_STATUS.BAD_REQUEST);
    }

    const patientId = caseAssignment.visit.request.patientId;
    
    if (!data.milestones || data.milestones.length === 0) {
      throw new AppError('Care plan must contain at least one milestone', HTTP_STATUS.BAD_REQUEST);
    }

    const formattedMilestones = data.milestones.map((m: any) => ({
      title: m.title,
      targetDate: new Date(m.targetDate)
    }));

    const carePlan = await this.careRepository.createCarePlan(
      patientId,
      doctorId,
      data.title,
      data.description,
      formattedMilestones
    );

    if (data.needsNursingCare) {
      const fallbackLocation = {
        address: caseAssignment.visit.request.address || 'Unknown Address',
        latitude: caseAssignment.visit.request.latitude || 0,
        longitude: caseAssignment.visit.request.longitude || 0
      };

      const dto = {
        patientId,
        type: 'NURSE_VISIT',
        scheduleType: 'RECURRING',
        durationMinutes: data.durationMinutes || 60,
        requirements: `Care Plan: \${carePlan.title}`,
        recurring: {
          frequency: data.frequency, // DAILY, WEEKLY, BIWEEKLY
          startDate: new Date(),
          occurrencesLimit: data.occurrences
        }
      };

      const request = await CareRequestRepository.createCareRequest(dto as any, 'ROUTINE', fallbackLocation);

      if (data.keepCurrentNurse && caseAssignment.visit.nurseId) {
        // Create initial Visit directly with the current nurse
        await prisma.$transaction(async (tx) => {
          // Update request to ASSIGNED
          await tx.careRequest.update({
            where: { id: request.id },
            data: { status: 'ASSIGNED' }
          });

          // Generate next date based on frequency
          const nextDate = new Date();
          if (data.frequency === 'DAILY') {
            nextDate.setDate(nextDate.getDate() + 1);
          } else if (data.frequency === 'WEEKLY') {
            nextDate.setDate(nextDate.getDate() + 7);
          } else if (data.frequency === 'BIWEEKLY') {
            nextDate.setDate(nextDate.getDate() + 14);
          }
          
          const nextVisit = await tx.visit.create({
            data: {
              requestId: request.id,
              nurseId: caseAssignment.visit.nurseId,
              doctorId: doctorId,
              status: 'SCHEDULED',
              agreedStartTime: nextDate
            }
          });

          await tx.visitQrToken.create({
            data: {
              visitId: nextVisit.id,
              token: randomUUID(),
              status: 'PENDING',
              expiresAt: new Date(nextDate.getTime() + 7 * 24 * 60 * 60 * 1000)
            }
          });
        });
      }
    }

    return carePlan;
  }
}
