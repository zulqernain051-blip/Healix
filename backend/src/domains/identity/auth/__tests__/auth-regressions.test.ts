import { prisma } from '../../../../common/config/database';
import { AuthRepository } from '../auth.repository';
import { AuthService } from '../auth.service';
import { MfaLoginService } from '../mfa-login.service';
import { InvitationRepository } from '../invitation.repository';
import { RegisterInvitedUseCase } from '../usecases/register-invited.usecase';
import { registerSchema, registerInvitedSchema } from '../auth.validation';
import { hashOtp, OtpAttempts } from '../otp';
import { verifyGoogleIdToken } from '../google-id-token';

jest.mock('../../../../common/config', () => ({ config: { JWT_SECRET: 'test-secret-long-enough', JWT_EXPIRES_IN: '15m' } }));
jest.mock('../../../../common/utils/logger', () => ({ logger: { info: jest.fn() } }));
jest.mock('../otp-delivery', () => ({ OtpDelivery: { assertConfigured: jest.fn(), send: jest.fn().mockResolvedValue(undefined) } }));
jest.mock('../google-id-token', () => ({ verifyGoogleIdToken: jest.fn() }));
jest.mock('bcrypt', () => ({ hash: jest.fn().mockResolvedValue('password-hash'), compare: jest.fn().mockResolvedValue(true) }));
jest.mock('../../../../common/config/database', () => {
  const model = () => ({ findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), updateMany: jest.fn(), count: jest.fn() });
  const db: any = { user: model(), paramedic: model(), administrator: model(), doctor: model(), nurse: model(), otpCode: model(), session: model(), invitation: model() };
  db.$transaction = jest.fn((callback: any) => callback(db));
  return { prisma: db };
});

const db = prisma as any;
const user = { id: 'user-1', email: 'test@example.com', status: 'ACTIVE', role: 'PARAMEDIC', passwordHash: 'hash', mfaEnabled: true, paramedic: { id: 'paramedic-1' } };
const registration = { email: 'test@example.com', phone: '+923001234567', fullName: 'Test User', password: 'Test123!', role: 'PARAMEDIC' as const, cnic: '35202-1234567-1', certificationNumber: 'CERT-1' };
const invited = { ...registration, invitationToken: 'invitation-token', professionalId: 'CERT-1' };

beforeEach(() => {
  jest.clearAllMocks();
  db.user.findFirst.mockResolvedValue(user);
  db.user.findUnique.mockResolvedValue(user);
  db.user.create.mockResolvedValue(user);
  db.otpCode.count.mockResolvedValue(0);
  db.otpCode.updateMany.mockResolvedValue({ count: 1 });
  db.session.updateMany.mockResolvedValue({ count: 1 });
  db.invitation.updateMany.mockResolvedValue({ count: 1 });
  for (const purpose of ['VERIFICATION', 'PASSWORD_RESET', 'MFA_LOGIN', 'MFA_ENABLE', 'MFA_DISABLE'] as const) OtpAttempts.reset(user.id, purpose);
});

test('public paramedic registration requires a certification and creates its profile atomically', async () => {
  expect(registerSchema.safeParse({ ...registration, certificationNumber: undefined }).success).toBe(false);
  await AuthRepository.createUser(registration, 'hash');
  expect(db.paramedic.create).toHaveBeenCalledWith({ data: { userId: user.id, cnic: registration.cnic, certificationNumber: 'CERT-1' } });
});

test('auth lookups include the paramedic identity used by protected endpoints', async () => {
  await AuthRepository.findUserById(user.id);
  expect(db.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ include: expect.objectContaining({ paramedic: true }) }));
});

test('stored OTPs are purpose-bound hashes rather than raw reusable codes', async () => {
  await AuthRepository.createOtpCode(user.id, '123456', 'EMAIL', new Date(), 'MFA_LOGIN');
  expect(db.otpCode.create.mock.calls[0][0].data.code).toBe(hashOtp(user.id, '123456', 'MFA_LOGIN'));
  await AuthRepository.findActiveOtp(user.id, '123456', 'PASSWORD_RESET');
  expect(db.otpCode.findFirst.mock.calls[0][0].where.code).not.toBe(db.otpCode.create.mock.calls[0][0].data.code);
});

