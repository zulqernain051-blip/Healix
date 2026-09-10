import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:mm 24-hour format

export const createCareRequestSchema = z.object({
  type: z.enum(['NURSE_VISIT', 'DOCTOR_VISIT']),
  notes: z.string().trim().optional(),
  requirements: z.string().trim().optional(),
  
  scheduleType: z.enum(['ONE_TIME', 'RECURRING']),
  
  preferredDate: z.preprocess(
    (val) => (typeof val === 'string' && val ? new Date(val) : val),
    z.date().refine(val => val > new Date(), { message: 'Date must be in the future' }).optional()
  ),
  
  preferredStartTime: z.string().trim().regex(timeRegex, 'Time must be in HH:mm 24-hour format').optional(),
  
  preferredTimeWindow: z.enum(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT', 'FLEXIBLE']).optional(),
  
  durationMinutes: z.number().int().positive().max(1440),
  
  recurring: z.object({
    startDate: z.preprocess(
      (val) => (typeof val === 'string' && val ? new Date(val) : val),
      z.date().refine(val => val > new Date(), { message: 'Start date must be in the future' })
    ),
    frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY']),
    occurrencesLimit: z.number().int().min(2)
  }).optional(),
  
  location: z.object({
    address: z.string().trim().min(1, 'Address cannot be empty'),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180)
  }).optional()
}).superRefine((data, ctx) => {
  // Common time preference check
  if (!data.preferredStartTime && !data.preferredTimeWindow) {
    // Both omitted is allowed by requirement "Do not force the patient to provide both if business rules permit completely unspecified".
    // Wait, the prompt says: "Then require at least one of: preferredStartTime OR preferredTimeWindow" for ONE_TIME, and also for RECURRING.
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
