import { User } from './auth';

export interface PatientProfile {
  id: string;
  userId: string;
  user?: User;
  dob?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  photoUrl?: string;
  emergencyContacts?: EmergencyContact[];
  allergies?: any[];
  medicalConditions?: any[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
}

export interface UpdateProfileDTO {
  fullName?: string;
  dob?: string | Date;
  gender?: string;
  address?: string;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  photoUrl?: string;
}

export interface CreateEmergencyContactDTO {
  name: string;
  phone: string;
  relationship: string;
}
