import { z } from 'zod';
import { User } from './auth';

export type CareRequestStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ScheduleType = 'ONE_TIME' | 'RECURRING';
export type TimeWindow = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'FLEXIBLE';
export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY';

// Exact match of backend CreateCareRequestDto
export interface CreateCareRequestDto {
  type: 'NURSE_VISIT' | 'DOCTOR_VISIT';
  notes?: string;
  requirements?: string;
  scheduleType: ScheduleType;
  preferredDate?: string;
  preferredStartTime?: string;
  preferredTimeWindow?: TimeWindow;
  durationMinutes: number;
  recurring?: {
    startDate: string;
    frequency: RecurringFrequency;
    occurrencesLimit: number;
  };
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
}

export interface CareRequestResponse {
  id: string;
  patientId: string;
  type: 'NURSE_VISIT' | 'DOCTOR_VISIT';
  status: CareRequestStatus;
  priority: string;
  notes?: string;
  requirements?: string;
  scheduleType: ScheduleType;
  preferredDate?: string;
  preferredStartTime?: string;
  preferredTimeWindow?: TimeWindow;
  durationMinutes: number;
  recurring?: {
    startDate: string;
    frequency: RecurringFrequency;
    occurrencesLimit: number;
  };
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: string;
    user: User;
  };
  // Optional relations
  marketplaceListing?: {
    id: string;
    status: string;
  };
  visits?: Array<{
    id: string;
    status: string;
    scheduledAt: string;
  }>;
}

export interface RescheduleRequestDto {
  newDate?: string;
  newTime?: string;
  newTimeWindow?: TimeWindow;
  reason?: string;
}

export interface CancelRequestDto {
  reason?: string;
}

export const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createCareRequestSchema = z.object({
  type: z.enum(['NURSE_VISIT', 'DOCTOR_VISIT']),
  notes: z.string().trim().optional(),
  requirements: z.string().trim().optional(),
  scheduleType: z.enum(['ONE_TIME', 'RECURRING']),
  preferredDate: z.string().optional(),
  preferredStartTime: z.string().trim().regex(timeRegex, 'Time must be in HH:mm 24-hour format').optional(),
  preferredTimeWindow: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'FLEXIBLE']).optional(),
  durationMinutes: z.number().int().positive().max(1440),
  recurring: z.object({
    startDate: z.string(),
    frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY']),
    occurrencesLimit: z.number().int().min(2)
  }).optional(),
  location: z.object({
    address: z.string().trim().min(1, 'Address cannot be empty'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional()
}).superRefine((data, ctx) => {
  if (!data.preferredStartTime && !data.preferredTimeWindow) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one time preference (preferredStartTime or preferredTimeWindow) must be provided.',
      path: ['preferredTimeWindow']
    });
  }

  if (data.scheduleType === 'ONE_TIME') {
    if (!data.preferredDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'preferredDate is required for ONE_TIME requests',
        path: ['preferredDate']
      });
    }
  }

  if (data.scheduleType === 'RECURRING') {
    if (!data.recurring) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'recurring configuration is required for RECURRING requests',
        path: ['recurring']
      });
    }
  }
});

export type CreateCareRequestInput = z.infer<typeof createCareRequestSchema>;
