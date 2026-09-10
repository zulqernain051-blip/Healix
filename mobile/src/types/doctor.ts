export interface CaseAssignment {
  id: string;
  visitId: string;
  doctorId: string | null;
  riskTier: 'MEDIUM' | 'HIGH';
  slaDeadline: string;
  acceptedAt: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'RESOLVED';
  createdAt: string;
  remainingMins?: number;
  visit: {
    request: {
      patient: {
        id: string;
        user: {
          fullName: string;
        };
      };
    };
  };
}

export interface PatientAllergy {
  id: string;
  allergen: string;
  severity: string;
}

export interface CaseDiagnosis {
  id: string;
  code: string;
  description: string;
  notes?: string;
  version: number;
  diagnosedAt: string;
}

export interface CaseReviewPayload {
  case: {
    id: string;
    visitId: string;
    doctorId: string | null;
    riskTier: 'MEDIUM' | 'HIGH';
    slaDeadline: string;
    status: string;
    visit: {
      notes: string | null;
      request: {
        patient: {
          id: string;
          address?: string;
          latitude?: number;
          longitude?: number;
          user: {
            fullName: string;
            phone: string;
            email: string;
          };
          allergies: PatientAllergy[];
          diagnoses: any[];
        };
      };
    };
    secondOpinions: any[];
  };
  clinicalData: {
    vitals: any[];
    symptoms: any[];
    notes: string | null;
    nurseRemarks?: string;
    nurseConfidence?: number;
  };
  aiInsights: {
    disclaimer: string;
    summary: string;
    recommendations: Array<{ text: string; source: string }>;
  };
}

export interface ConsultationDoctor {
  id: string;
  user: {
    fullName: string;
  };
}

