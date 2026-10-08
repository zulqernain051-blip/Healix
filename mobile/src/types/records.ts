export interface VitalSign {
  id: string; visitId: string; systolic: number; diastolic: number; heartRate: number;
  temperature: number; oxygenSaturation: number; bloodSugar?: number | null; recordedAt: string;
}

export interface RiskAssessment {
  id: string;
  patientId: string;
  visitId: string | null;
  riskTier: string;
  fusedScore: number;
  mlScore: number;
  nurseConfidence: number;
  explanation: string | null;
  timedOut: boolean;
  notes: string | null;
  assessedAt: string;
}
