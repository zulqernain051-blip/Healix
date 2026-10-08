import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../../common/config/database';
import { asyncHandler } from '../../../common/middleware/asyncHandler';
import { AppError } from '../../../common/errors/AppError';
const router=Router();
router.put('/users/:id/profile',asyncHandler(async(req,res)=>{
 const input=z.object({fullName:z.string().trim().min(3).max(150).optional(),phone:z.string().trim().regex(/^((\+92)|(0092)|(92)|0)?3\d{9}$/).optional(),reason:z.string().trim().min(10).max(2000)}).strict().parse(req.body);
 if (!input.fullName && !input.phone) throw new AppError('Supply a name or phone change',400);
 const user=await prisma.$transaction(async tx=>{
  const previous=await tx.user.findUnique({where:{id:req.params.id}});
  if (!previous || previous.deletedAt)throw new AppError('Active user record not found',404);
  if(previous.role==='ADMIN' && previous.id!==(req as any).user.id)throw new AppError('Other administrators manage their own profile',403);
  const changed=await tx.user.update({where:{id:previous.id},data:{...(input.fullName?{fullName:input.fullName}:{}),...(input.phone?{phone:input.phone}:{})},select:{id:true,fullName:true,phone:true,email:true,role:true,status:true}});
  await tx.adminAuditLog.create({data:{adminId:(req as any).user.id,targetUserId:previous.id,entityType:'USER',entityId:previous.id,action:'USER_PROFILE_UPDATED',reason:input.reason,metadataJson:JSON.stringify({before:{fullName:previous.fullName,phone:previous.phone},after:{fullName:changed.fullName,phone:changed.phone}})}});
  return changed;
 });res.json({success:true,data:user});
}));
router.get('/payments',asyncHandler(async(req,res)=>{
 const {page,limit}=z.object({page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(100).default(20)}).parse(req.query);
 const [items,total]=await Promise.all([prisma.payment.findMany({skip:(page-1)*limit,take:limit,orderBy:{createdAt:'desc'},include:{request:{select:{id:true,patient:{select:{id:true,user:{select:{fullName:true}}}}}}}}),prisma.payment.count()]);
 res.json({success:true,data:{items,total,page,limit,recordBasis:'Stored application payment records; no bank reconciliation or payment gateway is performed by this view.'}});
}));
router.get('/operations/monitor',asyncHandler(async(_req,res)=>{
 const start=Date.now();await prisma.$queryRaw`SELECT 1`;const databaseResponseMs=Date.now()-start;
 const [pending,failed]=await Promise.all([prisma.eventOutbox.count({where:{status:'PENDING'}}),prisma.eventOutbox.count({where:{status:'FAILED'}})]);
 res.json({success:true,data:{checkedAt:new Date().toISOString(),uptimeSeconds:Math.floor(process.uptime()),databaseResponseMs,memoryRssMb:Math.round(process.memoryUsage().rss/1048576),pendingOutboxEvents:pending,failedOutboxEvents:failed,scope:'This API process. Uptime and memory are not cluster-wide metrics.'}});
}));
export default router;
