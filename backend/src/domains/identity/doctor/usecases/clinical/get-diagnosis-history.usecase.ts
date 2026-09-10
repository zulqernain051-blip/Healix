import { ClinicalRepository } from '../../../../care/clinical/clinical.repository';

export class GetDiagnosisHistoryUseCase {
  constructor(
    private readonly clinicalRepository = ClinicalRepository
  ) {}

  async execute(caseId: string) {
    return this.clinicalRepository.findDiagnosisHistory(caseId);
  }
}


