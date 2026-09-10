import { DispatchAmbulanceUseCase } from '../../../../care/emergency/usecases/dispatch-ambulance.usecase';
import { DoctorRepository } from '../../doctor.repository';
import { prisma } from '../../../../../common/config/database';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';

export class SubmitClinicalDecisionUseCase {
  constructor(private readonly doctorRepository = DoctorRepository) {}

  async execute(caseId: string, doctorId: string, data: any) {
    const caseAssignment = await this.doctorRepository.findCaseById(caseId);
    if (!caseAssignment) {
      throw new AppError('Case not found', HTTP_STATUS.NOT_FOUND);
    }
    if (caseAssignment.doctorId !== doctorId) {
      throw new AppError('Unauthorized: This case is not assigned to you', HTTP_STATUS.FORBIDDEN);
    }

    // Use a transaction for emergency
    if (data.decision === 'REQUEST_EMERGENCY') {
      const dispatchUseCase = new DispatchAmbulanceUseCase();
      
      const patientId = caseAssignment.visit?.request?.patientId;
      const visitId = caseAssignment.visitId;
      const doctorUserId = caseAssignment.doctor?.userId;

      if (!patientId || !doctorUserId) {
        throw new AppError('Missing patient or doctor context for emergency dispatch', HTTP_STATUS.BAD_REQUEST);
      }

      return await prisma.$transaction(async (tx) => {
        const decision = await this.doctorRepository.createClinicalDecision(
          caseId,
          doctorId,
          data.decision,
          data.justification,
          data.autoDispatch,
          tx
        );

        await dispatchUseCase.execute(patientId, visitId, doctorId, doctorUserId, tx);
        await this.doctorRepository.resolveCase(caseId, doctorId, 'Patient handed off to emergency services', tx);

        return decision;
      });
    }

    return await this.doctorRepository.createClinicalDecision(
      caseId,
      doctorId,
      data.decision,
      data.justification,
      data.autoDispatch
    );
  }
}
