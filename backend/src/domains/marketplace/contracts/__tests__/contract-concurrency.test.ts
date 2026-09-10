import { PrismaClient } from '@prisma/client';
import { ContractRepository } from '../contract.repository';

const prisma = new PrismaClient();

describe('Contract Dual-Approval Concurrency', () => {
  let patientId: string;
  let nurseId: string;
  
  beforeAll(async () => {
    // We create dummy users for the foreign keys
    const patientUser: any = await prisma.user.create({
      data: {
        email: `patient-${Date.now()}@example.com`,
        phone: `+1555${Date.now().toString().slice(-7)}`,
        passwordHash: 'hash',
        role: 'PATIENT',
        fullName: 'Test Patient',
        patient: { create: { cnic: `p-${Date.now()}` } }
      },
      include: { patient: true }
    });
    patientId = patientUser.patient.id;

    const nurseUser: any = await prisma.user.create({
      data: {
        email: `nurse-${Date.now()}@example.com`,
        phone: `+1555${Date.now().toString().slice(-7)}`,
        passwordHash: 'hash',
        role: 'NURSE',
        fullName: 'Test Nurse',
        nurse: { create: { cnic: `n-${Date.now()}`, pncNumber: `pnc-${Date.now()}` } }
      },
      include: { nurse: true }
    });
    nurseId = nurseUser.nurse.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.eventOutbox.deleteMany();
    await prisma.contractAuditLog.deleteMany();
    await prisma.contractApproval.deleteMany();
    await prisma.contract.deleteMany();
  });

  const createPendingContract = async () => {
    return prisma.contract.create({
      data: {
        patientId,
        nurseId,
        price: 100,
        priceType: 'FIXED',
        scopeText: 'Test',
        status: 'PENDING_APPROVAL',
        expiresAt: new Date(Date.now() + 86400000)
      }
    });
  };

  it('TEST A: Patient approves first -> remains PENDING_APPROVAL', async () => {
    const contract = await createPendingContract();
    
    await ContractRepository.updateApproval(contract.id, 'PATIENT', 'user-id', 'PATIENT');
    
    const updated = await prisma.contract.findUnique({ where: { id: contract.id } });
    expect(updated?.status).toBe('PENDING_APPROVAL');
    expect(updated?.patientApproved).toBe(true);
    expect(updated?.nurseApproved).toBe(false);

    const outboxEvents = await prisma.eventOutbox.count();
    expect(outboxEvents).toBe(0);
  });

  it('TEST B: Nurse approves second -> becomes ACTIVE and creates 1 Outbox event', async () => {
    const contract = await createPendingContract();
    
    await ContractRepository.updateApproval(contract.id, 'PATIENT', 'user-id', 'PATIENT');
    await ContractRepository.updateApproval(contract.id, 'NURSE', 'user-id', 'NURSE');
    
    const updated = await prisma.contract.findUnique({ where: { id: contract.id } });
    expect(updated?.status).toBe('ACTIVE');
    expect(updated?.patientApproved).toBe(true);
    expect(updated?.nurseApproved).toBe(true);

    const outboxEvents = await prisma.eventOutbox.findMany();
    expect(outboxEvents.length).toBe(1);
    expect(outboxEvents[0].eventType).toBe('CONTRACT_ACTIVATED');
  });

  it('TEST C: Nurse approves first -> PENDING, then Patient -> ACTIVE', async () => {
    const contract = await createPendingContract();
    
    await ContractRepository.updateApproval(contract.id, 'NURSE', 'user-id', 'NURSE');
    
    let updated = await prisma.contract.findUnique({ where: { id: contract.id } });
    expect(updated?.status).toBe('PENDING_APPROVAL');
    expect(updated?.nurseApproved).toBe(true);
    expect(updated?.patientApproved).toBe(false);

    await ContractRepository.updateApproval(contract.id, 'PATIENT', 'user-id', 'PATIENT');
    
    updated = await prisma.contract.findUnique({ where: { id: contract.id } });
    expect(updated?.status).toBe('ACTIVE');

    const outboxEvents = await prisma.eventOutbox.count();
    expect(outboxEvents).toBe(1);
  });

  it('TEST D (CRITICAL): Patient and Nurse approve simultaneously', async () => {
    const contract = await createPendingContract();
    
    // Fire both concurrently
    await Promise.all([
      ContractRepository.updateApproval(contract.id, 'PATIENT', 'user-1', 'PATIENT'),
      ContractRepository.updateApproval(contract.id, 'NURSE', 'user-2', 'NURSE')
    ]);
    
    const updated = await prisma.contract.findUnique({ where: { id: contract.id } });
    
    expect(updated?.status).toBe('ACTIVE');
    expect(updated?.patientApproved).toBe(true);
    expect(updated?.nurseApproved).toBe(true);

    // CRITICAL: Exactly ONE event must be created despite simultaneous execution
    const outboxEvents = await prisma.eventOutbox.count();
    expect(outboxEvents).toBe(1);
  });

  it('Idempotency: Patient approves twice -> No duplicate event', async () => {
    const contract = await createPendingContract();
    
    await ContractRepository.updateApproval(contract.id, 'PATIENT', 'user-1', 'PATIENT');
    await ContractRepository.updateApproval(contract.id, 'PATIENT', 'user-1', 'PATIENT');
    
    const updated = await prisma.contract.findUnique({ where: { id: contract.id } });
    expect(updated?.status).toBe('PENDING_APPROVAL');
    expect(updated?.patientApproved).toBe(true);
    
    const auditLogs = await prisma.contractAuditLog.count({ where: { contractId: contract.id, action: 'APPROVED' } });
    // First time adds 1 audit log. Second time is ignored.
    expect(auditLogs).toBe(1);
  });

  it('Idempotency: Approve request after Contract is ACTIVE does nothing', async () => {
    const contract = await createPendingContract();
    
    await ContractRepository.updateApproval(contract.id, 'PATIENT', 'user-1', 'PATIENT');
    await ContractRepository.updateApproval(contract.id, 'NURSE', 'user-2', 'NURSE');
    
    const initialEvents = await prisma.eventOutbox.count();
    expect(initialEvents).toBe(1);

    // Try another approval from patient
    await ContractRepository.updateApproval(contract.id, 'PATIENT', 'user-1', 'PATIENT');
    
    const updated = await prisma.contract.findUnique({ where: { id: contract.id } });
    expect(updated?.status).toBe('ACTIVE'); // remains ACTIVE

    const finalEvents = await prisma.eventOutbox.count();
    expect(finalEvents).toBe(1); // No new events created
  });

  it('Failure Atomicity: Database failure during event insertion rolls back Contract', async () => {
    const contract = await createPendingContract();
    
    await ContractRepository.updateApproval(contract.id, 'PATIENT', 'user-1', 'PATIENT');
    
    // We'll simulate a failure by mocking OutboxRepository to throw error
    const OutboxRepository = require('../../../../common/events/outbox.repository').OutboxRepository;
    const originalCreate = OutboxRepository.createEvent;
    
    OutboxRepository.createEvent = jest.fn().mockRejectedValue(new Error('DB connection lost'));
    
    await expect(
      ContractRepository.updateApproval(contract.id, 'NURSE', 'user-2', 'NURSE')
    ).rejects.toThrow('DB connection lost');
    
    // Verify Contract was ROLLED BACK
    const updated = await prisma.contract.findUnique({ where: { id: contract.id } });
    expect(updated?.status).toBe('PENDING_APPROVAL'); // Did NOT transition to ACTIVE
    expect(updated?.nurseApproved).toBe(false); // Rollback also undid the flag update

    // Verify no events exist
    const outboxEvents = await prisma.eventOutbox.count();
    expect(outboxEvents).toBe(0);
    
    // Restore original
    OutboxRepository.createEvent = originalCreate;
  });
});
