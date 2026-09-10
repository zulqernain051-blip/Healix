export class MatchingPolicy {
  public static extractRequiredSpecialty(notes?: string | null): string | null {
    if (!notes) return null;
    const matchSpec = notes.match(/\[SPECIALTY:(\w+)\]/);
    return matchSpec ? matchSpec[1] : null;
  }

  public static filterEligibleNurses(candidateNurses: any[], requiredSpecialty: string | null): any[] {
    if (!requiredSpecialty) return candidateNurses;

    return candidateNurses.filter(n =>
      n.specializations.some((s: any) => s.specialization === requiredSpecialty && s.certified)
    );
  }

  public static rankCandidates(eligibleNurses: any[]): any[] {
    return [...eligibleNurses].sort((a, b) => {
      const scoreA = a.score?.compositeScore ?? 0;
      const scoreB = b.score?.compositeScore ?? 0;
      return scoreB - scoreA;
    });
  }
}
