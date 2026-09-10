import { Router } from 'express';
import {
  getProfileController,
  getActiveEmergencyController,
  searchUserByPhoneController,
  updateProfileController,
  addEmergencyContactController,
  deleteEmergencyContactController,
  getMedicalHistoryController,
  getClinicalOutcomesController,
  addChronicConditionController,
  addAllergyController,
  addMedicationController,
  createCareRequestController,
  getCareRequestController,
  cancelCareRequestController,
  rescheduleCareRequestController,
  getCareRequestsController,
  getVisitsHistoryController,
  getVitalsHistoryController,
  getRiskHistoryController,
  getPrescriptionsHistoryController,
  getDashboardSummaryController,
  getCarePlansController,
  getCaregiverLinksController
} from './patient.controller';
import { protect } from '../../../common/middleware/authMiddleware';
import { validateRequest } from '../../../common/middleware/validateRequest';
import {
  updateProfileSchema,
  emergencyContactSchema,
  chronicConditionSchema,
  allergySchema,
  medicationSchema,
  rescheduleRequestSchema
} from './patient.validation';
import { createCareRequestSchema } from '../../care/requests/schemas/care-request.schema';

const router = Router();

// Secure all patient module routes under authentication
router.use(protect as any);

// User Lookup operation by phone
router.get('/users/search-phone', searchUserByPhoneController);

// Patient Profile operations
router.get('/:id/profile', getProfileController);
router.get('/:id/emergency/active', getActiveEmergencyController);
router.put('/:id/profile', validateRequest({ body: updateProfileSchema }), updateProfileController);

// Emergency Contacts operations
router.post('/:id/emergency-contacts', validateRequest({ body: emergencyContactSchema }), addEmergencyContactController);
router.delete('/:id/emergency-contacts/:contactId', deleteEmergencyContactController);

// Medical History & Information operations
router.get('/:id/medical-history', getMedicalHistoryController);
router.get('/:id/clinical-outcomes', getClinicalOutcomesController);
router.post('/:id/conditions', validateRequest({ body: chronicConditionSchema }), addChronicConditionController);
router.post('/:id/allergies', validateRequest({ body: allergySchema }), addAllergyController);
router.post('/:id/medications', validateRequest({ body: medicationSchema }), addMedicationController);

// Healthcare Requests operations
router.post('/requests', validateRequest({ body: createCareRequestSchema }), createCareRequestController);
router.get('/requests', getCareRequestsController);
router.get('/requests/:id', getCareRequestController);
router.put('/requests/:id/cancel', cancelCareRequestController);
router.put('/requests/:id/reschedule', validateRequest({ body: rescheduleRequestSchema }), rescheduleCareRequestController);

// Clinical Monitoring & Records operations
router.get('/:id/visits', getVisitsHistoryController);
router.get('/:id/vitals-history', getVitalsHistoryController);
router.get('/:id/risk-history', getRiskHistoryController);
router.get('/:id/prescriptions', getPrescriptionsHistoryController);
router.get('/:id/dashboard', getDashboardSummaryController);
router.get('/:id/care-plans', getCarePlansController);
router.get('/:id/caregivers', getCaregiverLinksController);

export default router;
