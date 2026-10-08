import { AppError } from '../../../../../common/errors/AppError';
import { prisma } from '../../../../../common/config/database';
import { AssertPatientAccessUseCase } from '../../../../identity/patient/usecases/profile/assert-patient-access.usecase';

export class CompleteMilestoneUseCase {
  async execute(milestoneId: string, actorId: string) {
    const milestone = await prisma.carePlanMilestone.findUnique({
      where: { id: milestoneId }, include: { carePlan: true }
    });
    if (!milestone) throw new AppError('Care-plan milestone not found', 404);
    const actor = await prisma.user.findUnique({ where: { id: actorId }, include: { patient: true } });
    if (!actor || actor.deletedAt) throw new AppError('Authentication required', 401);
    await AssertPatientAccessUseCase.execute(milestone.carePlan.patientId, actor);

    return prisma.$transaction(async tx => {
      // Serialize milestone completions on one plan, including simultaneous requests.
      await tx.$queryRaw`SELECT id FROM care_plans WHERE id = ${milestone.carePlanId} FOR UPDATE`;
      const current = await tx.carePlanMilestone.findUnique({ where: { id: milestoneId } });
      if (!current) throw new AppError('Care-plan milestone not found', 404);
      await tx.carePlanMilestone.update({ where: { id: milestoneId }, data: { completed: true } });
      const milestones = await tx.carePlanMilestone.findMany({ where: { carePlanId: milestone.carePlanId } });
      const completed = milestones.filter(item => item.completed).length;
      const progress = milestones.length ? completed / milestones.length * 100 : 0;
      return tx.carePlan.update({
        where: { id: milestone.carePlanId },
        data: { progress, status: progress === 100 ? 'COMPLETED' : 'ACTIVE' },
        include: { milestones: true }
      });
    });
  }
}
