import { GetClinicalOutcomesUseCase } from './usecases/clinical/get-clinical-outcomes.usecase';
import { GetActiveEmergencyUseCase } from './usecases/emergency/get-active-emergency.usecase';
import { Request, Response } from 'express';
import { asyncHandler } from '../../../common/middleware/asyncHandler';
import { sendSuccessResponse } from '../../../common/utils/response';
import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants';

// Use Cases
import { GetProfileUseCase } from './usecases/profile/get-profile.usecase';
import { GetProfileByUserIdUseCase } from './usecases/profile/get-profile-by-user-id.usecase';
import { SearchUserUseCase } from './usecases/profile/search-user.usecase';
import { UpdateProfileUseCase } from './usecases/profile/update-profile.usecase';
import { GetCaregiverLinksUseCase } from './usecases/profile/get-caregiver-links.usecase';
import { AddEmergencyContactUseCase } from './usecases/emergency/add-emergency-contact.usecase';
import { DeleteEmergencyContactUseCase } from './usecases/emergency/delete-emergency-contact.usecase';
import { GetMedicalHistoryUseCase } from './usecases/clinical/get-medical-history.usecase';
import { AddChronicConditionUseCase } from './usecases/clinical/add-chronic-condition.usecase';
import { AddAllergyUseCase } from './usecases/clinical/add-allergy.usecase';
import { AddMedicationUseCase } from './usecases/clinical/add-medication.usecase';
import { GetVitalsHistoryUseCase } from './usecases/clinical/get-vitals-history.usecase';
import { GetRiskHistoryUseCase } from './usecases/clinical/get-risk-history.usecase';
import { GetPrescriptionsHistoryUseCase } from './usecases/clinical/get-prescriptions-history.usecase';
import { GetCarePlansUseCase } from './usecases/clinical/get-care-plans.usecase';
import { CreateCareRequestUseCase } from '../../care/requests/usecases/requests/create-care-request.usecase';
import { GetCareRequestUseCase } from './usecases/care/get-care-request.usecase';
import { CancelCareRequestUseCase } from './usecases/care/cancel-care-request.usecase';
import { RescheduleCareRequestUseCase } from './usecases/care/reschedule-care-request.usecase';
import { GetCareRequestsUseCase } from './usecases/care/get-care-requests.usecase';
import { GetVisitsHistoryUseCase } from './usecases/care/get-visits-history.usecase';
import { GetDashboardSummaryUseCase } from './usecases/dashboard/get-dashboard-summary.usecase';

// Instantiate Use Cases
const getProfileUseCase = new GetProfileUseCase();
const getActiveEmergencyUseCase = new GetActiveEmergencyUseCase();
const getProfileByUserIdUseCase = new GetProfileByUserIdUseCase();
const searchUserUseCase = new SearchUserUseCase();
const updateProfileUseCase = new UpdateProfileUseCase();
const getCaregiverLinksUseCase = new GetCaregiverLinksUseCase();
const addEmergencyContactUseCase = new AddEmergencyContactUseCase();
const deleteEmergencyContactUseCase = new DeleteEmergencyContactUseCase();
const getMedicalHistoryUseCase = new GetMedicalHistoryUseCase();
const getClinicalOutcomesUseCase = new GetClinicalOutcomesUseCase();
const addChronicConditionUseCase = new AddChronicConditionUseCase();
const addAllergyUseCase = new AddAllergyUseCase();
const addMedicationUseCase = new AddMedicationUseCase();
const getVitalsHistoryUseCase = new GetVitalsHistoryUseCase();
const getRiskHistoryUseCase = new GetRiskHistoryUseCase();
const getPrescriptionsHistoryUseCase = new GetPrescriptionsHistoryUseCase();
const getCarePlansUseCase = new GetCarePlansUseCase();
const createCareRequestUseCase = new CreateCareRequestUseCase();
const getCareRequestUseCase = new GetCareRequestUseCase();
const cancelCareRequestUseCase = new CancelCareRequestUseCase();
const rescheduleCareRequestUseCase = new RescheduleCareRequestUseCase();
const getCareRequestsUseCase = new GetCareRequestsUseCase();
const getVisitsHistoryUseCase = new GetVisitsHistoryUseCase();
const getDashboardSummaryUseCase = new GetDashboardSummaryUseCase();

/**
 * Helper utility to enforce resource ownership and prevent cross-user data tampering.
 */
const checkOwnership = async (req: Request, targetPatientId: string) => {
  const user = (req as any).user;
  if (user.role === 'ADMIN') return;

  if (user.role === 'PATIENT') {
    const patient = await getProfileByUserIdUseCase.execute(user.id);
    if (patient.id !== targetPatientId) {
      throw new AppError('Access forbidden. You do not own this profile.', HTTP_STATUS.FORBIDDEN);
    }
    return;
  }

  throw new AppError('Access denied.', HTTP_STATUS.FORBIDDEN);
};

export const getProfileController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await getProfileUseCase.execute(id);
  return sendSuccessResponse(res, 'Patient profile retrieved successfully.', result, HTTP_STATUS.OK);
});

export const searchUserByPhoneController = asyncHandler(async (req: Request, res: Response) => {
  const phone = (req.query.phone as string) || '';
  const result = await searchUserUseCase.execute(phone);
  return sendSuccessResponse(res, 'User found successfully.', result, HTTP_STATUS.OK);
});

