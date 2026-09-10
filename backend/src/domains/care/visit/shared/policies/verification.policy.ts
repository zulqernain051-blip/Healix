export class VerificationPolicy {
  public static readonly MAX_GPS_DISTANCE_METERS = 150;

  /**
   * Evaluates if a given distance is within the acceptable verification radius.
   */
  public static isWithinRadius(distanceInMeters: number): boolean {
    return distanceInMeters <= this.MAX_GPS_DISTANCE_METERS;
  }

  /**
   * Validates if the provided QR token matches the expected pattern.
   */
  public static isValidQrToken(providedToken: string, visitId: string, requestId: string): boolean {
    const expectedToken = Buffer.from(`${visitId}:${requestId}`).toString('base64');
    return providedToken === expectedToken;
  }
}
