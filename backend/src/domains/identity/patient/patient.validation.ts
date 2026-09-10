import { z } from 'zod';

const phoneRegex = /^((\+92)|(0092)|(92)|0)?3\d{9}$/;

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(3, 'Full name must be at least 3 characters long').optional(),
  dob: z.preprocess(
    (val) => (typeof val === 'string' && val ? new Date(val) : val),
    z.date().optional()
  ),
  gender: z.string().trim().min(1, 'Gender cannot be empty').optional(),
  address: z.string().trim().min(1, 'Address cannot be empty').optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  photoUrl: z.string().trim().url('Invalid photo URL').optional()
});

export const emergencyContactSchema = z.object({
  name: z.string().trim().min(3, 'Contact name must be at least 3 characters long'),
  phone: z.string().trim().regex(phoneRegex, 'Invalid Pakistan mobile phone number (e.g. 03001234567)'),
  relationship: z.string().trim().min(1, 'Relationship must be specified')
});

export const chronicConditionSchema = z.object({
  name: z.string().trim().min(2, 'Condition name must be at least 2 characters long'),
  diagnosedDate: z.preprocess(
    (val) => (typeof val === 'string' && val ? new Date(val) : val),
    z.date().optional()
  ),
  notes: z.string().trim().optional()
});

export const allergySchema = z.object({
  allergen: z.string().trim().min(2, 'Allergen name must be at least 2 characters long'),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE'], {
    errorMap: () => ({ message: 'Severity must be one of MILD, MODERATE, or SEVERE' })
  })
});

export const medicationSchema = z.object({
  name: z.string().trim().min(2, 'Medication name must be at least 2 characters long'),
  dosage: z.string().trim().min(1, 'Dosage must be specified (e.g., 500mg)'),
  frequency: z.string().trim().min(1, 'Frequency must be specified (e.g., Once daily)'),
  active: z.boolean().optional()
});



export const rescheduleRequestSchema = z.object({
  scheduledAt: z.preprocess(
    (val) => (typeof val === 'string' && val ? new Date(val) : val),
    z.date().refine(val => val > new Date(), { message: 'Appointment time must be in the future' })
  )
});


