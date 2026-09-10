import { Request, Response } from 'express';
import { ContractService } from './contract.service';
import { AppError } from '../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../common/constants/index';
import {
  createContractSchema,
  rejectContractSchema,
  cancelContractSchema
} from './contract.validation';


const checkPatientOwnership = (req: Request, targetPatientId: string) => {
  const user = (req as any).user;
  if (user.role === 'ADMIN') return;
  if (user.role === 'PATIENT' && user.patient?.id === targetPatientId) return;
  throw new AppError('Access forbidden. You do not own this resource.', HTTP_STATUS.FORBIDDEN);
};

const checkNurseOwnership = (req: Request, targetNurseId: string) => {
  const user = (req as any).user;
  if (user.role === 'ADMIN') return;
  if (user.role === 'NURSE' && user.nurse?.id === targetNurseId) return;
  throw new AppError('Access forbidden. You do not own this resource.', HTTP_STATUS.FORBIDDEN);
};

export class ContractController {
  public static async createContract(req: Request, res: Response) {
    try {
      const payload = createContractSchema.parse(req.body);
      const user = (req as any).user;
      const contract = await ContractService.createContract(payload, user);
      res.json({ success: true, data: contract });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getContract(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const contract = await ContractService.getContract(id);
      if (!contract) {
        res.status(404).json({ success: false, message: 'Contract not found' });
        return;
      }
      
      const user = (req as any).user;
      if (user.role === 'PATIENT') {
        checkPatientOwnership(req, contract.patientId);
      } else if (user.role === 'NURSE') {
        checkNurseOwnership(req, contract.nurseId);
      } else {
        res.status(403).json({ success: false, message: 'Forbidden' });
        return;
      }
      
      res.json({ success: true, data: contract });
    } catch (err: any) {
      const status = err instanceof AppError ? err.statusCode : 500;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  public static async getPatientContracts(req: Request, res: Response) {
    try {
      const { patientId } = req.params;
      checkPatientOwnership(req, patientId);
      const contracts = await ContractService.getPatientContracts(patientId);
      res.json({ success: true, data: contracts });
    } catch (err: any) {
      const status = err instanceof AppError ? err.statusCode : 500;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  public static async getNurseContracts(req: Request, res: Response) {
    try {
      const { nurseId } = req.params;
      checkNurseOwnership(req, nurseId);
      const contracts = await ContractService.getNurseContracts(nurseId);
      res.json({ success: true, data: contracts });
    } catch (err: any) {
      const status = err instanceof AppError ? err.statusCode : 500;
      res.status(status).json({ success: false, message: err.message });
    }
  }

  public static async approveContract(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const contract = await ContractService.approveContract(id, user);
      res.json({ success: true, data: contract });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async rejectContract(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = rejectContractSchema.parse(req.body);
      const user = (req as any).user;
      const contract = await ContractService.rejectContract(id, reason, user);
      res.json({ success: true, data: contract });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async cancelContract(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = cancelContractSchema.parse(req.body);
      const user = (req as any).user;
      const contract = await ContractService.cancelContract(id, reason || 'Cancelled', user);
      res.json({ success: true, data: contract });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  public static async getContractAuditTrail(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = (req as any).user;
      const logs = await ContractService.getContractAuditTrail(id, user);
      res.json({ success: true, data: logs });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
