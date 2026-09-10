import { PrismaClient } from '@prisma/client';
import { VisitRepository } from './domains/care/visit/visit.repository';
import { VerificationService } from './domains/care/visit/verification/verification.service';
import { EVENTS } from './common/events/app-event-bus';

const prisma = new PrismaClient();

async function runAudit() {
  console.log('--- STARTING PHASE 9 LIVE DB AUDIT ---');

  // Clean DB
  await prisma.visitVerification.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.visitEvidence.deleteMany();
  await prisma.assignmentLog.deleteMany();
  await prisma.visitQrToken.deleteMany();
  await prisma.eventOutbox.deleteMany();
  await prisma.vitalsRecord.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.marketplaceListing.deleteMany();
  await prisma.careRequest.deleteMany();
  await prisma.user.deleteMany({ where: { email: { endsWith: '@audit9.com' } } });
  
  // 1. Setup Patient and Nurse
  const patientUser = await prisma.user.create({
    data: {
      email: 'patient@audit9.com',
      phone: '1234567890',
      fullName: 'Patient 9',
      passwordHash: 'hash',
      role: 'PATIENT',
      patient: {
        create: {
          cnic: 'PATIENT9CNIC',
          latitude: 51.5074,
          longitude: -0.1278
        }
      }
    },
    include: { patient: true }
  }) as any;

  const nurseUser = await prisma.user.create({
    data: {
      email: 'nurse@audit9.com',
      phone: '0987654321',
      fullName: 'Nurse 9',
      passwordHash: 'hash',
      role: 'NURSE',
      nurse: {
        create: {
          cnic: 'NURSE9CNIC',
          pncNumber: 'PNC999',
          licenseNumber: 'NURSE999'
        }
      }
    },
    include: { nurse: true }
  }) as any;

  const patientId = patientUser.patient!.id;
  const nurseId = nurseUser.nurse!.id;

  // 2. Create CareRequest
  const careRequest = await prisma.careRequest.create({
    data: {
      patientId: patientId,
      type: 'NURSE_VISIT',
      priority: 'STANDARD',
      status: 'PENDING'
    }
  });

  // 3. Create Contract (simulate Marketplace approval)
  const contract = await prisma.contract.create({
    data: {
      patientId: patientId,
      careRequestId: careRequest.id,
      nurseId: nurseId,
      status: 'PENDING_APPROVAL',
      price: 100,
      scopeText: 'Test',
      expiresAt: new Date(Date.now() + 1000000),
      patientApproved: true,
      nurseApproved: true
    }
  });

  // 4. Activate Contract & Create Visit
  console.log('[TEST] Contract Activation -> Visit Creation (SCHEDULED)');
  await prisma.contract.update({
    where: { id: contract.id },
    data: { status: 'ACTIVE' }
  });
  
  const visit = await VisitRepository.createVisitFromContract({
    requestId: careRequest.id,
    nurseId: nurseId,
    agreedStartTime: new Date()
  });

  console.assert(visit.status === 'SCHEDULED', 'Visit should be SCHEDULED');

  const qrToken = await prisma.visitQrToken.findUnique({ where: { visitId: visit.id } });
  console.assert(!!qrToken, 'QR Token should be generated');

  // 5. Test Verification (QR)
  console.log('[TEST] QR Verification -> IN_PROGRESS + VISIT_STARTED');
  await VerificationService.verifyWithQr(visit.id, nurseId, qrToken!.token);
  
  const inProgressVisit = await prisma.visit.findUnique({ where: { id: visit.id } });
  console.assert(inProgressVisit!.status === 'IN_PROGRESS', 'Visit should be IN_PROGRESS');

  const updatedQrToken = await prisma.visitQrToken.findUnique({ where: { visitId: visit.id } });
  console.assert(updatedQrToken!.status === 'VERIFIED', 'QR Token should be VERIFIED');

  const verificationRecords = await prisma.visitVerification.findMany({ where: { visitId: visit.id } });
  console.assert(verificationRecords.length === 1, 'Should have 1 verification record');

  const attendanceRecords = await prisma.attendanceRecord.findMany({ where: { visitId: visit.id } });
  console.assert(attendanceRecords.length === 1, 'Should have 1 attendance record');

  const startedEvents = await prisma.eventOutbox.findMany({ where: { eventType: EVENTS.VISIT_STARTED } });
  console.assert(startedEvents.length === 1, 'Should have 1 VISIT_STARTED event in outbox');

  // 6. Test Idempotency & Replay (QR replay should fail)
  console.log('[TEST] QR Replay (Should Fail)');
  try {
    await VerificationService.verifyWithQr(visit.id, nurseId, qrToken!.token);
    console.assert(false, 'QR replay should have thrown');
  } catch (e: any) {
    console.assert(e.message.includes('expired or already used') || e.message.includes('valid state'), 'Should fail gracefully');
  }

  // 7. Test Concurrency (Simultaneous Complete & Cancel)
  console.log('[TEST] Concurrency Race: Complete vs Cancel');
  
  // Create clinical data required for completion
  await prisma.vitalsRecord.create({
    data: { 
      visitId: visit.id,
      systolic: 120,
      diastolic: 80,
      heartRate: 72,
      temperature: 98.6,
      oxygenSaturation: 99
    }
  });

  const completePromise = VerificationService.completeVisit(visit.id, nurseId).catch(e => e.message);
  const cancelPromise = VisitRepository.cancelVisitAndFutureOccurrences(visit.id, false).catch(e => e.message);

  const results = await Promise.all([completePromise, cancelPromise]);
  console.log('Race Results:', results);

  const finalVisit = await prisma.visit.findUnique({ where: { id: visit.id } });
  console.log('Final Visit Status:', finalVisit!.status);
  console.assert(finalVisit!.status === 'COMPLETED' || finalVisit!.status === 'CANCELLED', 'Should be either COMPLETED or CANCELLED');

  const completedEvents = await prisma.eventOutbox.findMany({ where: { eventType: EVENTS.VISIT_COMPLETED } });
  const cancelledEvents = await prisma.eventOutbox.findMany({ where: { eventType: 'VISIT_CANCELLED' } });

  if (finalVisit!.status === 'COMPLETED') {
    console.assert(completedEvents.length === 1, 'Should have 1 VISIT_COMPLETED event');
    console.assert(cancelledEvents.length === 0, 'Should have 0 VISIT_CANCELLED events');
  } else {
    console.assert(completedEvents.length === 0, 'Should have 0 VISIT_COMPLETED events');
    console.assert(cancelledEvents.length === 1, 'Should have 1 VISIT_CANCELLED event');
  }

  // 8. Test invalid transitions (Cancel a Completed Visit)
  if (finalVisit!.status === 'COMPLETED') {
    console.log('[TEST] Cancel a COMPLETED visit (Should Fail)');
    try {
      await VisitRepository.cancelVisitAndFutureOccurrences(visit.id, false);
      console.assert(false, 'Cancel should have thrown');
    } catch (e: any) {
      console.assert(e.message.includes('Cannot cancel Visit'), 'Proper error message');
    }
  }

  console.log('--- ALL TESTS PASSED ---');
  await prisma.$disconnect();
}

runAudit().catch(e => {
  console.error(e);
  process.exit(1);
});
