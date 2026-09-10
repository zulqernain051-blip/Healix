export class NurseProfilePolicy {
  public static checkAvailabilityEligibility(nurse: any): { isEligible: boolean; missing: string[] } {
    const bio = nurse.bio;
    const photoUrl = nurse.photoUrl;
    const quals = nurse.qualifications || [];

    const missing: string[] = [];
    if (!photoUrl) missing.push('profile photo');
    if (!bio || bio.length < 20) missing.push('biography (minimum 20 characters)');
    if (quals.length === 0) missing.push('at least one qualification/certification');

    return {
      isEligible: missing.length === 0,
      missing
    };
  }
}
