import { Router } from 'express';
import { protect } from '../../../common/middleware/authMiddleware';
import { ContractController } from './contract.controller';

const router = Router();

router.use(protect);

router.post('/contracts', ContractController.createContract);
router.get('/contracts/:id', ContractController.getContract);
router.put('/contracts/:id/approve', ContractController.approveContract);
router.put('/contracts/:id/reject', ContractController.rejectContract);
router.put('/contracts/:id/cancel', ContractController.cancelContract);
router.get('/contracts/:id/audit-trail', ContractController.getContractAuditTrail);

router.get('/patients/:patientId/contracts', ContractController.getPatientContracts);
router.get('/nurses/:nurseId/contracts', ContractController.getNurseContracts);

export default router;
