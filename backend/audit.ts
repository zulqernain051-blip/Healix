import { PrismaClient } from '@prisma/client';
import { ContractRepository } from './src/domains/marketplace/contracts/contract.repository';
import { outboxService } from './src/common/events/outbox.service';
import { AppEventBus } from './src/common/events/app-event-bus';
import { registerVisitListeners } from './src/domains/care/visit/visit.listeners';

const prisma = new PrismaClient();

async function run() {
  console.log('--- LIVE DB VERIFICATION ---');
  
  // 1. Setup listeners and worker
  registerVisitListeners();
  outboxService.start();

  // 2. Create users and contract
  const pUser = await prisma.user.create({
    data: { email: `a-p-${Date.now()}@a.com`, phone: `+1${Date.now()}`, passwordHash: 'hash', role: 'PATIENT', fullName: 'Patient A', patient: { create: { cnic: `p-${Date.now()}` } } },
    include: { patient: true }
  });
  
  const nUser = await prisma.user.create({
    data: { email: `a-n-${Date.now()}@a.com`, phone: `+2${Date.now()}`, passwordHash: 'hash', role: 'NURSE', fullName: 'Nurse A', nurse: { create: { cnic: `n-${Date.now()}`, pncNumber: `pnc-${Date.now()}` } } },
    include: { nurse: true }
  });

  const careRequest = await prisma.careRequest.create({
    data: { patientId: pUser.patient!.id, type: 'ONE_TIME', status: 'OPEN' }
  });

  let contract = await prisma.contract.create({
    data: { patientId: pUser.patient!.id, nurseId: nUser.nurse!.id, careRequestId: careRequest.id, price: 100, priceType: 'FIXED', scopeText: 'Test', status: 'PENDING_APPROVAL', expiresAt: new Date(Date.now() + 86400000) }
  });
  console.log('Created Contract:', contract.id, contract.status);

  // 3. Fire dual approvals simultaneously
  console.log('Firing dual approvals simultaneously...');
  await Promise.all([
    ContractRepository.updateApproval(contract.id, 'PATIENT', pUser.id, 'PATIENT'),
    ContractRepository.updateApproval(contract.id, 'NURSE', nUser.id, 'NURSE')
  ]);

  // Wait a few seconds for outbox worker to process the event
  console.log('Waiting 6 seconds for background outbox worker...');
  await new Promise(r => setTimeout(r, 6000));

  // 4. Audit
  contract = (await prisma.contract.findUnique({ where: { id: contract.id } }))!;
  const outbox = await prisma.eventOutbox.findMany({ where: { aggregateId: contract.id, eventType: 'CONTRACT_ACTIVATED' } });
  const visits = await prisma.visit.findMany({ where: { requestId: careRequest.id } });

  console.log('Contract Status:', contract.status);
  console.log('Patient Approved:', contract.patientApproved);
  console.log('Nurse Approved:', contract.nurseApproved);
  console.log('CONTRACT_ACTIVATED events:', outbox.length, 'Status:', outbox[0]?.status);
  console.log('Visit count:', visits.length);

  outboxService.stop();
}

run().finally(() => prisma.$disconnect());
