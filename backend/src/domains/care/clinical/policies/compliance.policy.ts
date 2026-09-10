export class CompliancePolicy {
  public static calculateVisitCompliance(scheduledRequests: number, completedRequests: number) {
    if (scheduledRequests === 0) return 100;
    return (completedRequests / scheduledRequests) * 100;
  }

  public static calculateMedicationCompliance(activeMedsCount: number, uniqueLoggedMedsCount: number) {
    if (activeMedsCount === 0) return 100;
    return (uniqueLoggedMedsCount / activeMedsCount) * 100;
  }

  public static determineComplianceFlag(visitCompliance: number): string {
    return visitCompliance < 70 ? 'AT_RISK' : 'ON_TRACK';
  }

  public static determineTrend(visitCompliance: number): string {
    if (visitCompliance >= 90) return 'UP';
    if (visitCompliance >= 70) return 'STABLE';
    return 'DOWN';
  }
}
