import nodemailer from 'nodemailer';
import { z } from 'zod';
import { AppError } from '../../../common/errors/AppError';
import { OtpPurpose } from './otp';

const purposes: Record<OtpPurpose, string> = {
  VERIFICATION: 'Verify your Healix email', PASSWORD_RESET: 'Reset your Healix password',
  MFA_LOGIN: 'Healix sign-in verification', MFA_ENABLE: 'Enable Healix two-step verification',
  MFA_DISABLE: 'Disable Healix two-step verification'
};
export class OtpDelivery {
  static options() {
    const host = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT || '465');
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.replace(/\s/g, '');
    const from = process.env.SMTP_FROM?.trim() || user;
    const localTest = process.env.NODE_ENV === 'test' && ['127.0.0.1', 'localhost', '::1'].includes(host);
    if (!z.string().email().safeParse(from).success || (!localTest && (!user || !pass)) || !Number.isInteger(port) || port < 1 || port > 65535) {
      throw new AppError('Email delivery is not configured. Contact the Healix administrator.', 503);
    }
    return { from: from!, transport: { host, port, secure: port === 465, requireTLS: !localTest && port !== 465,
      ...(localTest ? { ignoreTLS: true } : { auth: { user: user!, pass: pass! } }),
      connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
      tls: { minVersion: 'TLSv1.2' as const, rejectUnauthorized: true } } };
  }
  static assertConfigured() { this.options(); }
  static async send(email: string, code: string, purpose: OtpPurpose) {
    const options = this.options();
    const transporter = nodemailer.createTransport(options.transport);
    try {
      const result = await transporter.sendMail({
        from: { name: 'Healix', address: options.from }, to: email, subject: purposes[purpose],
        text: `${purposes[purpose]}\n\nYour verification code is: ${code}\n\nThis code expires in 10 minutes. Never share it. If you did not request this, ignore this email.`
      });
      if (!result.accepted?.length) throw new Error('Recipient rejected');
    } catch {
      // Do not expose SMTP credentials, responses, email contents or OTPs in logs/errors.
      throw new AppError('Email could not be sent. Please retry the verification or recovery request shortly.', 503);
    } finally { transporter.close(); }
  }
}
