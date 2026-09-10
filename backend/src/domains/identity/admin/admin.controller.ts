import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import {
  updateUserStatusSchema, deleteUserSchema,
  rejectCredentialSchema, revokeCredentialSchema,
  removeOfferSchema, updateConfigSchema,
} from './admin.validation';

const ok = (res: Response, data: any, message = 'Success') =>
  res.json({ success: true, message, data });

const fail = (res: Response, err: any) => {
  const status = err.statusCode ?? 500;
  res.status(status).json({ success: false, message: err.message ?? 'Internal error' });
};

// ─── STATS ────────────────────────────────────────────────────────────────────
export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    ok(res, await AdminService.getDashboardStats());
  } catch (e) { fail(res, e); }
};

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────
export const createDoctor = async (req: Request, res: Response) => {
  try { ok(res, await AdminService.createDoctor(req.body, (req as any).user)); } catch (e) { fail(res, e); }
};

export const inviteUser = async (req: Request, res: Response) => {
  try { ok(res, await AdminService.inviteUser(req.body, (req as any).user.id)); } catch (e) { fail(res, e); }
};

export const createParamedic = async (req: Request, res: Response) => {
  try { ok(res, await AdminService.createParamedic(req.body, (req as any).user)); } catch (e) { fail(res, e); }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { search, role, status, page, limit } = req.query as any;
    ok(res, await AdminService.getUsers({ search, role, status, page: +page || 1, limit: +limit || 20 }));
  } catch (e) { fail(res, e); }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    ok(res, await AdminService.getUserById(req.params.id));
  } catch (e) { fail(res, e); }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateUserStatusSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: parsed.error.errors[0].message }); return; }
    ok(res, await AdminService.updateUserStatus(req.params.id, parsed.data.status, parsed.data.reason, (req as any).user));
  } catch (e) { fail(res, e); }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = deleteUserSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: parsed.error.errors[0].message }); return; }
    ok(res, await AdminService.softDeleteUser(req.params.id, parsed.data.reason, (req as any).user));
  } catch (e) { fail(res, e); }
};

// ─── NURSE CREDENTIALS ────────────────────────────────────────────────────────
export const getPendingNurses = async (_req: Request, res: Response) => {
  try { ok(res, await AdminService.getPendingNurses()); } catch (e) { fail(res, e); }
};

export const getAllNurses = async (req: Request, res: Response) => {
  try {
    ok(res, await AdminService.getAllNurses(req.query.status as string | undefined));
  } catch (e) { fail(res, e); }
};

export const approveNurse = async (req: Request, res: Response) => {
  try {
    ok(res, await AdminService.approveNurse(req.params.id, (req as any).user), 'Nurse approved successfully');
  } catch (e) { fail(res, e); }
};

export const rejectNurse = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = rejectCredentialSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: parsed.error.errors[0].message }); return; }
    ok(res, await AdminService.rejectNurse(req.params.id, parsed.data.reason, (req as any).user), 'Nurse rejected');
  } catch (e) { fail(res, e); }
};

export const revokeNurse = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = revokeCredentialSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: parsed.error.errors[0].message }); return; }
    ok(res, await AdminService.revokeNurse(req.params.id, parsed.data.reason, (req as any).user), 'Nurse revoked');
  } catch (e) { fail(res, e); }
};

// ─── DOCTOR CREDENTIALS ───────────────────────────────────────────────────────
export const getPendingDoctors = async (_req: Request, res: Response) => {
  try { ok(res, await AdminService.getPendingDoctors()); } catch (e) { fail(res, e); }
};

export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    ok(res, await AdminService.getAllDoctors(req.query.status as string | undefined));
  } catch (e) { fail(res, e); }
};

export const approveDoctor = async (req: Request, res: Response) => {
  try {
    ok(res, await AdminService.approveDoctor(req.params.id, (req as any).user), 'Doctor approved successfully');
  } catch (e) { fail(res, e); }
};

export const rejectDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = rejectCredentialSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: parsed.error.errors[0].message }); return; }
    ok(res, await AdminService.rejectDoctor(req.params.id, parsed.data.reason, (req as any).user), 'Doctor rejected');
  } catch (e) { fail(res, e); }
};

export const revokeDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = revokeCredentialSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: parsed.error.errors[0].message }); return; }
    ok(res, await AdminService.revokeDoctor(req.params.id, parsed.data.reason, (req as any).user), 'Doctor revoked');
  } catch (e) { fail(res, e); }
};

// ─── MARKETPLACE ──────────────────────────────────────────────────────────────
export const getOffers = async (req: Request, res: Response) => {
  try {
    ok(res, await AdminService.getAllOffers(req.query.status as string | undefined));
  } catch (e) { fail(res, e); }
};

export const removeOffer = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = removeOfferSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: parsed.error.errors[0].message }); return; }
    ok(res, await AdminService.removeOffer(req.params.id, parsed.data.reason, (req as any).user), 'Offer removed');
  } catch (e) { fail(res, e); }
};

