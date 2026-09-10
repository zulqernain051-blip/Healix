export interface RiskAssessment {
  id: string;
  patientId: string;
  visitId: string | null;
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
  fusedScore: number;
  mlScore: number;
  nurseConfidence: number;
  explanation: string;
  timedOut: boolean;
  notes: string | null;
  assessedAt: string;
}

export interface KnowledgeEntry {
  id: string;
  topic: string;
  content: string;
  tags: string;
  createdAt: string;
}

export interface VisitAiSummary {
  visitId: string;
  patientName: string;
  summary: string;
  recommendations: string[];
  generatedAt: string;
}