test('all OTP issuance paths enforce the request limit', async () => {
  db.otpCode.count.mockResolvedValueOnce(5);
  await expect(AuthRepository.createOtpCode(user.id, '123456', 'EMAIL', new Date(), 'PASSWORD_RESET')).rejects.toMatchObject({ statusCode: 429 });
  expect(db.otpCode.create).not.toHaveBeenCalled();
});

test('consuming an OTP twice rejects the second request', async () => {
  db.otpCode.updateMany.mockResolvedValueOnce({ count: 0 });
  await expect(AuthRepository.consumeOtp('otp-1')).rejects.toMatchObject({ statusCode: 400 });
});

test('reset rejects a concurrently consumed OTP before changing the password', async () => {
  db.otpCode.updateMany.mockResolvedValueOnce({ count: 0 });
  await expect(AuthRepository.resetPasswordTransaction(user.id, 'new-hash', 'otp-1')).rejects.toMatchObject({ statusCode: 400 });
  expect(db.user.update).not.toHaveBeenCalled();
});

test('refresh rotation rejects a previously claimed session without issuing another', async () => {
  db.session.updateMany.mockResolvedValueOnce({ count: 0 });
  await expect(AuthRepository.rotateSession('session-1', user.id, 'new-hash')).rejects.toMatchObject({ statusCode: 401 });
  expect(db.session.create).not.toHaveBeenCalled();
});

test('a suspended account cannot refresh an otherwise valid session', async () => {
  db.session.findUnique.mockResolvedValueOnce({ id: 'session-1', expiresAt: new Date(Date.now() + 60000), revoked: false, user: { ...user, status: 'SUSPENDED' } });
  await expect(AuthService.refresh('raw-token')).rejects.toMatchObject({ statusCode: 403 });
  expect(db.session.create).not.toHaveBeenCalled();
});

test('MFA login rejects an account suspended after requesting its code', async () => {
  db.user.findFirst.mockResolvedValueOnce({ ...user, status: 'SUSPENDED' });
  await expect(MfaLoginService.verifyMfaLogin(user.email, '123456', 'test', '127.0.0.1')).rejects.toMatchObject({ statusCode: 403 });
});

test('verification codes cannot reactivate a suspended patient', async () => {
  db.user.findFirst.mockResolvedValueOnce({ ...user, role: 'PATIENT', status: 'SUSPENDED' });
  await expect(AuthService.verifyOtp(user.email, '123456')).rejects.toMatchObject({ statusCode: 403 });
  expect(db.user.update).not.toHaveBeenCalled();
});

test('a new password-reset request resets the failed-attempt lock and issues the correct purpose', async () => {
  for (let i = 0; i < 5; i++) OtpAttempts.fail(user.id, 'PASSWORD_RESET');
  expect(() => OtpAttempts.check(user.id, 'PASSWORD_RESET')).toThrow();
  await AuthService.forgotPassword(user.email);
  expect(() => OtpAttempts.check(user.id, 'PASSWORD_RESET')).not.toThrow();
  const data = db.otpCode.create.mock.calls[0][0].data;
  expect(data.code).toMatch(/^[a-f0-9]{64}$/);
});

test('changing a password revokes all refresh sessions within the same transaction', async () => {
  await AuthService.changePassword(user.id, 'old', 'New123!');
  expect(db.user.update).toHaveBeenCalled();
  expect(db.session.updateMany).toHaveBeenCalledWith({ where: { userId: user.id, revoked: false }, data: { revoked: true } });
});

test('invitation validation requires the CNIC and professional credential', () => {
  expect(registerInvitedSchema.safeParse({ ...invited, cnic: undefined }).success).toBe(false);
  expect(registerInvitedSchema.safeParse(invited).success).toBe(true);
});

