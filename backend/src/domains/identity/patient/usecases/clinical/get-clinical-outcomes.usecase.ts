import { PatientRepository } from '../../patient.repository';
import { ClinicalRepository } from '../../../../care/clinical/clinical.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class GetClinicalOutcomesUseCase {
  constructor(
    private readonly patientRepository = PatientRepository,
    private readonly clinicalRepository = ClinicalRepository
  ) {}

  async execute(patientId: string) {
    const patient = await this.patientRepository.findPatientById(patientId);
    if (!patient) throw new AppError('Patient profile not found', HTTP_STATUS.NOT_FOUND);

    const cases = await this.clinicalRepository.findPatientClinicalOutcomes(patientId);

    // Map to a clean DTO
    return cases.map(c => ({
      caseId: c.id,
      status: c.status, // e.g. RESOLVED, IN_REVIEW
      createdAt: c.createdAt,
      doctorName: c.doctor?.user?.fullName || 'Unassigned',
      visitDate: c.visit?.startedAt,
      diagnoses: c.diagnoses.map(d => ({
        id: d.id,
        code: d.code,
        description: d.description,
        diagnosedAt: d.diagnosedAt
      })),
      decisions: c.decisions.map(d => ({
        id: d.id,
        decisionType: d.decision, // e.g. PRESCRIBE_MEDICATION, REQUEST_EMERGENCY
        justification: d.justification,
        decidedAt: d.createdAt
      }))
    }));
  }
}
