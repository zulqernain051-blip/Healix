import { z } from 'zod';
import { CareRequestResponse } from './care';
import { User } from './auth';

export type VisitStatus = 'SCHEDULED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DECLINED';
export type VerificationMethod = 'QR' | 'GPS' | 'MANUAL';
export type SymptomSeverity = 'MILD' | 'MODERATE' | 'SEVERE';

export interface VitalsRecord {
  id: string;
  visitId: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  bloodSugar?: number;
  recordedAt: string;
}

export interface VisitVerification {
  id: string;
  visitId: string;
  method: VerificationMethod;
  result: boolean;
  reason?: string;
  latitude?: number;
  longitude?: number;
  verifiedAt: string;
}

export interface VisitSymptom {
  id: string;
  visitId: string;
  symptomName: string;
  severity: SymptomSeverity;
  bodySystem?: string;
  notes?: string;
  createdAt: string;
}

export interface ClinicalRemark {
  id: string;
  visitId: string;
  remarksText: string;
  confidenceLevel: number;
  createdAt: string;
}

export interface Visit {
  id: string;
  requestId: string;
  nurseId?: string;
  doctorId?: string;
  notes?: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  status: VisitStatus;
  nurseConfirmed?: boolean;
  patientConfirmed?: boolean;
  
  // Relations that may be included by the backend
  request?: CareRequestResponse;
  nurse?: { id: string; user: User };
  vitals?: VitalsRecord[];
  verifications?: VisitVerification[];
  symptoms?: VisitSymptom[];
  clinicalRemark?: ClinicalRemark;
}

// Validation schemas matching backend visit.validation.ts
export const verifyQrSchema = z.object({
  token: z.string().min(1, 'QR Token is required'),
});

export const verifyGpsSchema = z.object({
  latitude: z.number({ required_error: 'Latitude is required' }),
  longitude: z.number({ required_error: 'Longitude is required' }),
});

export const verifyManualSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters long'),
});

export const vitalsSchema = z.object({
  systolic: z.number().int().min(60).max(250),
  diastolic: z.number().int().min(40).max(150),
  heartRate: z.number().int().min(30).max(220),
  temperature: z.number().min(34).max(42),
  oxygenSaturation: z.number().min(0).max(100),
  bloodSugar: z.number().optional().or(z.nan()),
});

export const symptomSchema = z.object({
  symptoms: z.array(
    z.object({
      symptomName: z.string().min(1, 'Symptom name is required'),
      severity: z.enum(['MILD', 'MODERATE', 'SEVERE']),
      bodySystem: z.string().optional(),
      notes: z.string().optional(),
    })
  ).min(1, 'At least one symptom must be selected'),
});

export const clinicalRemarkSchema = z.object({
  remarksText: z.string().min(10, 'Remarks must be at least 10 characters long'),
  confidenceLevel: z.number().int().min(1).max(5),
});

// DTOs inferred from schemas
export type VerifyQrDto = z.infer<typeof verifyQrSchema>;
export type VerifyGpsDto = z.infer<typeof verifyGpsSchema>;
export type VerifyManualDto = z.infer<typeof verifyManualSchema>;
export type SubmitVitalsDto = z.infer<typeof vitalsSchema>;
export type SubmitSymptomsDto = z.infer<typeof symptomSchema>;
export type SubmitClinicalRemarkDto = z.infer<typeof clinicalRemarkSchema>;
