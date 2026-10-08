import { prisma } from '../config/database';
import { AppError } from '../errors/AppError';
export const FEATURES=['ANALYTICS','CARE','MARKETPLACE','CONTRACTS','EMERGENCY','COMMUNICATION','PROFILE','SUPPORT'] as const;
export async function assertFeaturePermission(req:any,user:any) {
 const route=req.originalUrl.split('?')[0].replace(/^\/api\/v1\//,'');
 // Login, verification, security and administrator governance remain governed by
 // their own mandatory authorization checks, preventing administrative lockout.
 if (/^(auth|admin)(\/|$)/.test(route))return;
 let feature:string|undefined;
 if(/^analytics(\/|$)/.test(route))feature='ANALYTICS';
 else if(/^(marketplace|offers|pricing)(\/|$)/.test(route))feature='MARKETPLACE';
 else if(/^(contracts)(\/|$)/.test(route)||/\/contracts(\/|$)/.test(route))feature='CONTRACTS';
 else if(/^(dispatch|admissions|emergency|escalations|hospitals)(\/|$)/.test(route))feature='EMERGENCY';
 else if(/^(chat|threads|messages|notifications)(\/|$)/.test(route))feature='COMMUNICATION';
 else if(/^support(\/|$)/.test(route))feature='SUPPORT';
 else if(/^(visits|cases|care-plans|care-requests|clinical|doctors)(\/|$)/.test(route)||/\/(visits|requests|care-plans|compliance)(\/|$)/.test(route))feature='CARE';
 else if(/^(patients|nurses)(\/|$)/.test(route))feature='PROFILE';
 if(!feature)return;
 const operation=['GET','HEAD','OPTIONS'].includes(req.method)?'READ':'WRITE';
 const permission=await prisma.rolePermission.findUnique({where:{role_feature_operation:{role:user.role,feature,operation}}});
 if(permission && !permission.allowed)throw new AppError(`Your role currently has ${feature.toLowerCase()} ${operation.toLowerCase()} disabled`,403);
 // An allow entry never waives the route's role, ownership, verification or state checks.
}
