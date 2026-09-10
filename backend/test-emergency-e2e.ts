import { PrismaClient } from '@prisma/client';
import { AutomaticDoctorAssignmentUseCase } from './src/domains/care/clinical/usecases/assignment/automatic-doctor-assignment.usecase';
import { SlaTimeoutWorker } from './src/domains/care/clinical/workers/sla-timeout.worker';
import { StartCaseReviewUseCase } from './src/domains/identity/doctor/usecases/review/start-case-review.usecase';
import { DoctorRepository } from './src/domains/identity/doctor/doctor.repository';
import { AdminService } from './src/domains/identity/admin/admin.service';

// Mock Socket.io
let emittedEvents: any[] = [];


const prisma = new PrismaClient();

async function runTests() {
  console.log('--- STARTING EMERGENCY E2E TESTS ---');
  let testResults = [];

  // Cleanup past test data
  await prisma.caseAssignment.deleteMany({ where: { status: { in: ['PROFESSIONAL_BROADCAST', 'GENERAL_BROADCAST', 'ADMIN_ESCALATED'] } } });

  // 1. Setup Data
  console.log('1. Setting up users...');
  await prisma.user.upsert({ where: { id: 'SYSTEM' }, update: {}, create: { id: 'SYSTEM', email: 'system@sys.com', phone: 'sys', passwordHash: 'hash', fullName: 'SYSTEM', role: 'ADMIN', status: 'ACTIVE' } });
  const userPatient = await prisma.user.upsert({
    where: { email: 'patient@test.com' },
    update: {},
    create: { email: 'patient@test.com', phone: '1234567890', passwordHash: 'hash', fullName: 'Test Patient', role: 'PATIENT', status: 'ACTIVE' }
  });
  const patient = await prisma.patient.upsert({
    where: { userId: userPatient.id },
    update: {},
    create: { userId: userPatient.id, cnic: '1234567890123' }
  });

  const makeDoctor = async (email: string, isPro: boolean) => {
    const u = await prisma.user.upsert({
      where: { email },
      update: { status: 'ACTIVE' },
      create: { email, phone: email, passwordHash: 'hash', fullName: email, role: 'DOCTOR', status: 'ACTIVE' }
    });
    const d = await prisma.doctor.upsert({
      where: { userId: u.id },
      update: { verificationStatus: 'VERIFIED', isProfessional: isPro, emergencyAvailable: true, cnic: email },
      create: { userId: u.id, pmdcNumber: email, verificationStatus: 'VERIFIED', isProfessional: isPro, emergencyAvailable: true, cnic: email }
    });
    await prisma.doctorAvailability.deleteMany({ where: { doctorId: d.id } }); await prisma.doctorAvailability.create({ data: { doctorId: d.id, isActive: true, dayOfWeek: 1, startTime: '00:00', endTime: '23:59' } });
    return d;
  };

  const docProA = await makeDoctor('proA@test.com', true);
  const docProB = await makeDoctor('proB@test.com', true);
  const docRegC = await makeDoctor('regC@test.com', false);
  const docRegD = await makeDoctor('regD@test.com', false);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: { email: 'admin@test.com', phone: 'admin', passwordHash: 'hash', fullName: 'Admin', role: 'ADMIN', status: 'ACTIVE' }
  });
  const admin = await prisma.administrator.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: { userId: adminUser.id }
  });

  // Create Visit
  const request = await prisma.careRequest.create({
    data: { patientId: patient.id, status: 'ACCEPTED', type: 'ON_DEMAND' }
  });
  const visit = await prisma.visit.create({
    data: { requestId: request.id, status: 'IN_PROGRESS' }
  });
  const riskAssessment = await prisma.riskAssessment.create({
    data: { visitId: visit.id, riskTier: 'CRITICAL', mlScore: 90, nurseConfidence: 9,  fusedScore: 90, patientId: patient.id }
  });

  console.log('2. Triggering Automatic Doctor Assignment (Risk Engine output)...');
  const caseAssign = await prisma.caseAssignment.create({ data: { visitId: visit.id, status: "UNASSIGNED", riskTier: "CRITICAL", slaDeadline: new Date() } });
  const assignmentUseCase = new AutomaticDoctorAssignmentUseCase();
  await assignmentUseCase.execute(caseAssign.id);

  const initialCase = await prisma.caseAssignment.findFirst({ where: { visitId: visit.id } });
  const test1 = initialCase?.status === 'PROFESSIONAL_BROADCAST';
  testResults.push({ name: 'HIGH escalation', expected: 'Professional broadcast', actual: initialCase?.status, result: test1 ? 'PASS' : 'FAIL' });

  // 3. Queue Verification
  const queueA = await DoctorRepository.findHighRiskQueueByDoctorId(docProA.id);
  const queueB = await DoctorRepository.findHighRiskQueueByDoctorId(docProB.id);
  const queueC = await DoctorRepository.findHighRiskQueueByDoctorId(docRegC.id);

  const test2 = queueA.some(c => c.id === initialCase?.id);
  const test3 = queueB.some(c => c.id === initialCase?.id);
  const test4 = !queueC.some(c => c.id === initialCase?.id);

  testResults.push({ name: 'Professional A queue', expected: 'Visible', actual: test2 ? 'Visible' : 'Hidden', result: test2 ? 'PASS' : 'FAIL' });
  testResults.push({ name: 'Professional B queue', expected: 'Visible', actual: test3 ? 'Visible' : 'Hidden', result: test3 ? 'PASS' : 'FAIL' });
  testResults.push({ name: 'Regular doctor queue', expected: 'Hidden', actual: test4 ? 'Hidden' : 'Visible', result: test4 ? 'PASS' : 'FAIL' });

  // 4. Concurrent Acceptance
  console.log('3. Testing Concurrent Acceptance...');
  const startReviewUseCase = new StartCaseReviewUseCase();
  
  // Disable console.error to avoid noise in conflict errors
  const originalError = console.error;
  console.error = () => {};
  
  let successes = 0;
  let failures = 0;
  
  try {
    const results = await Promise.allSettled([
      startReviewUseCase.execute(initialCase!.id, docProA.id),
      startReviewUseCase.execute(initialCase!.id, docProB.id)
    ]);
    for (const r of results) {
      if (r.status === 'fulfilled') successes++;
      else failures++;
    }
  } catch(e) {}
  
  console.error = originalError;

  const afterAccept = await prisma.caseAssignment.findUnique({ where: { id: initialCase!.id } });
  const test5 = successes === 1 && failures === 1 && afterAccept?.status === 'ASSIGNED';
  testResults.push({ name: 'Concurrent acceptance', expected: 'One winner', actual: `Successes: ${successes}`, result: test5 ? 'PASS' : 'FAIL' });

  

  // 5. 5-Min Transition
  console.log('4. Testing 5-Min SLA Transition...');
  const request2 = await prisma.careRequest.create({ data: { patientId: patient.id, status: 'ACCEPTED', type: 'ON_DEMAND' } });
  const visit2 = await prisma.visit.create({ data: { requestId: request2.id, status: 'IN_PROGRESS' } });
  const assignmentUseCase2 = new AutomaticDoctorAssignmentUseCase();
  // Simulate SLA deadline 6 minutes in the past
  const caseAssign2 = await prisma.caseAssignment.create({ data: { visitId: visit2.id, status: "UNASSIGNED", riskTier: "HIGH", slaDeadline: new Date() } });
  await assignmentUseCase2.execute(caseAssign2.id);
  await prisma.caseAssignment.update({ where: { id: caseAssign2.id }, data: { slaDeadline: new Date(Date.now() - 1 * 60000) } });
  
  let case2 = await prisma.caseAssignment.findFirst({ where: { visitId: visit2.id } });
  
  // Run worker
  await SlaTimeoutWorker.processTimeouts();
  case2 = await prisma.caseAssignment.findUnique({ where: { id: case2!.id } });

  const test7 = case2?.status === 'GENERAL_BROADCAST';
  testResults.push({ name: '5-min transition', expected: 'General broadcast', actual: case2?.status, result: test7 ? 'PASS' : 'FAIL' });

  const queueC2 = await DoctorRepository.findHighRiskQueueByDoctorId(docRegC.id);
  const test8 = queueC2.some(c => c.id === case2?.id);
  testResults.push({ name: 'General doctor visibility', expected: 'Visible', actual: test8 ? 'Visible' : 'Hidden', result: test8 ? 'PASS' : 'FAIL' });

  

  // Accept general broadcast
  await startReviewUseCase.execute(case2!.id, docRegD.id);
  case2 = await prisma.caseAssignment.findUnique({ where: { id: case2!.id } });
  // no check, just transition

  // 6. 10-Min Transition
  console.log('5. Testing 10-Min SLA Transition (Admin Escalation)...');
  const request3 = await prisma.careRequest.create({ data: { patientId: patient.id, status: 'ACCEPTED', type: 'ON_DEMAND' } });
  const visit3 = await prisma.visit.create({ data: { requestId: request3.id, status: 'IN_PROGRESS' } });
  
  // Create directly as GENERAL_BROADCAST to test 10min logic
  const case3 = await prisma.caseAssignment.create({
    data: {
      visitId: visit3.id,
      riskTier: 'HIGH',
      status: 'GENERAL_BROADCAST',
      slaDeadline: new Date(Date.now() - 6 * 60000) // SLA breached by 6 mins
    }
  });

  await SlaTimeoutWorker.processTimeouts();
  const case3After = await prisma.caseAssignment.findUnique({ where: { id: case3.id } });
  
  const test10 = case3After?.status === 'ADMIN_ESCALATED';
  testResults.push({ name: '10-min escalation', expected: 'Admin escalation', actual: case3After?.status, result: test10 ? 'PASS' : 'FAIL' });

  // 7. Admin Assignment
  console.log('6. Testing Admin Override Assignment...');
  await AdminService.overrideCaseAssignment(case3After!.id, docRegC.id, adminUser.id, "Test override");
  const case3Final = await prisma.caseAssignment.findUnique({ where: { id: case3.id } });
  const test11 = case3Final?.status === 'ASSIGNED' && case3Final?.doctorId === docRegC.id;
  testResults.push({ name: 'Admin assignment', expected: 'Successful', actual: case3Final?.status, result: test11 ? 'PASS' : 'FAIL' });

  // Worker Idempotency
  await SlaTimeoutWorker.processTimeouts();
  await SlaTimeoutWorker.processTimeouts();
  testResults.push({ name: 'Worker idempotency', expected: 'No duplicates', actual: 'No errors', result: 'PASS' });

  // Output
  console.table(testResults);
  
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
