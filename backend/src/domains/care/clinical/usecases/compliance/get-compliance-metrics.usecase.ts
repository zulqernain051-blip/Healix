import { CareRepository } from '../../../requests/care.repository';
import { ClinicalRepository } from '../../clinical.repository';
import { CompliancePolicy } from '../../policies/compliance.policy';

export class GetComplianceMetricsUseCase {
  constructor(private readonly careRepository = CareRepository,
    private readonly clinicalRepository = ClinicalRepository) {}

  async execute(patientId: string) {
    const trailing30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const scheduledRequests = await this.careRepository.countCareRequests({
      patientId,
      scheduledAt: { gt: trailing30Days },
      status: { in: ['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'] }
    });

    const completedRequests = await this.careRepository.countCareRequests({
      patientId,
      scheduledAt: { gt: trailing30Days },
      status: 'COMPLETED'
    });

    const visitCompliance = CompliancePolicy.calculateVisitCompliance(scheduledRequests, completedRequests);
    const complianceFlag = CompliancePolicy.determineComplianceFlag(visitCompliance);

    const activeMedications = await this.clinicalRepository.findActiveMedications(patientId);
    const medicationLogs = await this.clinicalRepository.findMedicationLogsInRange(patientId, trailing30Days);

    const activeMedsCount = activeMedications.length;
    const uniqueLoggedMedsCount = new Set(medicationLogs.map((l: any) => l.medicationId)).size;
    
    const medicationCompliance = CompliancePolicy.calculateMedicationCompliance(activeMedsCount, uniqueLoggedMedsCount);

    return {
      visitCompliance: Math.round(visitCompliance),
      medicationCompliance: Math.round(medicationCompliance),
      complianceFlag,
      trend: CompliancePolicy.determineTrend(visitCompliance)
    };
  }
}


