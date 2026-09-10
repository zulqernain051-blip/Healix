export class RiskClassificationPolicy {
  /**
   * Calculates the qualitative risk tier based purely on nurse confidence (AI stub replacement).
   */
  public static calculateRiskTier(confidenceLevel: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (confidenceLevel <= 2) return 'LOW';
    if (confidenceLevel <= 4) return 'MEDIUM';
    return 'HIGH';
  }

  /**
   * Calculates the fused score based on confidence level.
   */
  public static calculateFusedScore(confidenceLevel: number): number {
    return confidenceLevel / 5;
  }
}
