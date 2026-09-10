import { z } from 'zod';

export const riskAssessSchema = z.object({
  visitId: z.string().uuid().optional(),
  patientId: z.string().uuid(),
  nurseConfidence: z.number().int().min(1).max(5).default(3)
});

export const ragQuerySchema = z.object({
  query: z.string().min(1, 'Query cannot be empty')
});
