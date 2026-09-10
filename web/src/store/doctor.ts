import { create } from 'zustand';
import { api } from './auth';

interface DoctorState {
  queue: any[];
  highRiskQueue: any[];
  doctorsList: any[];
  caseReview: any | null;
  homeVisits: any[];
  isLoading: boolean;

  fetchQueue: () => Promise<void>;
  fetchHighRiskQueue: () => Promise<void>;
  acceptCase: (caseId: string) => Promise<void>;
  fetchCaseReview: (caseId: string) => Promise<void>;
  fetchDoctors: () => Promise<void>;
  requestSecondOpinion: (caseId: string, data: { consultedDoctorId: string; notes: string }) => Promise<void>;
  submitDiagnosis: (caseId: string, data: { code: string; description: string; notes?: string }) => Promise<void>;
  submitCarePlan: (caseId: string, data: { title: string; goals: string[]; interventions: string[]; durationWeeks: number }) => Promise<void>;
  submitPrescription: (caseId: string, data: { medications: { drugName: string; dosage: string; frequency: string; durationDays: number; instructions?: string }[] }) => Promise<void>;
  submitDecision: (caseId: string, data: { recommendation: string; actionType: string; urgency: string }) => Promise<void>;
  fetchHomeVisits: () => Promise<void>;
  scheduleHomeVisit: (data: { patientId: string; scheduledAt: string; purpose: string }) => Promise<void>;
  submitAiFeedback: (caseId: string, data: { agree: boolean; feedbackText?: string }) => Promise<void>;
}

export const useDoctorStore = create<DoctorState>((set, get) => ({
  queue: [],
  highRiskQueue: [],
  doctorsList: [],
  caseReview: null,
  homeVisits: [],
  isLoading: false,

  fetchQueue: async () => {
    set({ isLoading: true });
    try {
      const queue = await api('GET', '/doctors/queue');
      set({ queue, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  fetchHighRiskQueue: async () => {
    set({ isLoading: true });
    try {
      const highRiskQueue = await api('GET', '/doctors/queue/high-risk');
      set({ highRiskQueue, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  acceptCase: async (caseId) => {
    await api('PUT', `/cases/${caseId}/accept`);
  },

  fetchCaseReview: async (caseId) => {
    set({ isLoading: true });
    try {
      const caseReview = await api('GET', `/cases/${caseId}/review`);
      set({ caseReview, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
      throw e;
    }
  },

  fetchDoctors: async () => {
    const doctorsList = await api('GET', '/doctors/list');
    set({ doctorsList });
  },

  requestSecondOpinion: async (caseId, data) => {
    await api('POST', `/cases/${caseId}/second-opinion`, data);
  },

  submitDiagnosis: async (caseId, data) => {
    await api('POST', `/cases/${caseId}/diagnosis`, data);
  },

  submitCarePlan: async (caseId, data) => {
    await api('POST', `/cases/${caseId}/care-plan`, data);
  },

  submitPrescription: async (caseId, data) => {
    await api('POST', `/cases/${caseId}/prescriptions`, data);
  },

  submitDecision: async (caseId, data) => {
    await api('POST', `/cases/${caseId}/decision`, data);
  },

  fetchHomeVisits: async () => {
    const homeVisits = await api('GET', '/doctors/home-visits');
    set({ homeVisits });
  },

  scheduleHomeVisit: async (data) => {
    await api('POST', '/doctors/home-visits', data);
    await get().fetchHomeVisits();
  },

  submitAiFeedback: async (caseId, data) => {
    await api('POST', `/cases/${caseId}/ai-feedback`, data);
  },
}));
