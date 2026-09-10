export interface NurseProfile {
  id: string;
  userId: string;
  cnic: string;
  pncNumber: string;
  bio: string | null;
  experience: number | null;
  photoUrl: string | null;
  available: boolean;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
  };
  qualifications: NurseQualification[];
  specializations: NurseSpecialization[];
  availabilitySlots: AvailabilitySlot[];
}

export interface NurseQualification {
  id: string;
  nurseId: string;
  title: string;
  issuingBody: string;
  yearObtained: number;
  createdAt: string;
}

export interface NurseSpecialization {
  id: string;
  nurseId: string;
  specialization: string;
  certified: boolean;
  certificateUrl?: string | null;
  createdAt: string;
}

export interface AvailabilitySlot {
  id: string;
  nurseId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  shiftType: string;
  createdAt: string;
}

export interface VerificationCheck {
  status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  fileUrl?: string;
  rejectionReason?: string | null;
  uploadedAt?: string;
}

export interface VerificationStatus {
  accountStatus: string;
  isFullyVerified: boolean;
  checks: Record<string, VerificationCheck>;
}

export interface NurseEarnings {
  totalEarned: number;
  pendingAmount: number;
  completedCount: number;
  pendingCount: number;
  history: any[];
}

export interface NurseScore {
  skillScore: number;
  experienceScore: number;
  reliabilityScore: number;
  performanceScore: number;
  compositeScore: number;
  totalVisits: number;
  avgRating: number;
}

export interface NurseReview {
  id: string;
  stars: number;
  reviewText?: string;
  recommend: boolean;
  createdAt: string;
  patient: {
    user: {
      fullName: string;
    };
  };
  visit: {
    request: {
      scheduledAt: string;
    };
  };
}

export interface NurseBadge {
  id: string;
  badgeType: string;
  awardedAt: string;
}

export interface NurseVacation {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
}