export const updateProfileController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const user = (req as any).user;
  const result = await updateProfileUseCase.execute(id, user.id, req.body);
  return sendSuccessResponse(res, 'Patient profile updated successfully.', result, HTTP_STATUS.OK);
});

export const addEmergencyContactController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await addEmergencyContactUseCase.execute(id, req.body);
  return sendSuccessResponse(res, 'Emergency contact added successfully.', result, HTTP_STATUS.CREATED);
});

export const deleteEmergencyContactController = asyncHandler(async (req: Request, res: Response) => {
  const { id, contactId } = req.params;
  await checkOwnership(req, id);
  await deleteEmergencyContactUseCase.execute(id, contactId);
  return sendSuccessResponse(res, 'Emergency contact deleted successfully.', null, HTTP_STATUS.OK);
});

export const getMedicalHistoryController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await getMedicalHistoryUseCase.execute(id);
  return sendSuccessResponse(res, 'Patient medical history retrieved successfully.', result, HTTP_STATUS.OK);
});

export const addChronicConditionController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await addChronicConditionUseCase.execute(id, req.body);
  return sendSuccessResponse(res, 'Chronic condition added successfully.', result, HTTP_STATUS.CREATED);
});

export const addAllergyController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await addAllergyUseCase.execute(id, req.body);
  return sendSuccessResponse(res, 'Allergy added successfully.', result, HTTP_STATUS.CREATED);
});

export const addMedicationController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await addMedicationUseCase.execute(id, req.body);
  return sendSuccessResponse(res, 'Medication added successfully.', result, HTTP_STATUS.CREATED);
});

export const createCareRequestController = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  // Let the new CreateCareRequestUseCase handle retrieving Patient to avoid duplication.
  // Wait, no, the route already validates the payload, I need to import the new schema here.
  // The schema isn't imported here, the route does it.
  const result = await createCareRequestUseCase.execute(user.id, req.body);
  return sendSuccessResponse(res, 'Care request created successfully.', result, HTTP_STATUS.CREATED);
});

export const getCareRequestController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const patient = await getProfileByUserIdUseCase.execute(user.id);
  const result = await getCareRequestUseCase.execute(id, patient.id);
  return sendSuccessResponse(res, 'Care request retrieved successfully.', result, HTTP_STATUS.OK);
});

export const cancelCareRequestController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const patient = await getProfileByUserIdUseCase.execute(user.id);
  const result = await cancelCareRequestUseCase.execute(id, patient.id);
  return sendSuccessResponse(res, 'Care request cancelled successfully.', result, HTTP_STATUS.OK);
});

export const rescheduleCareRequestController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const patient = await getProfileByUserIdUseCase.execute(user.id);
  const result = await rescheduleCareRequestUseCase.execute(id, patient.id, req.body.scheduledAt);
  return sendSuccessResponse(res, 'Care request rescheduled successfully.', result, HTTP_STATUS.OK);
});

export const getCareRequestsController = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const patient = await getProfileByUserIdUseCase.execute(user.id);
  const result = await getCareRequestsUseCase.execute(patient.id);
  return sendSuccessResponse(res, 'Care requests retrieved successfully.', result, HTTP_STATUS.OK);
});

export const getVisitsHistoryController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await getVisitsHistoryUseCase.execute(id);
  return sendSuccessResponse(res, 'Patient visit history retrieved successfully.', result, HTTP_STATUS.OK);
});

export const getVitalsHistoryController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await getVitalsHistoryUseCase.execute(id);
  return sendSuccessResponse(res, 'Patient vitals history retrieved successfully.', result, HTTP_STATUS.OK);
});

export const getRiskHistoryController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await getRiskHistoryUseCase.execute(id);
  return sendSuccessResponse(res, 'Patient health risk assessment history retrieved successfully.', result, HTTP_STATUS.OK);
});

export const getPrescriptionsHistoryController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await getPrescriptionsHistoryUseCase.execute(id);
  return sendSuccessResponse(res, 'Patient prescriptions registry retrieved successfully.', result, HTTP_STATUS.OK);
});

export const getDashboardSummaryController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await getDashboardSummaryUseCase.execute(id);
  return sendSuccessResponse(res, 'Patient dashboard summary retrieved successfully.', result, HTTP_STATUS.OK);
});

export const getCarePlansController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await getCarePlansUseCase.execute(id);
  return sendSuccessResponse(res, 'Patient care plans retrieved successfully.', result, HTTP_STATUS.OK);
});

export const getCaregiverLinksController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await getCaregiverLinksUseCase.execute(id);
  return sendSuccessResponse(res, 'Patient caregiver links retrieved successfully.', result, HTTP_STATUS.OK);
});


export const getActiveEmergencyController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await getActiveEmergencyUseCase.execute(id);
  return sendSuccessResponse(res, 'Active emergency retrieved successfully.', result, HTTP_STATUS.OK);
});


export const getClinicalOutcomesController = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await checkOwnership(req, id);
  const result = await getClinicalOutcomesUseCase.execute(id);
  return sendSuccessResponse(res, 'Clinical outcomes retrieved successfully.', result, HTTP_STATUS.OK);
});
