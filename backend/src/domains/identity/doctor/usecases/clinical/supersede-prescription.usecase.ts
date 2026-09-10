import { DoctorRepository } from '../../doctor.repository';
import { ClinicalRepository } from '../../../../care/clinical/clinical.repository';
import { SubmitPrescriptionUseCase } from './submit-prescription.usecase';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';

export class SupersedePrescriptionUseCase {
  constructor(
    private readonly doctorRepository = DoctorRepository,
    private readonly clinicalRepository = ClinicalRepository,
    private readonly submitPrescriptionUseCase = new SubmitPrescriptionUseCase()
  ) {}

  async execute(prescriptionId: string, doctorId: string, data: any) {
    const oldPrescription = await this.clinicalRepository.findPrescriptionById(prescriptionId);

    if (!oldPrescription) {
      throw new AppError('Original prescription not found', HTTP_STATUS.NOT_FOUND);
    }

    const caseAssignment = await this.doctorRepository.findCaseByVisitId(oldPrescription.visitId);
    if (!caseAssignment) throw new AppError('Case not found for old prescription', HTTP_STATUS.NOT_FOUND);
      if (caseAssignment.doctorId !== doctorId) throw new AppError('Unauthorized: Original case is not assigned to you', HTTP_STATUS.FORBIDDEN);

    return this.submitPrescriptionUseCase.execute(caseAssignment.id, doctorId, {
      ...data,
      supersedesId: prescriptionId
    });
  }
}


