import { PrismaClient } from '@prisma/client';
import { ContractRepository } from './src/domains/marketplace/contracts/contract.repository';
import { outboxService } from './src/common/events/outbox.service';
import { registerVisitListeners } from './src/domains/care/visit/visit.listeners';

const prisma = new PrismaClient();

async function run() {
  console.log('--- PHASE 6 LIVE DB VERIFICATION ---');
  
  // 1. Setup listeners and worker
  registerVisitListeners();
  outboxService.start();

  // 2. Setup Data
  const proposedStart = new Date('2027-01-01T10:00:00.000Z');
  
  const pUser = await prisma.user.create({
    data: { email: `v-p-${Date.now()}@a.com`, phone: `+3${Date.now()}`, passwordHash: 'hash', role: 'PATIENT', fullName: 'Patient V', patient: { create: { cnic: `v-p-${Date.now()}` } } },
    include: { patient: true }
  });
  
  const nUser = await prisma.user.create({
    data: { email: `v-n-${Date.now()}@a.com`, phone: `+4${Date.now()}`, passwordHash: 'hash', role: 'NURSE', fullName: 'Nurse V', nurse: { create: { cnic: `v-n-${Date.now()}`, pncNumber: `vpnc-${Date.now()}` } } },
    include: { nurse: true }
  });

  const careRequest = await prisma.careRequest.create({
    data: { patientId: pUser.patient!.id, type: 'ONE_TIME', status: 'OPEN', scheduledAt: new Date('1999-01-01T00:00:00Z') } // Legacy date that should be ignored
  });

  const listing = await prisma.marketplaceListing.create({
    data: { careRequestId: careRequest.id, zone: 'TEST' }
  });

  const offer = await prisma.offer.create({
    data: { listingId: listing.id, nurseId: nUser.nurse!.id, price: 100, priceType: 'FIXED', proposedStart, status: 'ACCEPTED', expiresAt: new Date(Date.now() + 86400000) }
  });

  let contract = await prisma.contract.create({
    data: { patientId: pUser.patient!.id, nurseId: nUser.nurse!.id, careRequestId: careRequest.id, sourceOfferId: offer.id, price: 100, priceType: 'FIXED', scopeText: 'Test', status: 'PENDING_APPROVAL', expiresAt: new Date(Date.now() + 86400000) }
  });

  console.log('Created Contract with sourceOfferId:', contract.sourceOfferId);
  console.log('Offer proposedStart:', proposedStart.toISOString());
  console.log('CareRequest legacy scheduledAt:', careRequest.scheduledAt?.toISOString());

  // 3. Fire dual approvals to activate the contract and trigger the Visit creation flow
  await Promise.all([
    ContractRepository.updateApproval(contract.id, 'PATIENT', pUser.id, 'PATIENT'),
    ContractRepository.updateApproval(contract.id, 'NURSE', nUser.id, 'NURSE')
  ]);

  // Wait a few seconds for outbox worker to process the event
  console.log('Waiting 5 seconds for background outbox worker to create visit...');
  await new Promise(r => setTimeout(r, 5000));

  // 4. Audit
  contract = (await prisma.contract.findUnique({ where: { id: contract.id } }))!;
  const visit = await prisma.visit.findFirst({ where: { requestId: careRequest.id } });

  console.log('\\n--- RESULTS ---');
  console.log('Contract Status:', contract.status);
  console.log('Visit Created:', !!visit);
  
  if (visit) {
    console.log('Visit agreedStartTime:', visit.agreedStartTime?.toISOString());
    console.log('MATCHES proposedStart?', visit.agreedStartTime?.toISOString() === proposedStart.toISOString() ? 'YES' : 'NO');
    console.log('IGNORED legacy scheduledAt?', visit.agreedStartTime?.toISOString() !== careRequest.scheduledAt?.toISOString() ? 'YES' : 'NO');
  }

  outboxService.stop();
}

run().finally(() => prisma.$disconnect());
