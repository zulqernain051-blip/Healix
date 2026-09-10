import { User } from './auth';

export interface PatientProfile {
  id: string;
  userId: string;
  user?: User;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
  emergencyContacts?: EmergencyContact[];
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
  latitude?: number;
  longitude?: number;
  photoUrl?: string;
}

export interface CreateEmergencyContactDTO {
  name: string;
  phone: string;
  relationship: string;
}
