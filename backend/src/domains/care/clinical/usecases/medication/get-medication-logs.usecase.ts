import { ClinicalRepository } from '../../clinical.repository';

export class GetMedicationLogsUseCase {
  constructor(private readonly clinicalRepository = ClinicalRepository) {}

  async execute(patientId: string) {
    return this.clinicalRepository.findMedicationLogs(patientId);
  }
}


