import { CreateCareRequestUseCase } from './src/domains/care/requests/usecases/requests/create-care-request.usecase';
import { MarketplaceService } from './src/domains/marketplace/marketplace/marketplace.service';
import { ContractRepository } from './src/domains/marketplace/contracts/contract.repository';
import { prisma } from './src/common/config/database';
import { registerMarketplaceListeners } from './src/domains/marketplace/marketplace/marketplace.listeners';
import { registerVisitListeners } from './src/domains/care/visit/visit.listeners';

async function run() {
  console.log('--- START E2E LIFECYCLE TEST ---');
  registerMarketplaceListeners();
  registerVisitListeners();

  const useCase = new CreateCareRequestUseCase();
  
  let patient = await prisma.patient.findFirst({ include: { user: true } });
  let nurse = await prisma.nurse.findFirst({ include: { user: true } });
  if (!patient || !nurse) throw new Error('Need patient and nurse in DB');

  // 1. CareRequest Creation
  const requestData = {
    patientId: patient.id,
    type: 'NURSE_VISIT' as const,
    scheduleType: 'ONE_TIME' as const,
    preferredDate: new Date(),
    preferredTimeWindow: 'FLEXIBLE' as const,
    durationMinutes: 120,
    requirements: 'Needs IV injection',
    location: { address: 'Test 123', latitude: 10, longitude: 20 }
  };
  const req = await useCase.execute(patient.userId, requestData);
  console.log('[CareRequest] Created ID:', req.id);
  
  // Wait for EventBus (CareRequestCreated -> MarketplaceListing)
  await new Promise(r => setTimeout(r, 1000));

  // 2. Listing verification
  const listing = await prisma.marketplaceListing.findUnique({ where: { careRequestId: req.id } });
  if (!listing) throw new Error('Listing was not created');
  console.log('[Marketplace] Listing Created ID:', listing.id);

  // 3. Nurse submits Offer
  const offer = await MarketplaceService.submitOffer(listing.id, nurse.id, { price: 5000, priceType: 'HOURLY', proposedStart: new Date().toISOString(), message: 'I can help' });
  console.log('[Marketplace] Nurse Offer Created ID:', offer.id);

  // 4. Patient selects Offer (Generates Contract)
  const selection = await MarketplaceService.selectOffer(listing.id, offer.id);
  console.log('[Marketplace] Offer Selected. Contract Created ID:', selection.contract.id);

  // 5. Patient & Nurse Approve Contract (Triggers Visit)
  await ContractRepository.updateApproval(selection.contract.id, 'PATIENT', patient.userId, 'PATIENT');
  await ContractRepository.updateApproval(selection.contract.id, 'NURSE', nurse.userId, 'NURSE');
  console.log('[Contract] Both approved Contract. Should emit CONTRACT_ACTIVATED.');

  // Wait for EventBus (ContractActivated -> Visit)
  await new Promise(r => setTimeout(r, 1000));

  // 6. Verify Visit Creation
  const visit = await prisma.visit.findUnique({ where: { requestId: req.id }, include: { qrToken: true } });
  if (!visit) throw new Error('Visit was not created from Contract activation!');
  
  console.log('[Visit] Visit Created ID:', visit.id, 'Status:', visit.status);
  console.log('[Visit] QR Token created:', visit.qrToken ? 'Yes' : 'No');
  
  console.log('--- TEST PASSED ---');

  // Cleanup
  await prisma.visitQrToken.deleteMany({ where: { visitId: visit.id } });
  await prisma.visit.delete({ where: { id: visit.id } });
  await prisma.contractAuditLog.deleteMany({ where: { contractId: selection.contract.id } });
  await prisma.contractApproval.deleteMany({ where: { contractId: selection.contract.id } });
  await prisma.contract.delete({ where: { id: selection.contract.id } });
  await prisma.offer.delete({ where: { id: offer.id } });
  await prisma.marketplaceListing.delete({ where: { id: listing.id } });
  await prisma.careRequest.delete({ where: { id: req.id } });
  await prisma.$disconnect();
}

run().catch(e => console.error(e));
