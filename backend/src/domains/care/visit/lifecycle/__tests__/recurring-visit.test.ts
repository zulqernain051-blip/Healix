import { PrismaClient } from '@prisma/client';
import { VisitRepository } from '../../visit.repository';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

describe('Recurring Visit Workflow', () => {
  let patient: any;
  let nurse: any;
  let pattern: any;
  let request: any;
  let visit1: any;
  let testUserId: string;

  beforeAll(async () => {
    testUserId = crypto.randomUUID();
    
    // Create a dummy user
    const user = await prisma.user.create({
      data: {
        id: testUserId,
        email: `test_${Date.now()}@example.com`,
        passwordHash: 'dummy',
        fullName: 'Test User',
        phone: '1234567890',
        role: 'PATIENT',
        status: 'ACTIVE'
      }
    });

    patient = await prisma.patient.create({
      data: {
        userId: user.id,
        dob: new Date(),
        cnic: 'PATIENT_CNIC_' + Date.now(),
        gender: 'OTHER'
      }
    });

    nurse = await prisma.nurse.create({
      data: {
        userId: user.id,
        experience: 5,
        cnic: 'NURSE_CNIC_' + Date.now(),
        pncNumber: 'PNC_' + Date.now()
      }
    });

    pattern = await prisma.recurringPattern.create({
      data: {
        patientId: patient.id,
        frequency: 'DAILY',
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        occurrencesRemaining: 2 // We will test exactly 2 occurrences
      }
    });

    request = await prisma.careRequest.create({
      data: {
        patientId: patient.id,
        type: 'NURSE_VISIT',
        status: 'ASSIGNED',
        scheduleType: 'RECURRING',
        recurringPatternId: pattern.id,
        durationMinutes: 60,
        priority: 'ROUTINE',
        scheduledAt: new Date()
      }
    });

    visit1 = await prisma.visit.create({
      data: {
        requestId: request.id,
        nurseId: nurse.id,
        status: 'IN_PROGRESS',
        agreedStartTime: new Date()
      }
    });
  });

  afterAll(async () => {
    if (request) {
      await prisma.visitQrToken.deleteMany({ where: { visit: { requestId: request.id } } });
      await prisma.visit.deleteMany({ where: { requestId: request.id } });
      await prisma.careRequest.delete({ where: { id: request.id } });
      await prisma.recurringPattern.delete({ where: { id: pattern.id } });
    }
    if (patient) await prisma.patient.delete({ where: { id: patient.id } });
    if (nurse) await prisma.nurse.delete({ where: { id: nurse.id } });
    if (testUserId) await prisma.user.delete({ where: { id: testUserId } });
    
    await prisma.$disconnect();
  });

  it('completing first visit generates next visit and keeps request ASSIGNED', async () => {
    await VisitRepository.completeVisit(visit1.id);

    const currentRequest = await prisma.careRequest.findUnique({
      where: { id: request.id },
      include: { visits: true }
    });

    expect(currentRequest?.status).toBe('ASSIGNED');
    expect(currentRequest?.visits.length).toBe(2);

    const visit2 = currentRequest?.visits.find(v => v.status === 'SCHEDULED');
    expect(visit2).toBeDefined();

    const currentPattern = await prisma.recurringPattern.findUnique({ where: { id: pattern.id } });
    expect(currentPattern?.occurrencesRemaining).toBe(1);
  });

  it('completing final visit marks request COMPLETED', async () => {
    const currentRequest = await prisma.careRequest.findUnique({
      where: { id: request.id },
      include: { visits: true }
    });

    const visit2 = currentRequest?.visits.find(v => v.status === 'SCHEDULED');
    
    // Mark in progress
    await prisma.visit.update({ where: { id: visit2!.id }, data: { status: 'IN_PROGRESS' } });

    await VisitRepository.completeVisit(visit2!.id);

    const finalRequest = await prisma.careRequest.findUnique({
      where: { id: request.id },
      include: { visits: true }
    });

    expect(finalRequest?.status).toBe('COMPLETED');
    expect(finalRequest?.visits.length).toBe(2);

    const finalPattern = await prisma.recurringPattern.findUnique({ where: { id: pattern.id } });
    expect(finalPattern?.occurrencesRemaining).toBe(0);
  });
});
