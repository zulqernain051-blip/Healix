export interface CreateCareRequestDto {
  patientId: string;
  type: 'NURSE_VISIT' | 'DOCTOR_VISIT';
  notes?: string;
  requirements?: string;
  scheduleType: 'ONE_TIME' | 'RECURRING';
  preferredDate?: Date;
  preferredStartTime?: string;
  preferredTimeWindow?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'FLEXIBLE';
  durationMinutes: number;
  recurring?: {
    startDate: Date;
    frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY';
    occurrencesLimit: number;
  };
  location?: {
    address: string;
    latitude: number;
    longitude: number;
  };
}
