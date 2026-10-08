import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../common/config/database';
import { protect } from '../../common/middleware/authMiddleware';
import { asyncHandler } from '../../common/middleware/asyncHandler';
import { AppError } from '../../common/errors/AppError';
const router=Router(); router.use(protect);
type Row=Record<string,string|number|null>;
type Report={role:string;period:{from:string;to:string;timezone:string};metrics:Row[];tables:{title:string;rows:Row[]}[];limitations:string[]};
const day=(date:Date)=>date.toISOString().slice(0,10);
const calendar=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value=>Number.isFinite(Date.parse(value)) && day(new Date(value))===value,'Use a valid calendar date');
const rangeSchema=z.object({from:calendar.optional(),to:calendar.optional()});
async function report(user:any,query:any):Promise<Report> {
 if (query.staffUserId !== undefined) {
  if (user.role !== 'ADMIN') throw new AppError('Only administrators can monitor another staff member.',403);
  const staffUserId=z.string().uuid().parse(query.staffUserId);
  const staff=await prisma.user.findUnique({where:{id:staffUserId},select:{id:true,role:true,fullName:true,deletedAt:true,nurse:{select:{id:true}},doctor:{select:{id:true}}}});
  if(!staff || staff.deletedAt || !['NURSE','DOCTOR'].includes(staff.role))throw new AppError('Nurse or doctor profile not found',404);
  const staffReport=await report(staff,{from:query.from,to:query.to});
  staffReport.tables.unshift({title:'Monitored staff member',rows:[{userId:staff.id,name:staff.fullName,role:staff.role}]});
  return staffReport;
 }
 const input=rangeSchema.parse(query),to=input.to || day(new Date()),from=input.from || day(new Date(Date.parse(to)-29*86400000));
 const start=new Date(from),end=new Date(Date.parse(to)+86400000);
 if (end<=start || end.getTime()-start.getTime()>366*86400000 || Date.parse(to)>Date.now()) throw new AppError('Select a past/current period of up to 366 days',400);
 const inRange={gte:start,lt:end},result:Report={role:user.role,period:{from,to,timezone:'UTC'},metrics:[],tables:[],limitations:[]};
 const metric=(label:string,value:number|null,unit='')=>result.metrics.push({label,value,unit});
 const table=(title:string,rows:Row[])=>result.tables.push({title,rows});
 const daily=(items:{date:Date;status:string}[])=>{
  const map=new Map<string,Row>(); for(let date=new Date(start);date<end;date.setUTCDate(date.getUTCDate()+1))map.set(day(date),{date:day(date),count:0});
  for(const item of items){const row=map.get(day(item.date));if(row)row.count=Number(row.count)+1;}return [...map.values()];
 };
 const cap=(count:number)=>{if(count>10000)throw new AppError('Report has more than 10000 records. Select a shorter period.',413);};
 if(user.role==='PATIENT' && user.patient?.id) {
  const patientId=user.patient.id;
  const [vitals,risks,plans]=await Promise.all([
   prisma.vitalsRecord.findMany({where:{visit:{request:{patientId}},recordedAt:inRange},orderBy:{recordedAt:'asc'},take:10001}),
   prisma.riskAssessment.findMany({where:{patientId,assessedAt:inRange},orderBy:{assessedAt:'asc'},take:10001}),
   prisma.carePlan.findMany({where:{patientId},select:{title:true,progress:true,status:true,version:true}})
  ]);cap(vitals.length);cap(risks.length);
  metric('Recorded vital observations',vitals.length);metric('Recorded risk assessments',risks.length);metric('Active care plans',plans.filter(p=>p.status==='ACTIVE').length);
  table('Vital trends',vitals.map(v=>({recordedAt:v.recordedAt.toISOString(),systolic:v.systolic,diastolic:v.diastolic,heartRate:v.heartRate,temperature:v.temperature,oxygenSaturation:v.oxygenSaturation})));
  table('Risk trends',risks.map(r=>({assessedAt:r.assessedAt.toISOString(),riskTier:r.riskTier,recordedScore:r.fusedScore})));
  table('Current care plans',plans.map(p=>({title:p.title,progress:p.progress,status:p.status,version:p.version})));
  result.limitations.push('Risk values are recorded application assessments. These reports do not diagnose conditions or validate the clinical risk model. Current plan counts are not limited to the selected period.');
 } else if(user.role==='NURSE' && user.nurse?.id) {
  const nurseId=user.nurse.id;
  const [visits,score,payments]=await Promise.all([
   prisma.visit.findMany({where:{nurseId,status:'COMPLETED',completedAt:inRange},select:{id:true,status:true,completedAt:true,completionApprovedAt:true},take:10001}),
   prisma.nurseScore.findUnique({where:{nurseId}}),
   prisma.payment.findMany({where:{status:'PAID',paidAt:inRange,request:{visits:{some:{nurseId,status:'COMPLETED'}}}},select:{id:true,amount:true,paidAt:true},take:10001})
  ]);cap(visits.length);cap(payments.length);
  metric('Completed visits in period',visits.length);metric('Patient-approved completed visits',visits.filter(v=>v.completionApprovedAt).length);
  metric('Recorded composite performance',score?.compositeScore ?? null,'/100');metric('Recorded request payment amounts',payments.reduce((sum,p)=>sum+p.amount,0),'PKR');
  table('Daily completed visits',daily(visits.filter(v=>v.completedAt).map(v=>({date:v.completedAt!,status:v.status}))));
  table('Associated paid request records',payments.map(p=>({paymentId:p.id,recordedPaidAt:p.paidAt!.toISOString(),amount:p.amount})));
  result.limitations.push('Paid request amounts are gross recorded records associated with completed visits, deduplicated by payment. They are not verified nurse settlements or net payouts. Unrecorded performance displays no data.');
 } else if(user.role==='DOCTOR' && user.doctor?.id) {
  const doctorId=user.doctor.id;
  const [cases,decisions,home]=await Promise.all([
   prisma.caseAssignment.findMany({where:{doctorId,OR:[{createdAt:inRange},{resolvedAt:inRange}]},select:{id:true,riskTier:true,status:true,createdAt:true,acceptedAt:true,resolvedAt:true},take:10001}),
   prisma.clinicalDecision.findMany({where:{doctorId,createdAt:inRange},select:{decision:true,createdAt:true},take:10001}),
   prisma.doctor_home_visits.findMany({where:{doctorId,status:'COMPLETED',scheduledAt:inRange},select:{id:true,scheduledAt:true,findings:true,outcomeNotes:true},take:10001})
  ]);cap(cases.length);cap(decisions.length);cap(home.length);
  const resolved=cases.filter(c=>c.resolvedAt && c.resolvedAt>=start && c.resolvedAt<end),responses=cases.filter(c=>c.acceptedAt && c.acceptedAt>=c.createdAt).map(c=>(c.acceptedAt!.getTime()-c.createdAt.getTime())/60000);
  metric('Cases resolved in period',resolved.length);metric('Mean recorded acceptance delay',responses.length?Math.round(responses.reduce((a,b)=>a+b,0)/responses.length*100)/100:null,'minutes');metric('Completed home visits scheduled in period',home.length);
  table('Case handling',cases.map(c=>({caseId:c.id,status:c.status,riskTier:c.riskTier,createdAt:c.createdAt.toISOString(),acceptedAt:c.acceptedAt?.toISOString() ?? null,resolvedAt:c.resolvedAt?.toISOString() ?? null})));
  const counts=new Map<string,number>();for(const d of decisions)counts.set(d.decision,(counts.get(d.decision)||0)+1);table('Recorded clinical decisions',[...counts].map(([decision,count])=>({decision,count})));
  table('Recorded home-visit outcomes',home.map(v=>({visitId:v.id,scheduledAt:v.scheduledAt.toISOString(),findings:v.findings,outcomeNotes:v.outcomeNotes})));
  result.limitations.push('Acceptance delay uses creation to recorded acceptance for cases created or resolved in the period. Home-visit outcomes use scheduled dates because completion timestamps are not recorded. Decision counts and recorded outcome notes do not measure treatment effectiveness.');
 } else if(user.role==='ADMIN') {
  const [active,visits,events,payments,refunds]=await Promise.all([
   prisma.user.count({where:{status:'ACTIVE',deletedAt:null}}),
   prisma.visit.findMany({where:{status:'COMPLETED',completedAt:inRange},select:{completedAt:true,status:true},take:10001}),
   prisma.emergencyEvent.findMany({where:{createdAt:inRange},select:{severity:true,status:true,createdAt:true},take:10001}),
   prisma.payment.findMany({where:{OR:[{createdAt:inRange},{paidAt:inRange},{commissionRecordedAt:inRange}]},select:{id:true,status:true,amount:true,paidAt:true,createdAt:true,commissionAmount:true,commissionRecordedAt:true,commissionReference:true},take:10001}),
   prisma.supportCase.findMany({where:{kind:'REFUND',status:'RECORDED',resolvedAt:inRange},select:{id:true,amount:true,resolvedAt:true,externalReference:true},take:10001})
  ]);cap(visits.length);cap(events.length);cap(payments.length);cap(refunds.length);
  const paid=payments.filter(p=>p.status==='PAID' && p.paidAt && p.paidAt>=start && p.paidAt<end);
  metric('Currently active accounts',active);metric('Completed visits in period',visits.length);metric('Emergency events created',events.length);metric('Recorded paid amounts in period',paid.reduce((sum,p)=>sum+p.amount,0),'PKR');const commission=payments.filter(p=>p.commissionAmount!==null && p.commissionRecordedAt && p.commissionRecordedAt>=start && p.commissionRecordedAt<end);metric('Recorded platform commission',commission.length?commission.reduce((sum,p)=>sum+p.commissionAmount!,0):null,'PKR');metric('Recorded external refunds',refunds.reduce((sum,r)=>sum+(r.amount || 0),0),'PKR');
  table('Daily completed visits',daily(visits.filter(v=>v.completedAt).map(v=>({date:v.completedAt!,status:v.status}))));
  const counts=new Map<string,number>();for(const e of events){const key=e.severity+' · '+e.status;counts.set(key,(counts.get(key)||0)+1);}table('Escalations',[...counts].map(([severityAndStatus,count])=>({severityAndStatus,count})));
  table('Recorded payments',payments.map(p=>({paymentId:p.id,status:p.status,amount:p.amount,createdAt:p.createdAt.toISOString(),paidAt:p.paidAt?.toISOString() ?? null,commissionAmount:p.commissionAmount,commissionRecordedAt:p.commissionRecordedAt?.toISOString() ?? null})));
  result.limitations.push('Active accounts are current ACTIVE statuses, not measured daily active usage. Payment reports show application records, not reconciled bank revenue. Commissions and external refunds appear only when separately recorded by an administrator with a reference and date. Missing commissions and unrecorded net settlements remain unknown; no fee is inferred from current settings. No bank transfer is performed by these reports.');
 } else throw new AppError('No analytics report is available for this role',403);
 return result;
}
const csvCell=(value:unknown)=>{let text=value==null?'':String(value);if(typeof value==='string' && /^\s*[=+\-@]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
router.get('/analytics/overview',asyncHandler(async(req,res)=>{res.setHeader('Cache-Control','private, no-store');res.json({success:true,data:await report((req as any).user,req.query)});}));
router.get('/analytics/report.csv',asyncHandler(async(req,res)=>{
 const data=await report((req as any).user,req.query),rows:unknown[][]=[['Healix report',data.role],['From',data.period.from,'To',data.period.to,'Timezone','UTC'],[],['Metric','Value','Unit'],...data.metrics.map(m=>[m.label,m.value,m.unit])];
 for(const table of data.tables){rows.push([], [table.title]);if(table.rows.length){const columns=Object.keys(table.rows[0]);rows.push(columns,...table.rows.map(row=>columns.map(key=>row[key])));}else rows.push(['No recorded data']);}
 rows.push([],['Report limits'],...data.limitations.map(limit=>[limit]));
 res.setHeader('Cache-Control','private, no-store');res.type('text/csv');res.attachment('Healix_Report.csv');res.send('\uFEFF'+rows.map(row=>row.map(csvCell).join(',')).join('\r\n'));
}));
export default router;
