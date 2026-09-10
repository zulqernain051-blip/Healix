export class VisitExpiryPolicy {
  public static readonly EXPIRY_MINUTES = 5;

  /**
   * Determines if a visit offer has expired based on its creation time.
   */
  public static isExpired(createdAt: Date | string, currentTime: Date = new Date()): boolean {
    const createdTime = new Date(createdAt);
    const diffMs = currentTime.getTime() - createdTime.getTime();
    const diffMins = diffMs / (1000 * 60);
    
    return diffMins > this.EXPIRY_MINUTES;
  }
}
