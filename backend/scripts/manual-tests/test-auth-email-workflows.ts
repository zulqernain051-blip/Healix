import { qaToken } from './qa-session';
import assert from 'node:assert/strict';
import net from 'node:net';
import { randomUUID, randomInt } from 'node:crypto';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { prisma } from '../../src/common/config/database';
import { config } from '../../src/common/config';
import { logger } from '../../src/common/utils/logger';
async function main() {
 require('../dev/jest-isolation.cjs');
 logger.silent=true; const users:string[]=[]; const messages:string[]=[]; const sockets=new Set<net.Socket>();
 const smtp=net.createServer(socket => { sockets.add(socket);socket.on('close',()=>sockets.delete(socket));socket.write('220 localhost Healix test SMTP\r\n');let buffer='',data=false,message='';socket.on('data',chunk=>{buffer+=chunk.toString();let end:number;while((end=buffer.indexOf('\r\n'))>=0){const line=buffer.slice(0,end);buffer=buffer.slice(end+2);if(data){if(line==='.') {data=false;messages.push(message);message='';socket.write('250 accepted\r\n');}else message+=line+'\n';}else if(/^EHLO|^HELO/.test(line))socket.write('250-localhost\r\n250 SIZE 100000\r\n');else if(line==='DATA'){data=true;socket.write('354 send message\r\n');}else if(line==='QUIT')socket.end('221 bye\r\n');else socket.write('250 ok\r\n');}});});
 await new Promise<void>(r=>smtp.listen(0,'127.0.0.1',r));process.env.NODE_ENV='test';process.env.SMTP_HOST='127.0.0.1';process.env.SMTP_PORT=String((smtp.address() as net.AddressInfo).port);process.env.SMTP_FROM='sender@healix-test.invalid';
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base=`http://127.0.0.1:${(server.address() as net.AddressInfo).port}/api/v1`;
 const request=async(path:string,body:any,status=200,token?:string,method='POST')=>{const res=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(method==='GET'?{}:{body:JSON.stringify(body)})});const j=await res.json();assert.equal(res.status,status,`${path}: ${j.message}`);return j.data;};
 const otp=()=>{const match=messages.at(-1)?.match(/verification code is: (\d{6})/);assert(match,'SMTP message contains code');return match[1];};
 const identity=()=>{const n=String(randomInt(100000000,999999999));const c=String(randomInt(1000000,9999999));return {email:`${randomUUID()}@healix-test.invalid`,phone:`+923${n}`,fullName:'Healix Auth QA',password:'AuthQa123!Secure',role:'PATIENT',cnic:`35202-${c}-1`};};
 try {
  const patient=identity();const registration=await request('/auth/register',patient,201);users.push(registration.userId);const verification=otp();
  await request('/auth/login',{emailOrPhone:patient.email,password:patient.password},403);
  await request('/auth/verify-otp',{emailOrPhone:patient.email,code:verification});await request('/auth/verify-otp',{emailOrPhone:patient.email,code:verification},400);
  let session=await request('/auth/login',{emailOrPhone:patient.email,password:patient.password});let token=session.tokens.accessToken;
  await request('/auth/mfa/enable',{},200,token);await request('/auth/mfa/verify-enable',{code:otp()},200,token);
  const challenge=await request('/auth/login',{emailOrPhone:patient.email,password:patient.password});assert.equal(challenge.mfaRequired,true);assert(!challenge.tokens);
  session=await request('/auth/verify-mfa-login',{emailOrPhone:patient.email,code:otp()});token=session.tokens.accessToken;
  await request('/auth/mfa/request-disable',{},200,token);await request('/auth/mfa/disable',{code:otp()},200,token);
  await prisma.otpCode.deleteMany({where:{userId:registration.userId}}); // Isolated fixture starts a new recovery scenario.
  await request('/auth/forgot-password',{emailOrPhone:patient.email});const reset=otp();
  await request('/auth/verify-otp',{emailOrPhone:patient.email,code:reset},400);
  await request('/auth/reset-password',{emailOrPhone:patient.email,code:reset,password:'ChangedQa123!Secure'});
  await request('/auth/refresh',{refreshToken:session.tokens.refreshToken},401);
  await request('/auth/me',{},401,token,'GET');
  session=await request('/auth/login',{emailOrPhone:patient.email,password:'ChangedQa123!Secure'});token=session.tokens.accessToken;
  await request('/auth/login',{emailOrPhone:patient.email,password:patient.password},401);
  const adminId=randomUUID();const admin=await prisma.user.create({data:{id:adminId,email:`${adminId}@healix-test.invalid`,phone:`qa-${adminId}`,fullName:'QA inviting administrator',passwordHash:'test-only',role:'ADMIN',status:'ACTIVE',admin:{create:{}}}});users.push(admin.id);const adminToken=await qaToken(admin);
  const invited=identity();await request('/admin/users/invite',{email:invited.email,role:'ADMIN'},403,token);const invite=await request('/admin/users/invite',{email:invited.email,role:'ADMIN'},200,adminToken);
  await request('/auth/register-invited',{...invited,email:'mismatch@healix-test.invalid',invitationToken:invite.token},400);
  const created=await request('/auth/register-invited',{...invited,invitationToken:invite.token},201);users.push(created.user.id);const invitationCode=otp();
  await request('/auth/login',{emailOrPhone:invited.email,password:invited.password},403);
  await request('/auth/register-invited',{...invited,invitationToken:invite.token},400);
  const verified=await request('/auth/verify-otp',{emailOrPhone:invited.email,code:invitationCode});assert.equal(verified.status,'ACTIVE');assert.equal((await request('/auth/login',{emailOrPhone:invited.email,password:invited.password})).user.role,'ADMIN');
  const logoutSession=await request('/auth/login',{emailOrPhone:patient.email,password:'ChangedQa123!Secure'});
  await request('/auth/logout',{refreshToken:logoutSession.tokens.refreshToken});
  await request('/auth/me',{},401,logoutSession.tokens.accessToken,'GET');
  for(const role of ['PATIENT','NURSE']) {
   const identityData=identity();const invitation=await request('/admin/users/invite',{email:identityData.email,role},200,adminToken);
   const createdRole=await request('/auth/register-invited',{...identityData,invitationToken:invitation.token,...(role==='NURSE'?{professionalId:'QA-'+randomUUID()}: {})},201);users.push(createdRole.user.id);
   assert.equal(createdRole.user.role,role);await request('/auth/login',{emailOrPhone:identityData.email,password:identityData.password},403);
   await request('/auth/verify-otp',{emailOrPhone:identityData.email,code:otp()});
   const signedIn=await request('/auth/login',{emailOrPhone:identityData.email,password:identityData.password});assert.equal(signedIn.user.role,role);
   if(role==='NURSE')await request('/nurses/'+signedIn.user.nurseId+'/visits',{},403,signedIn.tokens.accessToken,'GET');
  }
  console.log('PASS: real HTTP/PostgreSQL + local SMTP registration, email gates, OTP replay/purpose isolation, MFA enable/login/disable, password recovery/session revocation, and bound single-use administrator invitations. No real emails were sent.');
 } finally { await new Promise<void>(r=>server.close(()=>r()));await prisma.adminAuditLog.deleteMany({where:{adminId:{in:users}}});await prisma.invitation.deleteMany({where:{createdBy:{in:users}}});await prisma.user.deleteMany({where:{id:{in:users}}});for(const s of sockets)s.destroy();await new Promise<void>(r=>smtp.close(()=>r()));await prisma.$disconnect(); }
}
void main().catch(e=>{console.error(e);process.exitCode=1;});
