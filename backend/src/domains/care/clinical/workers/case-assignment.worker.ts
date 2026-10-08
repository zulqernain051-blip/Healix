import { ClinicalRepository } from '../clinical.repository';
import { AutomaticDoctorAssignmentUseCase } from '../usecases/assignment/automatic-doctor-assignment.usecase';
import { logger } from '../../../../common/utils/logger';

export class CaseAssignmentWorker {
  static async processPendingCases() {
    let cursor: string | undefined;
    while (true) {
      const cases = await ClinicalRepository.findPendingCaseIds(cursor);
      for (const clinicalCase of cases) {
        try { await new AutomaticDoctorAssignmentUseCase().execute(clinicalCase.id); }
        catch (error) { logger.error(`Failed to assign case ${clinicalCase.id}`, { error }); }
      }
      if (cases.length < 20) break;
      cursor = cases[cases.length - 1].id;
    }
  }
}
