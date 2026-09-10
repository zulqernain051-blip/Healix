import { DoctorRepository } from '../../doctor.repository';
import { ClinicalRepository } from '../../../../care/clinical/clinical.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';

export class SubmitPrescriptionUseCase {
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
    const visitId = caseAssignment.visitId;

    const patientDetails = await this.clinicalRepository.findAllergiesByPatientId(patientId);

    if (!patientDetails) {
      throw new AppError('Patient details not found', HTTP_STATUS.NOT_FOUND);
    }

    const allergies = patientDetails.map((a: any) => a.allergen.toLowerCase());

    if (!data.bypassAllergyCheck) {
      const conflictingMeds: string[] = [];
      for (const item of data.items) {
        const medName = item.medicationName.toLowerCase();
        const match = allergies.find((all: string) => medName.includes(all) || all.includes(medName));
        if (match) {
          conflictingMeds.push(item.medicationName);
        }
      }

      if (conflictingMeds.length > 0) {
        const err = new AppError(`Allergy Conflict: Patient is allergic to: ${conflictingMeds.join(', ')}`, HTTP_STATUS.CONFLICT);
        (err as any).status = 409;
        (err as any).data = { conflictingMeds };
        throw err;
      }
    }

    const mockPdfUrl = `http://healix.com/prescriptions/${Date.now()}.pdf`;

    return this.clinicalRepository.createPrescription(
      patientId,
      doctorId,
      visitId,
      mockPdfUrl,
      data.instructions,
      data.items,
      data.supersedesId
    );
  }
}


