import { DoctorRepository } from '../../doctor.repository';
import { ClinicalRepository } from '../../../../care/clinical/clinical.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';

export class SubmitDiagnosisUseCase {
  constructor(
    private readonly doctorRepository = DoctorRepository,
    private readonly clinicalRepository = ClinicalRepository
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
    let version = 1;

    if (data.parentId) {
      const parent = await this.clinicalRepository.findDiagnosisById(data.parentId);
      if (parent) {
        version = parent.version + 1;
      }
    }

    return this.clinicalRepository.createDiagnosis(
      patientId,
      doctorId,
      caseId,
      data.code,
      data.description,
      data.notes,
      data.parentId,
      version
    );
  }
}


