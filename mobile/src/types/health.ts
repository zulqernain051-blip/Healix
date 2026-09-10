export interface Condition {
  id: string;
  name: string;
  diagnosedDate?: string;
  notes?: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  reaction: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  active: boolean;
}

export interface MedicalHistoryResponse {
  chronicConditions: Condition[];
  allergies: Allergy[];
  medications: Medication[];
}

export interface ConditionDTO {
  name: string;
  diagnosedDate?: string;
  notes?: string;
}

export interface AllergyDTO {
  allergen: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE';
  reaction: string;
}

export interface MedicationDTO {
  name: string;
  dosage: string;
  frequency: string;
  active: boolean;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  prescribedBy: string;
  datePrescribed: string;
  status: 'active' | 'completed';
}

export interface CarePlan {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
  startDate: string;
  goals: string[];
}

export interface CaregiverLink {
  id: string;
  caregiverId: string;
  caregiverName: string;
  relationship: string;
  permissions: string[];
  status: 'active' | 'pending';
}
