import { DoctorRepository } from '../../doctor.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';

export class RequestSecondOpinionUseCase {
  constructor(private readonly doctorRepository = DoctorRepository) {}

  async execute(caseId: string, requestingDoctorId: string, consultedDoctorId: string) {
    if (requestingDoctorId === consultedDoctorId) {
      throw new AppError('Cannot request a second opinion from yourself', HTTP_STATUS.BAD_REQUEST);
    }
    return this.doctorRepository.withCaseAssignmentLock(caseId, async tx => {
      const current = await tx.caseAssignment.findUnique({ where: { id: caseId } });
      if (!current) throw new AppError('Case not found', 404);
      if (current.doctorId !== requestingDoctorId) throw new AppError('Case is not assigned to you', 403);
      if (!['ASSIGNED', 'IN_REVIEW'].includes(current.status)) throw new AppError('Case must be active for consultation', 409);
      const doctor = await tx.doctor.findUnique({ where: { id: consultedDoctorId }, include: { user: true } });
      if (!doctor || doctor.verificationStatus !== 'VERIFIED' || doctor.user.status !== 'ACTIVE') throw new AppError('Select an active verified doctor', 400);
      return this.doctorRepository.createSecondOpinion(caseId, requestingDoctorId, consultedDoctorId, tx);
    });
  }
}