// ─── PLATFORM CONFIG ──────────────────────────────────────────────────────────
export const getConfig = async (_req: Request, res: Response) => {
  try { ok(res, await AdminService.getAllConfig()); } catch (e) { fail(res, e); }
};

export const updateConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = updateConfigSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ success: false, message: parsed.error.errors[0].message }); return; }
    ok(res, await AdminService.updateConfig(req.params.key, parsed.data.value, parsed.data.changeReason, (req as any).user));
  } catch (e) { fail(res, e); }
};

export const getFeatureFlags = async (_req: Request, res: Response) => {
  try { ok(res, await AdminService.getFeatureFlags()); } catch (e) { fail(res, e); }
};

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { adminId, targetUserId, action, entityType, fromDate, toDate, page, limit } = req.query as any;
    ok(res, await AdminService.getAuditLogs({ adminId, targetUserId, action, entityType, fromDate, toDate, page: +page || 1, limit: +limit || 100 }));
  } catch (e) { fail(res, e); }
};

export const exportAuditLogs = async (req: Request, res: Response) => {
  try {
    const csv = await AdminService.exportAuditLogs(req.body ?? {});
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${Date.now()}.csv"`);
    res.send(csv);
  } catch (e) { fail(res, e); }
};


export const overrideCaseAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { caseId, doctorId, reason } = req.body;
    if (!caseId || !doctorId || !reason) {
      res.status(400).json({ success: false, message: 'caseId, doctorId, and reason are required' });
      return;
    }
    const adminId = (req as any).user.id;
    ok(res, await AdminService.overrideCaseAssignment(caseId, doctorId, adminId, reason), 'Case reassigned successfully');
  } catch (e) { fail(res, e); }
};


export const getClinicalCases = async (req: Request, res: Response) => {
  try {
    ok(res, await AdminService.getClinicalCases(req.query.status as string));
  } catch (e) { fail(res, e); }
};

// ─── Care Operations ──────────────────────────────────────────────────────────
export const getCareRequests = async (req: Request, res: Response) => {
  try { ok(res, await AdminService.getCareRequests(req.query)); } catch (e) { fail(res, e); }
};
export const getContracts = async (req: Request, res: Response) => {
  try { ok(res, await AdminService.getContracts(req.query)); } catch (e) { fail(res, e); }
};
export const getVisits = async (req: Request, res: Response) => {
  try { ok(res, await AdminService.getVisits(req.query)); } catch (e) { fail(res, e); }
};

// ─── Clinical Operations ──────────────────────────────────────────────────────
export const getUnassignedCases = async (_req: Request, res: Response) => {
  try { ok(res, await AdminService.getUnassignedCases()); } catch (e) { fail(res, e); }
};
export const getAssignedCases = async (_req: Request, res: Response) => {
  try { ok(res, await AdminService.getAssignedCases()); } catch (e) { fail(res, e); }
};
export const getHighRiskCases = async (_req: Request, res: Response) => {
  try { ok(res, await AdminService.getHighRiskCases()); } catch (e) { fail(res, e); }
};

// ─── Emergency Center ─────────────────────────────────────────────────────────
export const getEmergencies = async (req: Request, res: Response) => {
  try { ok(res, await AdminService.getEmergencies(req.query.slaStatus as string)); } catch (e) { fail(res, e); }
};
export const assignEmergencyDoctor = async (req: Request, res: Response) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) return fail(res, { statusCode: 400, message: 'doctorId required' });
    ok(res, await AdminService.assignEmergencyDoctor(req.params.id, doctorId, (req as any).user.id));
  } catch (e) { fail(res, e); }
};

// ─── Healthcare Network ───────────────────────────────────────────────────────
export const getHospitals = async (_req: Request, res: Response) => {
  try { ok(res, await AdminService.getHospitals()); } catch (e) { fail(res, e); }
};
export const createHospital = async (req: Request, res: Response) => {
  try { ok(res, await AdminService.createHospital(req.body)); } catch (e) { fail(res, e); }
};
export const updateHospital = async (req: Request, res: Response) => {
  try { ok(res, await AdminService.updateHospital(req.params.id, req.body)); } catch (e) { fail(res, e); }
};
export const deleteHospital = async (req: Request, res: Response) => {
  try { ok(res, await AdminService.deleteHospital(req.params.id)); } catch (e) { fail(res, e); }
};

// ─── Reviews / Moderation ─────────────────────────────────────────────────────
export const getNurseReviews = async (_req: Request, res: Response) => {
  try { ok(res, await AdminService.getNurseReviews()); } catch (e) { fail(res, e); }
};
export const moderateNurseReview = async (req: Request, res: Response) => {
  try {
    const { flagged } = req.body;
    ok(res, await AdminService.moderateNurseReview(req.params.id, flagged));
  } catch (e) { fail(res, e); }
};
export const deleteNurseReview = async (req: Request, res: Response) => {
  try { ok(res, await AdminService.deleteNurseReview(req.params.id)); } catch (e) { fail(res, e); }
};
