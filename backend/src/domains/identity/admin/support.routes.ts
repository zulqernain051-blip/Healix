import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../../common/config/database';
import { protect,restrictTo } from '../../../common/middleware/authMiddleware';
import { asyncHandler } from '../../../common/middleware/asyncHandler';
import { AppError } from '../../../common/errors/AppError';
import { FEATURES } from '../../../common/middleware/feature-permissions';
const router=Router();router.use(protect);
const money=z.number().finite().positive().max(10000000).refine(value=>Math.abs(value*100-Math.round(value*100))<0.00001,'Use at most two decimal places');
router.get('/support/cases',asyncHandler(async(req,res)=>{
 const actor=(req as any).user;
 if(!['PATIENT','ADMIN'].includes(actor.role))throw new AppError('Patient or administrator access required',403);
 const {page,limit}=z.object({page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(100).default(20)}).parse(req.query);
 const where=actor.role==='ADMIN'?{}:{patientId:actor.patient.id};
 const [items,total]=await Promise.all([prisma.supportCase.findMany({where,skip:(page-1)*limit,take:limit,orderBy:{createdAt:'desc'}}),prisma.supportCase.count({where})]);res.json({success:true,data:{items,total,page,limit}});
}));
router.post('/support/cases',restrictTo('PATIENT'),asyncHandler(async(req,res)=>{
 const actor=(req as any).user,patientId=actor.patient.id;
 const input=z.object({requestKey:z.string().uuid(),kind:z.enum(['DISPUTE','REFUND']),paymentId:z.string().uuid().optional(),visitId:z.string().uuid().optional(),amount:money.optional(),reason:z.string().trim().min(10).max(5000)}).strict().parse(req.body);
 if(!input.paymentId && !input.visitId)throw new AppError('Select a payment or visit',400);
 if(input.kind==='REFUND' && (!input.paymentId || !input.amount))throw new AppError('Select a paid payment and requested refund amount',400);
 const item=await prisma.$transaction(async tx=>{
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${input.requestKey}))`;
  const existing=await tx.supportCase.findUnique({where:{requestKey:input.requestKey}});
  if(existing){if(existing.patientId!==patientId || existing.kind!==input.kind || existing.reason!==input.reason || existing.paymentId!==(input.paymentId ?? null) || existing.visitId!==(input.visitId ?? null) || existing.amount!==(input.amount ?? null))throw new AppError('Request identifier was already used with different content',409);return existing;}
  if(input.visitId && !await tx.visit.findFirst({where:{id:input.visitId,request:{patientId}}}))throw new AppError('Visit does not belong to this account',403);
  if(input.paymentId){
   await tx.$queryRaw`SELECT id FROM payments WHERE id = ${input.paymentId} FOR UPDATE`;
   const payment=await tx.payment.findFirst({where:{id:input.paymentId,request:{patientId}}});if(!payment)throw new AppError('Payment does not belong to this account',403);
   if(input.kind==='REFUND'){
    if(payment.status!=='PAID')throw new AppError('Only a recorded paid payment can have a refund requested',409);
    const reserved=await tx.supportCase.aggregate({where:{paymentId:payment.id,kind:'REFUND',status:{in:['OPEN','IN_REVIEW','APPROVED','RECORDED']}},_sum:{amount:true}});
    if((reserved._sum.amount || 0)+input.amount!>payment.amount+0.00001)throw new AppError('Refund requests exceed the recorded paid amount',409);
   }
  }
  return tx.supportCase.create({data:{...input,patientId,createdBy:actor.id}});
 });res.status(201).json({success:true,data:item});
}));
router.put('/admin/support/cases/:id',restrictTo('ADMIN'),asyncHandler(async(req,res)=>{
 const input=z.object({status:z.enum(['IN_REVIEW','APPROVED','REJECTED','RESOLVED','RECORDED']),notes:z.string().trim().min(10).max(5000),externalReference:z.string().trim().min(5).max(200).optional(),completedAt:z.string().datetime().optional()}).strict().parse(req.body);
 const actor=(req as any).user,item=await prisma.$transaction(async tx=>{
  await tx.$queryRaw`SELECT id FROM support_cases WHERE id = ${req.params.id} FOR UPDATE`;
  const previous=await tx.supportCase.findUnique({where:{id:req.params.id}});if(!previous)throw new AppError('Support case not found',404);
  if(previous.status===input.status && previous.decisionNotes===input.notes && previous.externalReference===(input.externalReference || null))return previous;
  if(['REJECTED','RESOLVED','RECORDED'].includes(previous.status))throw new AppError('This support case is closed',409);
  const allowed=previous.kind==='REFUND'? (previous.status==='APPROVED'?['RECORDED','REJECTED']:['IN_REVIEW','APPROVED','REJECTED']) : ['IN_REVIEW','RESOLVED','REJECTED'];
  if(!allowed.includes(input.status))throw new AppError('Invalid support case transition',409);
  if(input.status==='RECORDED' && (!input.externalReference || !input.completedAt || Date.parse(input.completedAt)>Date.now()))throw new AppError('Record a valid past/current completion time and external refund reference',400);
  if(previous.kind==='REFUND') {
    const payment=previous.paymentId ? await tx.payment.findUnique({where:{id:previous.paymentId}}) : null;
    if(!payment || payment.status!=='PAID')throw new AppError('The original recorded paid payment is required',409);
    if(input.status==='RECORDED') {
      if(payment.paidAt && Date.parse(input.completedAt!)<payment.paidAt.getTime())throw new AppError('Refund completion cannot precede the recorded payment',400);
      if(await tx.supportCase.findFirst({where:{id:{not:previous.id},kind:'REFUND',paymentId:payment.id,status:'RECORDED',externalReference:input.externalReference}}))throw new AppError('This refund reference is already recorded for the payment',409);
    }
  }
  const updated=await tx.supportCase.update({where:{id:previous.id},data:{status:input.status,decisionNotes:input.notes,handledBy:actor.id,externalReference:input.externalReference || null,resolvedAt:input.status==='RECORDED'?new Date(input.completedAt!):['RESOLVED','REJECTED'].includes(input.status)?new Date():null}});
  await tx.adminAuditLog.create({data:{adminId:actor.id,entityType:'SUPPORT_CASE',entityId:updated.id,action:'SUPPORT_CASE_UPDATED',reason:input.notes,metadataJson:JSON.stringify({beforeStatus:previous.status,afterStatus:updated.status,externalReference:updated.externalReference})}});return updated;
 });res.json({success:true,data:item});
}));
router.put('/admin/payments/:id/commission',restrictTo('ADMIN'),asyncHandler(async(req,res)=>{
 const input=z.object({amount:money.or(z.literal(0)),reference:z.string().trim().min(5).max(200),recordedAt:z.string().datetime(),reason:z.string().trim().min(10).max(2000)}).strict().parse(req.body);
 if(Date.parse(input.recordedAt)>Date.now())throw new AppError('Use a past/current settlement date',400);
 const result=await prisma.$transaction(async tx=>{
  await tx.$queryRaw`SELECT id FROM payments WHERE id = ${req.params.id} FOR UPDATE`;
  const payment=await tx.payment.findUnique({where:{id:req.params.id}});if(!payment || payment.status!=='PAID')throw new AppError('A recorded paid payment is required',409);
  if(payment.paidAt && Date.parse(input.recordedAt)<payment.paidAt.getTime())throw new AppError('Commission settlement cannot precede the recorded payment',400);
  if(input.amount>payment.amount)throw new AppError('Commission cannot exceed the recorded payment',400);
  if(payment.commissionAmount!==null){if(payment.commissionAmount===input.amount && payment.commissionReference===input.reference && payment.commissionRecordedAt?.getTime()===Date.parse(input.recordedAt))return payment;throw new AppError('Commission is already recorded; preserve its audit record',409);}
  const updated=await tx.payment.update({where:{id:payment.id},data:{commissionAmount:input.amount,commissionReference:input.reference,commissionRecordedAt:new Date(input.recordedAt)}});
  await tx.adminAuditLog.create({data:{adminId:(req as any).user.id,entityType:'PAYMENT',entityId:payment.id,action:'COMMISSION_RECORDED',reason:input.reason,metadataJson:JSON.stringify({amount:input.amount,reference:input.reference})}});return updated;
 });res.json({success:true,data:result});
}));
router.get('/admin/permissions',restrictTo('ADMIN'),asyncHandler(async(_req,res)=>{res.json({success:true,data:{roles:['PATIENT','NURSE','DOCTOR','PARAMEDIC','ADMIN'],features:FEATURES,overrides:await prisma.rolePermission.findMany(),rule:'Missing entries retain built-in access. Allow does not override ownership, role, verification or lifecycle checks.'}});}));
router.put('/admin/permissions',restrictTo('ADMIN'),asyncHandler(async(req,res)=>{
 const input=z.object({role:z.enum(['PATIENT','NURSE','DOCTOR','PARAMEDIC','ADMIN']),feature:z.enum(FEATURES),operation:z.enum(['READ','WRITE']),allowed:z.boolean(),reason:z.string().trim().min(10).max(2000)}).strict().parse(req.body);
 const item=await prisma.$transaction(async tx=>{const {reason,...values}=input;const changed=await tx.rolePermission.upsert({where:{role_feature_operation:{role:input.role,feature:input.feature,operation:input.operation}},create:{...values,updatedBy:(req as any).user.id},update:{allowed:input.allowed,updatedBy:(req as any).user.id}});await tx.adminAuditLog.create({data:{adminId:(req as any).user.id,entityType:'ROLE_PERMISSION',entityId:[input.role,input.feature,input.operation].join(':'),action:'ROLE_PERMISSION_UPDATED',reason,metadataJson:JSON.stringify(values)}});return changed;});res.json({success:true,data:item});
}));
export default router;
