import { z } from 'zod';

export const acceptVisitSchema = z.object({});

export const declineVisitSchema = z.object({
  reason: z.string().optional()
});

export const visitNotesSchema = z.object({
  notes: z.string().min(1, 'Notes cannot be empty')
});

export const verifyQrSchema = z.object({
  qrToken: z.string().min(1, 'QR Token is required')
});

export const verifyGpsSchema = z.object({
  latitude: z.number({ required_error: 'Latitude is required' }),
  longitude: z.number({ required_error: 'Longitude is required' })
});

export const verifyManualSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters long')
});

export const vitalsSchema = z.object({
  systolic: z.number().int().min(60).max(250),
  diastolic: z.number().int().min(40).max(150),
  heartRate: z.number().int().min(30).max(220),
  temperature: z.number().min(34).max(42),
  oxygenSaturation: z.number().min(0).max(100),
  bloodSugar: z.number().optional()
});

export const symptomSchema = z.object({
  symptoms: z.array(
    z.object({
      symptomName: z.string().min(1, 'Symptom name is required'),
      severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
      bodySystem: z.string().optional(),
      notes: z.string().optional()
    })
  ).min(1, 'At least one symptom must be selected')
});

export const clinicalRemarkSchema = z.object({
  remarksText: z.string().min(10, 'Remarks must be at least 10 characters long'),
  confidenceLevel: z.number().int().min(1).max(5)
});

export const ratingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  reviewText: z.string().optional(),
  recommend: z.boolean().default(true)
});

export const vacationSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().optional()
});