test('invited paramedic account is active without email verification or further approval', async () => {
  db.invitation.findUnique.mockResolvedValueOnce({ id: 'invite-1', email: 'TEST@example.com', role: 'PARAMEDIC', usedAt: null, expiresAt: new Date(Date.now() + 60000) });
  db.user.create.mockResolvedValueOnce({ ...user, status: 'ACTIVE' });
  const result = await AuthService.registerInvited(invited);
  expect(db.user.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'ACTIVE', emailVerificationRequired: false }) }));
  expect(db.paramedic.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ cnic: invited.cnic, certificationNumber: invited.professionalId, verificationStatus: 'VERIFIED' }) }));
  expect(result.user.status).toBe('ACTIVE');
  expect(result.emailVerificationRequired).toBe(false);
  expect(db.otpCode.create).not.toHaveBeenCalled();
  expect(db.session.create).not.toHaveBeenCalled();
});

test('invitation replay cannot create a second user', async () => {
  db.invitation.updateMany.mockResolvedValueOnce({ count: 0 });
  await expect(InvitationRepository.register('invite-1', 'PARAMEDIC', invited, 'hash')).rejects.toMatchObject({ statusCode: 400 });
  expect(db.user.create).not.toHaveBeenCalled();
});

test('expired invitations return an operational error', async () => {
  db.invitation.findUnique.mockResolvedValueOnce({ expiresAt: new Date(0) });
  await expect(RegisterInvitedUseCase.execute(invited)).rejects.toMatchObject({ statusCode: 400 });
});


test('unverified newly registered nurses cannot bypass email verification through onboarding login', async () => {
 db.user.findFirst.mockResolvedValueOnce({ ...user, role: 'NURSE', status: 'PENDING_VERIFICATION', emailVerificationRequired: true, emailVerifiedAt: null });
 await expect(AuthService.login({emailOrPhone:user.email,password:'password'})).rejects.toMatchObject({statusCode:403});
 expect(db.session.create).not.toHaveBeenCalled();
});
test('administrator registration requires a matching administrator invitation and creates its role profile', async () => {
 db.invitation.findUnique.mockResolvedValueOnce({ id: 'invite-admin', email:user.email, role:'ADMIN', usedAt:null, expiresAt:new Date(Date.now()+60000) });
 db.user.create.mockResolvedValueOnce({ ...user, role:'ADMIN',status:'PENDING_VERIFICATION' });
 const result = await AuthService.registerInvited({...invited,professionalId:undefined});
 expect(db.administrator.create).toHaveBeenCalledWith({data:{userId:user.id}});
 expect(result.user.role).toBe('ADMIN');
 expect(db.session.create).not.toHaveBeenCalled();
});
test('public registration cannot select the administrator role', () => {
 expect(registerSchema.safeParse({...registration,role:'ADMIN'}).success).toBe(false);
});
test('Google sign-in uses an existing active Healix account and issues a normal session', async () => {
 (verifyGoogleIdToken as jest.Mock).mockResolvedValueOnce({ email: user.email });
 db.user.findUnique.mockResolvedValueOnce({ ...user, mfaEnabled: false });
 db.session.create.mockResolvedValueOnce({ id: 'google-session' });
 const result = await AuthService.loginWithGoogle('google-credential');
 expect(db.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { email: user.email } }));
 expect(db.user.create).not.toHaveBeenCalled();
 expect(result.tokens.accessToken).toEqual(expect.any(String));
});
test('Google sign-in does not create an unprovisioned Healix account', async () => {
 (verifyGoogleIdToken as jest.Mock).mockResolvedValueOnce({ email: 'unknown@gmail.com' });
 db.user.findUnique.mockResolvedValueOnce(null);
 await expect(AuthService.loginWithGoogle('google-credential')).rejects.toMatchObject({ statusCode: 403 });
 expect(db.session.create).not.toHaveBeenCalled();
});
test.each(['DOCTOR', 'PARAMEDIC'])('public registration cannot select %s', role => {
 expect(registerSchema.safeParse({...registration,role}).success).toBe(false);
});
