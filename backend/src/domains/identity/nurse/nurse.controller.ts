import { Request, Response } from 'express';
import { asyncHandler } from '../../../common/middleware/asyncHandler';
import { sendSuccessResponse } from '../../../common/utils/response';
import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants';

// Use Cases
import { GetNurseProfileUseCase } from './usecases/profile/get-nurse-profile.usecase';
import { GetNurseProfileByUserIdUseCase } from './usecases/profile/get-nurse-profile-by-user-id.usecase';
import { UpdateNurseProfileUseCase } from './usecases/profile/update-nurse-profile.usecase';
import { AddQualificationUseCase } from './usecases/profile/add-qualification.usecase';
import { DeleteQualificationUseCase } from './usecases/profile/delete-qualification.usecase';
import { AddSpecializationUseCase } from './usecases/profile/add-specialization.usecase';

import { GetVerificationStatusUseCase } from './usecases/verification/get-verification-status.usecase';
import { UploadDocumentUseCase } from './usecases/verification/upload-document.usecase';
import { ReviewDocumentUseCase } from './usecases/verification/review-document.usecase';

import { GetAvailabilitySlotsUseCase } from './usecases/scheduling/get-availability-slots.usecase';
import { AddAvailabilitySlotUseCase } from './usecases/scheduling/add-availability-slot.usecase';
import { DeleteAvailabilitySlotUseCase } from './usecases/scheduling/delete-availability-slot.usecase';

import { GetNurseEarningsUseCase } from './usecases/payroll/get-nurse-earnings.usecase';

/**
 * Enforce resource ownership – Nurses can only access their own profile.
 * Admins bypass all checks.
 */
const checkOwnership = async (req: Request, targetNurseId: string) => {
  const user = (req as any).user;
  if (user.role === 'ADMIN') return;

  if (user.role === 'NURSE') {
    const nurse = await GetNurseProfileByUserIdUseCase.execute(user.id);
    if (nurse.id !== targetNurseId) {
      throw new AppError('Access forbidden. You do not own this profile.', HTTP_STATUS.FORBIDDEN);
    }
    return;
  }

  throw new AppError('Access denied.', HTTP_STATUS.FORBIDDEN);
};

// ─────────────────────────────────────────────
// Profile
// ─────────────────────────────────────────────
export const getNurseProfileController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await GetNurseProfileUseCase.execute(id);
  return sendSuccessResponse(res, 'Nurse profile retrieved successfully.', result, HTTP_STATUS.OK);
});

export const updateNurseProfileController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await UpdateNurseProfileUseCase.execute(id, req.body);
  return sendSuccessResponse(res, 'Nurse profile updated successfully.', result, HTTP_STATUS.OK);
});

// ─────────────────────────────────────────────
// Qualifications
// ─────────────────────────────────────────────
export const addQualificationController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await AddQualificationUseCase.execute(id, req.body);
  return sendSuccessResponse(res, 'Qualification added successfully.', result, HTTP_STATUS.CREATED);
});

export const deleteQualificationController = asyncHandler(async (req: Request, res: Response) => {
  const { id, qualId } = req.params;
  await checkOwnership(req, id);
  const result = await DeleteQualificationUseCase.execute(id, qualId);
  return sendSuccessResponse(res, 'Qualification removed successfully.', result, HTTP_STATUS.OK);
});

// ─────────────────────────────────────────────
// Specializations
// ─────────────────────────────────────────────
export const addSpecializationController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await AddSpecializationUseCase.execute(id, req.body.specialization);
  return sendSuccessResponse(res, 'Specialization added successfully.', result, HTTP_STATUS.CREATED);
});

// ─────────────────────────────────────────────
// Verification Documents
// ─────────────────────────────────────────────
export const getVerificationStatusController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const user = (req as any).user;
  const result = await GetVerificationStatusUseCase.execute(user.id, id);
  return sendSuccessResponse(res, 'Nurse verification status retrieved successfully.', result, HTTP_STATUS.OK);
});

export const uploadDocumentController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const user = (req as any).user;
  const { documentType, fileUrl } = req.body;
  const result = await UploadDocumentUseCase.execute(user.id, id, documentType, fileUrl);
  return sendSuccessResponse(res, 'Document submitted for verification.', result, HTTP_STATUS.CREATED);
});

/** Admin-only: Approve or reject a submitted nurse document */
export const reviewDocumentController = asyncHandler(async (req: Request, res: Response) => {
  const requestUser = (req as any).user;
  if (requestUser.role !== 'ADMIN') {
    throw new AppError('Only administrators can review verification documents.', HTTP_STATUS.FORBIDDEN);
  }
  const { documentId, status, rejectionReason } = req.body;
  const result = await ReviewDocumentUseCase.execute(documentId, status, rejectionReason);
  return sendSuccessResponse(res, `Document ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`, result, HTTP_STATUS.OK);
});

// ─────────────────────────────────────────────
// Availability Slots
// ─────────────────────────────────────────────
export const getAvailabilitySlotsController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await GetAvailabilitySlotsUseCase.execute(id);
  return sendSuccessResponse(res, 'Nurse availability slots retrieved successfully.', result, HTTP_STATUS.OK);
});

export const addAvailabilitySlotController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await AddAvailabilitySlotUseCase.execute(id, req.body);
  return sendSuccessResponse(res, 'Availability slot added successfully.', result, HTTP_STATUS.CREATED);
});

export const deleteAvailabilitySlotController = asyncHandler(async (req: Request, res: Response) => {
  const { id, slotId } = req.params;
  await checkOwnership(req, id);
  const result = await DeleteAvailabilitySlotUseCase.execute(id, slotId);
  return sendSuccessResponse(res, 'Availability slot removed successfully.', result, HTTP_STATUS.OK);
});

// ─────────────────────────────────────────────
// Earnings
// ─────────────────────────────────────────────
export const getEarningsController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await GetNurseEarningsUseCase.execute(id);
  return sendSuccessResponse(res, 'Nurse earnings summary retrieved successfully.', result, HTTP_STATUS.OK);
});
