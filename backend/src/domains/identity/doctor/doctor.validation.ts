import { z } from 'zod';

export const secondOpinionSchema = z.object({
  consultedDoctorId: z.string().uuid()
});

export const diagnosisSchema = z.object({
  code: z.string().min(1, 'ICD code is required'),
  description: z.string().min(1, 'Description is required'),
  notes: z.string().optional(),
  parentId: z.string().uuid().optional() // self-referencing for corrections
});

export const carePlanMilestoneSchema = z.object({
  title: z.string().min(1, 'Milestone title is required'),
  targetDate: z.string().datetime()
});

export const carePlanSchema = z.object({
  title: z.string().min(1, 'Plan title is required'),
  description: z.string().optional(),
  milestones: z.array(carePlanMilestoneSchema).min(1, 'At least one milestone is required')
});

export const prescriptionItemSchema = z.object({
  medicationName: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  durationDays: z.number().int().positive()
});

export const prescriptionSchema = z.object({
  instructions: z.string().optional(),
  items: z.array(prescriptionItemSchema).min(1, 'At least one medication is required'),
  supersedesId: z.string().uuid().optional(),
  bypassAllergyCheck: z.boolean().default(false) // bypass allergy flag
});

export const decisionSchema = z.object({
  decision: z.enum(['CONTINUE_MONITORING', 'RECOMMEND_ADMISSION', 'REQUEST_EMERGENCY', 'FOLLOW_UP']),
  justification: z.string().min(10, 'Justification must be at least 10 characters long'),
  autoDispatch: z.boolean().default(false) // toggle settings for dispatch
});

export const homeVisitSchema = z.object({
  patientId: z.string().uuid(),
  scheduledAt: z.string().datetime()
});

export const transitStatusSchema = z.object({
  status: z.enum(['SCHEDULED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED', 'CANCELLED'])
});

export const documentationSchema = z.object({
  findings: z.string().min(5, 'Findings must be at least 5 characters'),
  outcomeNotes: z.string().optional()
});

export const aiFeedbackSchema = z.object({
  targetType: z.enum(['SUMMARY', 'RECOMMENDATION']),
  comment: z.string().min(5, 'Comment must be at least 5 characters')
});
