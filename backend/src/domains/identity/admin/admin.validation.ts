import { z } from 'zod';

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export const deleteUserSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export const rejectCredentialSchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

export const revokeCredentialSchema = z.object({
  reason: z.string().min(10, 'Revocation reason must be at least 10 characters'),
});

export const removeOfferSchema = z.object({
  reason: z.string().min(5, 'Moderation reason required'),
});

export const updateConfigSchema = z.object({
  value: z.string().min(1, 'Value cannot be empty'),
  changeReason: z.string().optional(),
});

export const updateMarketplaceConfigSchema = z.object({
  biddingWindowHours: z.number().min(0.5).max(48).optional(),
  minOfferPrice: z.number().min(1).optional(),
  maxOfferPrice: z.number().optional(),
});
