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
    if (!['ASSIGNED', 'IN_REVIEW'].includes(caseAssignment.status)) throw new AppError('Case must be active and assigned before recording a decision', 409);

    // Use a transaction for emergency
    if (data.decision === 'REQUEST_EMERGENCY' || data.decision === 'REQUEST_EMERGENCY_AMBULANCE') {
      const dispatchUseCase = new DispatchAmbulanceUseCase();
      
      const patientId = caseAssignment.visit?.request?.patientId;
      const visitId = caseAssignment.visitId;
      const doctorUserId = caseAssignment.doctor?.userId;

      if (!patientId || !doctorUserId) {
        throw new AppError('Missing patient or doctor context for emergency dispatch', HTTP_STATUS.BAD_REQUEST);
      }

      return await prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT "id" FROM "case_assignments" WHERE "id" = ${caseId} FOR UPDATE`;
        const current = await tx.caseAssignment.findUnique({ where: { id: caseId } });
        if (!current || current.doctorId !== doctorId || !['ASSIGNED', 'IN_REVIEW'].includes(current.status)) throw new AppError('Case is no longer available for this decision', 409);
        if (current.status === 'ASSIGNED') await tx.caseAssignment.update({ where: { id: caseId }, data: { status: 'IN_REVIEW' } });
        const decision = await this.doctorRepository.createClinicalDecision(
          caseId,
          doctorId,
          data.decision,
          data.justification,
          data.autoDispatch,
          tx
        );

        if (!data.hospitalId) throw new AppError('Select a destination hospital before dispatch', 400);
        await dispatchUseCase.execute(patientId, visitId, doctorId, doctorUserId, tx, data.hospitalId, data.justification);
        const resolved = await this.doctorRepository.resolveCase(caseId, doctorId, 'Patient handed off to emergency services', tx);
        if (!resolved.count) throw new AppError('Case changed during dispatch. Please reload.', 409);

        return decision;
      });
    }

    return this.doctorRepository.withCaseAssignmentLock(caseId, async tx => {
      const current = await tx.caseAssignment.findUnique({ where: { id: caseId } });
      if (!current || current.doctorId !== doctorId || !['ASSIGNED', 'IN_REVIEW'].includes(current.status)) throw new AppError('Case is no longer available for this decision', 409);
      return this.doctorRepository.createClinicalDecision(caseId, doctorId, data.decision, data.justification, data.autoDispatch, tx);
    });
  }
}
