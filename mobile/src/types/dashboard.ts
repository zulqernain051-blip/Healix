import { RiskAssessment } from './records';

export interface UpcomingVisit {
  id: string;
  requestId: string;
  nurseId: string | null;
  doctorId: string | null;
  notes: string | null;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  status: string;
  nurseConfirmed: boolean;
  patientConfirmed: boolean;
  agreedStartTime: string | null;
  request: {
    id: string;
    patientId: string;
    type: string;
    status: string;
    scheduleType: string;
    preferredDate: string | null;
    preferredStartTime: string | null;
    preferredTimeWindow: string | null;
    durationMinutes: number;
    address: string | null;
    latitude: number | null;
    longitude: number | null;
    priority: string;
    notes: string | null;
    requirements: string | null;
    recurringPatternId: string | null;
    scheduledAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  nurse: {
    user: {
      fullName: string;
    };
  } | null;
  doctor: {
    user: {
      fullName: string;
    };
  } | null;
}

export interface DashboardSummaryResponse {
  activeRequestsCount: number;
  upcomingVisits: UpcomingVisit[];
  severeAllergiesCount: number;
  latestRisk: RiskAssessment | null;
  pendingPaymentsCount: number;
  pendingPaymentsSum: number;
}
