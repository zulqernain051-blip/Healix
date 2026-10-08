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
    
    // On time means checked in within 15 minutes of the agreed/scheduled start.
    const timedVisits = await prisma.visit.findMany({ where: { nurseId, status: 'COMPLETED' }, select: { agreedStartTime: true, startedAt: true, request: { select: { scheduledAt: true } }, attendanceRecord: { select: { checkInAt: true } } } });
    const measured = timedVisits.filter(v => (v.attendanceRecord?.checkInAt || v.startedAt) && (v.agreedStartTime || v.request.scheduledAt));
    const onTime = measured.filter(v => {
      const start = v.attendanceRecord?.checkInAt || v.startedAt!;
      return start.getTime() <= (v.agreedStartTime || v.request.scheduledAt)!.getTime() + 15 * 60 * 1000;
    }).length;
    const reliabilityScore = measured.length ? onTime / measured.length * 100 : 0;
    const assessedSkills = await prisma.nurseSpecialization.findMany({ where: { nurseId, certified: true, proficiencyRating: { not: null } } });
    const skillScore = assessedSkills.length ? assessedSkills.reduce((total, skill) => total + skill.proficiencyRating!, 0) / assessedSkills.length / 5 * 100 : 0;

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
        onTimeRate: reliabilityScore,
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
    const score = await this.computeAndUpsertNurseScore(nurseId);
    const assessedSkills = await prisma.nurseSpecialization.findMany({ where: { nurseId, certified: true, proficiencyRating: { not: null } }, select: { specialization: true, proficiencyRating: true, assessmentNotes: true, assessedAt: true } });
    const reviews = await prisma.nurseReview.findMany({ where: { nurseId }, select: { recommend: true } });
    return score ? { ...score, skillAssessmentCount: assessedSkills.length, assessedSkills, skillBasis: 'Average administrator-recorded specialty assessment (1–5), scaled to 100', reviewCount: reviews.length, recommendationRate: reviews.length ? reviews.filter(r => r.recommend).length / reviews.length * 100 : null } : null;
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
      const score = await this.computeAndUpsertNurseScore(nurseId);
      if (score.onTimeRate >= 90) eligibleBadgeTypes.push('RELIABLE');
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
