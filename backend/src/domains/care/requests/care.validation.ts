import { z } from 'zod';

export const priorityOverrideSchema = z.object({
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'])
});

export const scheduleOneOffSchema = z.object({
  requestId: z.string().uuid(),
  scheduledAt: z.string().datetime()
});

export const recurringPatternSchema = z.object({
  patientId: z.string().uuid(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY']),
  endDate: z.string().datetime(),
  occurrences: z.number().int().positive()
});

export const manualAssignmentSchema = z.object({
  assignedTo: z.string().uuid(),
  reason: z.string().min(5, 'A justification reason of at least 5 characters is required')
});

export const medicationLogSchema = z.object({
  medicationId: z.string().uuid()
});
