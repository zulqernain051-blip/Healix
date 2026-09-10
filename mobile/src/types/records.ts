export interface VitalSign {
  id: string;
  type: string;
  value: number;
  unit: string;
  recordedAt: string;
  recordedBy?: string;
  notes?: string;
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
