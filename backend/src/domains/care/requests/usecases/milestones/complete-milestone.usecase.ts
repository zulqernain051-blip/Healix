import { AppError } from '../../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../../common/constants/index';
import { prisma } from '../../../../../common/config/database';

export class CompleteMilestoneUseCase {
  async execute(milestoneId: string, _actorId: string) {
    const milestone = await prisma.carePlanMilestone.findUnique({
      where: { id: milestoneId },
      include: { carePlan: true }
    });

    if (!milestone) {
      throw new AppError('', HTTP_STATUS.NOT_FOUND);
    }

    if (milestone.completed) {
      throw new AppError('', HTTP_STATUS.BAD_REQUEST);
    }

    return prisma.$transaction(async (tx) => {
      // 1. Mark milestone completed
      await tx.carePlanMilestone.update({
        where: { id: milestoneId },
        data: { completed: true }
      });

      // 2. Recalculate progress
      const allMilestones = await tx.carePlanMilestone.findMany({
        where: { carePlanId: milestone.carePlanId }
      });

      const total = allMilestones.length;
      const completed = allMilestones.filter((m) => m.completed).length + 1; // +1 because we just completed it in tx
      
      let progress = 0;
      if (total > 0) {
        progress = (completed / total) * 100;
      }

      const status = progress === 100 ? 'COMPLETED' : 'ACTIVE';

      // 3. Update CarePlan
      const updatedPlan = await tx.carePlan.update({
        where: { id: milestone.carePlanId },
        data: { 
          progress,
          status 
        },
        include: { milestones: true }
      });

      return updatedPlan;
    });
  }
}
