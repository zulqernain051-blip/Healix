import { z } from 'zod';

/** Update nurse biography, experience, photo, and availability toggle */
export const updateNurseProfileSchema = z.object({
  bio: z.string().trim().min(20, 'Bio must be at least 20 characters').optional(),
  experience: z.number().int().min(0, 'Experience cannot be negative').max(50, 'Experience cannot exceed 50 years').optional(),
  photoUrl: z.string().trim().url('Invalid photo URL').optional(),
  available: z.boolean().optional()
});

/** Add a qualification/certification entry */
export const qualificationSchema = z.object({
  title: z.string().trim().min(2, 'Qualification title must be at least 2 characters'),
  issuingBody: z.string().trim().min(2, 'Issuing body must be at least 2 characters'),
  yearObtained: z.number().int().min(1970).max(new Date().getFullYear(), 'Year cannot be in the future')
});

/** Add a clinical specialization */
export const specializationSchema = z.object({
  specialization: z.enum(
    ['ELDERLY_CARE', 'DIABETES_CARE', 'WOUND_CARE', 'PEDIATRIC_CARE', 'MATERNAL_CARE', 'IV_THERAPY', 'POST_SURGERY_CARE', 'REHABILITATION_CARE', 'PALLIATIVE_CARE', 'GENERAL_NURSING'],
    { errorMap: () => ({ message: 'Invalid specialization type' }) }
  )
});

/** Upload a verification document (URL-based for now; binary uploads use separate flow) */
export const uploadDocumentSchema = z.object({
  documentType: z.enum(
    ['CNIC_FRONT', 'CNIC_BACK', 'NURSE_LICENSE', 'DEGREE', 'BACKGROUND_CHECK'],
    { errorMap: () => ({ message: 'Invalid document type for nurse verification' }) }
  ),
  fileUrl: z.string().trim().url('A valid document file URL is required')
});

/** Admin review of a submitted document */
export const reviewDocumentSchema = z.object({
  documentId: z.string().uuid('Invalid document ID'),
  status: z.enum(['APPROVED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be APPROVED or REJECTED' })
  }),
  rejectionReason: z.string().trim().min(10, 'Rejection reason must be at least 10 characters').optional()
}).refine(
  (data) => data.status !== 'REJECTED' || !!data.rejectionReason,
  { message: 'A rejection reason is required when rejecting a document', path: ['rejectionReason'] }
);

/** Create a weekly availability slot */
export const availabilitySlotSchema = z.object({
  dayOfWeek: z.number().int().min(0, 'Day must be 0 (Sunday) to 6 (Saturday)').max(6, 'Day must be 0 (Sunday) to 6 (Saturday)'),
  startTime: z.string().trim().regex(/^\d{2}:\d{2}$/, 'startTime must be in HH:MM format (e.g. 09:00)'),
  endTime: z.string().trim().regex(/^\d{2}:\d{2}$/, 'endTime must be in HH:MM format (e.g. 17:00)')
}).refine(
  (data) => data.startTime < data.endTime,
  { message: 'startTime must be earlier than endTime', path: ['endTime'] }
);
