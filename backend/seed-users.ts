// @ts-nocheck
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing old users and related records...');
  
  const tables = ['session', 'otpCode', 'chatMessage', 'chatThread', 'visit', 'serviceRequest', 'marketplaceBid', 'contract', 'clinicalOutcome', 'caregiverLink', 'ambulanceDispatch', 'assignmentLog', 'prescription', 'patient', 'nurse', 'doctor', 'paramedic', 'administrator', 'user'];
  
  for (const table of tables) {
    try {
      await (prisma as any)[table].deleteMany();
    } catch (e) {
      // Ignore
    }
  }
  
  console.log('Old users deleted.');

  const password = await bcrypt.hash('abc123$%', 12);

  const createAccounts = async (role: Role, prefix: string, count: number) => {
    for (let i = 1; i <= count; i++) {
      const email = `${prefix}${i}@gmail.com`;
      const user = await prisma.user.create({
        data: {
          email,
          phone: `+923000000${role === 'PATIENT' ? '1' : role === 'NURSE' ? '2' : role === 'DOCTOR' ? '3' : role === 'PARAMEDIC' ? '4' : '5'}${i.toString().padStart(2, '0')}`,
          fullName: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} ${i}`,
          passwordHash: password,
          role: role,
          status: 'ACTIVE',
        }
      });
      
      const dummyCnic = `42201-${Math.floor(Math.random() * 9000000) + 1000000}-${i}`;
      
      if (role === 'PATIENT') await prisma.patient.create({ data: { userId: user.id, cnic: dummyCnic } });
      if (role === 'NURSE') await prisma.nurse.create({ data: { userId: user.id, verificationStatus: 'APPROVED', cnic: dummyCnic, pncNumber: `PNC-${i}` } });
      if (role === 'DOCTOR') await prisma.doctor.create({ data: { userId: user.id, verificationStatus: 'APPROVED', cnic: dummyCnic, pmdcNumber: `PMDC-${i}` } });
      if (role === 'PARAMEDIC') await prisma.paramedic.create({ data: { userId: user.id, cnic: dummyCnic, certificationNumber: `CERT-${i}`, verificationStatus: 'APPROVED' } });
      if (role === 'ADMIN') await prisma.administrator.create({ data: { userId: user.id } });
      
      console.log(`Created ${role}: ${email}`);
    }
  };

  await createAccounts('PATIENT', 'patient', 3);
  await createAccounts('NURSE', 'nurse', 3);
  await createAccounts('DOCTOR', 'doctor', 3);
  await createAccounts('PARAMEDIC', 'paramedic', 3);
  
  // Create 1 admin manually
  const adminEmail = 'admin1@gmail.com';
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      phone: '+923000000501',
      fullName: 'Admin 1',
      passwordHash: password,
      role: 'ADMIN',
      status: 'ACTIVE',
    }
  });
  await prisma.administrator.create({ data: { userId: adminUser.id } });
  console.log(`Created ADMIN: ${adminEmail}`);
  
  console.log('Seeding complete!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => {
  prisma.$disconnect();
});
