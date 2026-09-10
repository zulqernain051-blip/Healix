import { CareRepository } from '../../../../care/requests/care.repository';
import { VisitRepository } from '../../../../care/visit/visit.repository';
import { ClinicalRepository } from '../../../../care/clinical/clinical.repository';
import { PatientRepository } from '../../patient.repository';
import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants';

export class GetDashboardSummaryUseCase {
  constructor(
    private readonly patientRepository = PatientRepository,
    private readonly careRepository = CareRepository,
    private readonly visitRepository = VisitRepository,
    private readonly clinicalRepository = ClinicalRepository
  ) {}

  async execute(patientId: string) {
    const patient = await this.patientRepository.findPatientById(patientId);
    if (!patient) throw new AppError('Patient profile not found', HTTP_STATUS.NOT_FOUND);

    // TODO Phase 6: Replace with CQRS Read Model
    const [
      activeRequestsCount,
      upcomingVisits,
      severeAllergiesCount,
      latestRisk,
      pendingPayments
    ] = await Promise.all([
      this.careRepository.countActiveRequests(patientId),
      this.visitRepository.findUpcomingVisits(patientId),
      this.clinicalRepository.countSevereAllergies(patientId),
      this.clinicalRepository.findLatestRiskAssessment(patientId),
      this.careRepository.findPendingPayments(patientId)
    ]);

    const pendingPaymentsSum = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      activeRequestsCount,
      upcomingVisits,
      severeAllergiesCount,
      latestRisk,
      pendingPaymentsCount: pendingPayments.length,
      pendingPaymentsSum
    };
  }
}
