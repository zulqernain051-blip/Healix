import { z } from 'zod';

export const ACTIVE_DISPATCH_STATUSES = ['PENDING', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED'];
export const ambulanceSchema = z.object({
  vehicleNumber: z.string().trim().min(1).max(80),
  plateNumber: z.string().trim().min(1).max(80),
  type: z.enum(['BASIC', 'ADVANCED', 'ICU']).default('BASIC'),
  provider: z.string().trim().max(120).optional(),
  contactNumber: z.string().trim().max(40).optional(),
  status: z.enum(['AVAILABLE', 'INACTIVE']).default('AVAILABLE'),
});
export const hospitalSchema = z.object({
  name: z.string().trim().min(1).max(200),
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  capacityStatus: z.enum(['AVAILABLE', 'LIMITED', 'FULL']),
  affordabilityTier: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  isCharity: z.boolean().default(false),
});
export const locationSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
  etaMinutes: z.number().int().min(0).max(1440).optional(),
});
