import { z } from 'zod';

export const submitOfferSchema = z.object({
  price: z.number().positive('Price must be greater than 0'),
  priceType: z.enum(['HOURLY', 'DAILY', 'FIXED']).default('HOURLY'),
  proposedStart: z.string().datetime(),
  message: z.string().optional()
});

export const updateOfferSchema = z.object({
  price: z.number().positive('Price must be greater than 0').optional(),
  priceType: z.enum(['HOURLY', 'DAILY', 'FIXED']).optional(),
  proposedStart: z.string().datetime().optional(),
  message: z.string().optional()
});

export const selectOfferSchema = z.object({
  offerId: z.string().uuid()
});

export const favoriteNurseSchema = z.object({
  nurseId: z.string().uuid()
});

export const costPreviewSchema = z.object({
  price: z.number().positive(),
  priceType: z.enum(['HOURLY', 'DAILY', 'FIXED']),
  durationHours: z.number().int().positive().default(1)
});
