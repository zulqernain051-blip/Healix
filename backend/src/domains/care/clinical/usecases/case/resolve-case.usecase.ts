import { DoctorRepository } from '../../../../identity/doctor/doctor.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';

export class ResolveCaseUseCase {
  constructor(private readonly doctorRepository = DoctorRepository) {}

  async execute(caseId: string, doctorId: string, resolutionSummary: string = 'Doctor completed management') {
    // 1. Verify the case exists
    const caseAssignment = await this.doctorRepository.findCaseById(caseId);
    if (!caseAssignment) {
      throw new AppError('Case not found', HTTP_STATUS.NOT_FOUND);
    }

    // 2. Verify doctor identity
    if (caseAssignment.doctorId !== doctorId) {
      throw new AppError('Unauthorized: This case is not assigned to you', HTTP_STATUS.FORBIDDEN);
    }

    // 3. Verify status
    if (caseAssignment.status === 'RESOLVED') {
      throw new AppError('Case is already resolved', HTTP_STATUS.BAD_REQUEST);
    }
    if (caseAssignment.status !== 'IN_REVIEW') {
      throw new AppError(`Cannot resolve case in status: \${caseAssignment.status}`, HTTP_STATUS.BAD_REQUEST);
    }

    // 4. Update the case to RESOLVED and log assignment
    const result = await this.doctorRepository.resolveCase(caseId, doctorId, resolutionSummary);

    if (result.count === 0) {
      throw new AppError('Failed to resolve case (case might have been modified concurrently)', HTTP_STATUS.CONFLICT);
    }

    return {
      success: true,
      caseId,
      status: 'RESOLVED',
      resolvedAt: new Date()
    };
  }
}
