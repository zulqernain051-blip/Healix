import { Router } from 'express';
import { protect } from '../../../common/middleware/authMiddleware';
import { validateRequest } from '../../../common/middleware/validateRequest';
import {
  updateNurseProfileSchema,
  qualificationSchema,
  specializationSchema,
  uploadDocumentSchema,
  reviewDocumentSchema,
  availabilitySlotSchema
} from './nurse.validation';
import {
  getNurseProfileController,
  updateNurseProfileController,
  addQualificationController,
  deleteQualificationController,
  addSpecializationController,
  getVerificationStatusController,
  uploadDocumentController,
  reviewDocumentController,
  getAvailabilitySlotsController,
  addAvailabilitySlotController,
  deleteAvailabilitySlotController,
  getEarningsController
} from './nurse.controller';

const router = Router();

// All nurse routes require authentication
router.use(protect);

// Nurse profile routes
router.get('/:id/profile', getNurseProfileController);
router.put('/:id/profile', validateRequest({ body: updateNurseProfileSchema }), updateNurseProfileController);

// Qualifications
router.post('/:id/qualifications', validateRequest({ body: qualificationSchema }), addQualificationController);
router.delete('/:id/qualifications/:qualId', deleteQualificationController);

// Specializations
router.post('/:id/specializations', validateRequest({ body: specializationSchema }), addSpecializationController);

// Verification documents
router.get('/:id/verification', getVerificationStatusController);
router.post('/:id/verification/upload', validateRequest({ body: uploadDocumentSchema }), uploadDocumentController);
router.put('/verification/review', validateRequest({ body: reviewDocumentSchema }), reviewDocumentController);

// Availability slots
router.get('/:id/availability', getAvailabilitySlotsController);
router.post('/:id/availability', validateRequest({ body: availabilitySlotSchema }), addAvailabilitySlotController);
router.delete('/:id/availability/:slotId', deleteAvailabilitySlotController);

// Earnings dashboard
router.get('/:id/earnings', getEarningsController);

export default router;
