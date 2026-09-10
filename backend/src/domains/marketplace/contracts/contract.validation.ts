import { z } from 'zod';

export const createContractSchema = z.object({
  patientId: z.string().uuid(),
  nurseId: z.string().uuid(),
  sourceOfferId: z.string().uuid().optional(),
  price: z.number().positive(),
  priceType: z.enum(['HOURLY', 'DAILY', 'FIXED']).default('HOURLY'),
  scopeText: z.string().min(5)
});

export const rejectContractSchema = z.object({
  reason: z.string().min(3, 'Rejection reason must be at least 3 characters')
});

export const cancelContractSchema = z.object({
  reason: z.string().optional()
});
