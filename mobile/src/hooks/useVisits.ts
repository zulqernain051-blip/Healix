import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { visitsApi } from '../api/visits.api';
import {
  VerifyQrDto,
  VerifyGpsDto,
  VerifyManualDto,
  SubmitVitalsDto,
  SubmitSymptomsDto,
  SubmitClinicalRemarkDto,
  VisitStatus,
} from '../types/visit';

// ─── Query Keys ─────────────────────────────────────────────

export const VISIT_KEYS = {
  all: ['visits'] as const,
  detail: (id: string) => [...VISIT_KEYS.all, id] as const,
  nurseList: (nurseId: string) => [...VISIT_KEYS.all, 'nurse', nurseId] as const,
  qrToken: (visitId: string) => [...VISIT_KEYS.all, visitId, 'qr'] as const,
};

// ─── Queries ────────────────────────────────────────────────

/** Fetch all visits assigned to a nurse */
export const useNurseVisits = (nurseId: string) => {
  return useQuery({
    queryKey: VISIT_KEYS.nurseList(nurseId),
    queryFn: () => visitsApi.getNurseVisits(nurseId),
    enabled: !!nurseId,
  });
};

/** Fetch a single visit with all relations */
export const useVisitDetail = (visitId: string, options?: { pollingInterval?: number }) => {
  return useQuery({
    queryKey: VISIT_KEYS.detail(visitId),
    queryFn: () => visitsApi.getVisitDetail(visitId),
    enabled: !!visitId,
    refetchInterval: (query) => {
      // Stop polling once visit reaches a terminal state
      const status = query.state.data?.status as VisitStatus | undefined;
      if (status === 'COMPLETED' || status === 'DECLINED') return false;
      return options?.pollingInterval ?? false;
    },
  });
};

/** Fetch the QR token for a visit (patient-facing) */
export const useQrToken = (visitId: string) => {
  return useQuery({
    queryKey: VISIT_KEYS.qrToken(visitId),
    queryFn: () => visitsApi.getQrToken(visitId),
    enabled: !!visitId,
  });
};

// ─── Verification Mutations ────────────────────────────────

export const useCheckIn = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (visitId: string) => visitsApi.checkInVisit(visitId),
    onSuccess: (_res, visitId) => {
      qc.invalidateQueries({ queryKey: VISIT_KEYS.detail(visitId) });
      qc.invalidateQueries({ queryKey: VISIT_KEYS.all });
    },
  });
};

export const useCheckOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (visitId: string) => visitsApi.checkOutVisit(visitId),
    onSuccess: (_res, visitId) => {
      qc.invalidateQueries({ queryKey: VISIT_KEYS.detail(visitId) });
      qc.invalidateQueries({ queryKey: VISIT_KEYS.all });
    },
  });
};

export const useConfirmArrival = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (visitId: string) => visitsApi.confirmArrival(visitId),
    onSuccess: (_res, visitId) => {
      qc.invalidateQueries({ queryKey: VISIT_KEYS.detail(visitId) });
    },
  });
};

export const useVerifyQr = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: VerifyQrDto }) =>
      visitsApi.verifyQr(visitId, data),
    onSuccess: (_res, { visitId }) => {
      qc.invalidateQueries({ queryKey: VISIT_KEYS.detail(visitId) });
      qc.invalidateQueries({ queryKey: VISIT_KEYS.all });
    },
  });
};

export const useVerifyGps = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: VerifyGpsDto }) =>
      visitsApi.verifyGps(visitId, data),
    onSuccess: (_res, { visitId }) => {
      qc.invalidateQueries({ queryKey: VISIT_KEYS.detail(visitId) });
      qc.invalidateQueries({ queryKey: VISIT_KEYS.all });
    },
  });
};

export const useVerifyManual = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: VerifyManualDto }) =>
      visitsApi.verifyManual(visitId, data),
    onSuccess: (_res, { visitId }) => {
      qc.invalidateQueries({ queryKey: VISIT_KEYS.detail(visitId) });
      qc.invalidateQueries({ queryKey: VISIT_KEYS.all });
    },
  });
};

// ─── Clinical Mutations ─────────────────────────────────────

export const useSubmitVitals = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: SubmitVitalsDto }) =>
      visitsApi.submitVitals(visitId, data),
    onSuccess: (_res, { visitId }) => {
      qc.invalidateQueries({ queryKey: VISIT_KEYS.detail(visitId) });
    },
  });
};

export const useSubmitSymptoms = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: SubmitSymptomsDto }) =>
      visitsApi.submitSymptoms(visitId, data),
    onSuccess: (_res, { visitId }) => {
      qc.invalidateQueries({ queryKey: VISIT_KEYS.detail(visitId) });
    },
  });
};

export const useSubmitClinicalRemarks = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, data }: { visitId: string; data: SubmitClinicalRemarkDto }) =>
      visitsApi.submitClinicalRemarks(visitId, data),
    onSuccess: (_res, { visitId }) => {
      qc.invalidateQueries({ queryKey: VISIT_KEYS.detail(visitId) });
    },
  });
};

// ─── Lifecycle Mutations ────────────────────────────────────

export const useCompleteVisit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (visitId: string) => visitsApi.completeVisit(visitId),
    onSuccess: (_res, visitId) => {
      qc.invalidateQueries({ queryKey: VISIT_KEYS.detail(visitId) });
      qc.invalidateQueries({ queryKey: VISIT_KEYS.all });
    },
  });
};

export const useSaveVisitNotes = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, notes }: { visitId: string; notes: string }) =>
      visitsApi.saveNotes(visitId, notes),
    onSuccess: (_res, { visitId }) => {
      qc.invalidateQueries({ queryKey: VISIT_KEYS.detail(visitId) });
    },
  });
};
