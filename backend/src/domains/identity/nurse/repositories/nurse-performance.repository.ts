import { prisma } from '../../../../common/config/database';

export class NursePerformanceRepository {
  public static async createReview(visitId: string, nurseId: string, patientId: string, stars: number, reviewText?: string, recommend: boolean = true) {
    return prisma.nurseReview.create({
      data: {
        visitId,
        nurseId,
        patientId,
        stars,
        reviewText,
        recommend
      }
    });
  }

  public static async findReviewByVisitId(visitId: string) {
    return prisma.nurseReview.findUnique({
      where: { visitId }
    });
  }

  public static async findReviewsByNurseId(nurseId: string) {
    return prisma.nurseReview.findMany({
      where: { nurseId },
      include: {
        patient: {
          include: {
            user: {
              select: { fullName: true }
            }
          }
        },
        visit: {
          include: {
            request: {
              select: { scheduledAt: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  public static async computeAndUpsertNurseScore(nurseId: string) {
    // 1. Get total completed visits count
    const completedVisits = await prisma.visit.count({
      where: { nurseId, status: 'COMPLETED' }
    });

    // 2. Get reviews rating stats
    const reviews = await prisma.nurseReview.findMany({
      where: { nurseId }
    });

    const totalStars = reviews.reduce((sum, r) => sum + r.stars, 0);
    const avgRating = reviews.length > 0 ? totalStars / reviews.length : 0;

    // 3. Compute scores
    const experienceScore = Math.min((completedVisits / 50) * 100, 100);
    const performanceScore = (avgRating / 5) * 100;
    
    // Simple reliability logic: on-time verifications or just basic base value
    const reliabilityScore = completedVisits > 0 ? 85 : 0;
    const skillScore = (experienceScore + performanceScore + reliabilityScore) / 3;

    // Composite score formula
    const compositeScore = (skillScore * 0.4) + (experienceScore * 0.3) + (reliabilityScore * 0.2) + (performanceScore * 0.1);

    return prisma.nurseScore.upsert({
      where: { nurseId },
      create: {
        nurseId,
        skillScore,
        experienceScore,
        reliabilityScore,
        performanceScore,
        compositeScore,
        totalVisits: completedVisits,
        onTimeRate: reliabilityScore, // Mock or simple representation
        avgRating
      },
      update: {
        skillScore,
        experienceScore,
        reliabilityScore,
        performanceScore,
        compositeScore,
        totalVisits: completedVisits,
        onTimeRate: reliabilityScore,
        avgRating,
        computedAt: new Date()
      }
    });
  }

  public static async getNurseScore(nurseId: string) {
    return prisma.nurseScore.findUnique({
      where: { nurseId }
    });
  }

  public static async findBadgesByNurseId(nurseId: string) {
    return prisma.nurseBadge.findMany({
      where: { nurseId },
      orderBy: { awardedAt: 'desc' }
    });
  }

  public static async awardBadgesIfEligible(nurseId: string) {
    // Fetch current stats
    const completedVisits = await prisma.visit.count({
      where: { nurseId, status: 'COMPLETED' }
    });

    const reviews = await prisma.nurseReview.findMany({
      where: { nurseId }
    });
    const totalStars = reviews.reduce((sum, r) => sum + r.stars, 0);
    const avgRating = reviews.length > 0 ? totalStars / reviews.length : 0;

    const specializations = await prisma.nurseSpecialization.findMany({
      where: { nurseId, certified: true }
    });

    const eligibleBadgeTypes: string[] = [];

    if (completedVisits >= 1) {
      eligibleBadgeTypes.push('FIRST_VISIT');
    }
    if (completedVisits >= 10) {
      eligibleBadgeTypes.push('TEN_VISITS');
      eligibleBadgeTypes.push('RELIABLE'); // Reliable milestone (on-time or general)
    }
    if (completedVisits >= 20 && avgRating >= 4.7) {
      eligibleBadgeTypes.push('TOP_RATED');
    }
    if (specializations.length > 0) {
      eligibleBadgeTypes.push('VERIFIED_SPECIALIST');
    }

    // Check specific clinical specialties to award individual expert badges
    const specNames = specializations.map(s => s.specialization);
    if (specNames.includes('WOUND_CARE')) {
      eligibleBadgeTypes.push('WOUND_CARE_EXPERT');
    }
    if (specNames.includes('DIABETES_CARE')) {
      eligibleBadgeTypes.push('DIABETES_SPECIALIST');
    }
    if (specNames.includes('PEDIATRIC_CARE')) {
      eligibleBadgeTypes.push('PEDIATRIC_SPECIALIST');
    }
    if (specNames.includes('IV_THERAPY')) {
      eligibleBadgeTypes.push('IV_THERAPY_CERTIFIED');
    }

    const newlyAwarded: any[] = [];
    for (const bType of eligibleBadgeTypes) {
      // Try to create the badge, skip or handle if already exists
      const existing = await prisma.nurseBadge.findUnique({
        where: {
          nurseId_badgeType: {
            nurseId,
            badgeType: bType
          }
        }
      });

      if (!existing) {
        const badge = await prisma.nurseBadge.create({
          data: {
            nurseId,
            badgeType: bType
          }
        });
        newlyAwarded.push(badge);
      }
    }

    return newlyAwarded;
  }
}
