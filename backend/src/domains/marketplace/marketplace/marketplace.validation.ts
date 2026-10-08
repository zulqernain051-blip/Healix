import { z } from 'zod';

export const submitOfferSchema = z.object({
  price: z.number().finite().positive('Price must be greater than 0').max(10000000),
  priceType: z.enum(['HOURLY', 'DAILY', 'FIXED']).default('HOURLY'),
  proposedStart: z.string().datetime().refine(value => Date.parse(value) > Date.now(), 'Start must be in the future'),
  message: z.string().max(2000).optional()
});

export const updateOfferSchema = z.object({
  price: z.number().finite().positive('Price must be greater than 0').max(10000000).optional(),
  priceType: z.enum(['HOURLY', 'DAILY', 'FIXED']).optional(),
  proposedStart: z.string().datetime().refine(value => Date.parse(value) > Date.now(), 'Start must be in the future').optional(),
  message: z.string().max(2000).optional()
}).refine(value => Object.keys(value).length > 0, 'Supply an offer change');

export const selectOfferSchema = z.object({
  offerId: z.string().uuid()
});

export const favoriteNurseSchema = z.object({
  nurseId: z.string().uuid()
});

export const costPreviewSchema = z.object({
  price: z.number().finite().positive().max(10000000),
  priceType: z.enum(['HOURLY', 'DAILY', 'FIXED']),
  durationHours: z.number().finite().positive().max(2160).default(1)
});
