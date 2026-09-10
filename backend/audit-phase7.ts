import { prisma } from './src/common/config/database';
import { CareRepository } from './src/domains/care/requests/care.repository';
import { MarketplaceService } from './src/domains/marketplace/marketplace/marketplace.service';
import { ContractService } from './src/domains/marketplace/contracts/contract.service';
import { VisitRepository } from './src/domains/care/visit/visit.repository';
import { outboxService } from './src/common/events/outbox.service';
import { PublishCareRequestToMarketplaceUseCase } from './src/domains/marketplace/marketplace/usecases/publish-care-request-to-marketplace.usecase';

// Import and register listeners explicitly for testing
import { registerMarketplaceListeners } from './src/domains/marketplace/marketplace/marketplace.listeners';
import { registerVisitListeners } from './src/domains/care/visit/visit.listeners';
import { registerContractListeners } from './src/domains/marketplace/contracts/contract.listeners';
import { registerCareListeners } from './src/domains/care/requests/care.listeners';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function processOutbox() {
  // Let outbox process the current batch
  await (outboxService as any).processBatch();
  await delay(100);
}

async function auditPhase7() {
  console.log('==================================================');
  console.log('STARTING LIVE AUDIT PHASE 7: Cancellation Lifecycle');
  console.log('==================================================');

  // Register listeners for the test env
  registerMarketplaceListeners();
  registerVisitListeners();
  registerContractListeners();
  registerCareListeners();

  // Create patient and nurse if they don't exist
  let patient = await prisma.patient.findFirst();
  if (!patient) {
    const user = await prisma.user.create({
      data: {
        email: 'patient_p7@test.com',
        passwordHash: 'hash',
        role: 'PATIENT',
        fullName: 'Phase7 Patient',
        phone: '111222333'
      }
    });
    patient = await prisma.patient.create({ data: { userId: user.id, cnic: 'P7-CNIC' } });
  }

  let nurse = await prisma.nurse.findFirst();
  if (!nurse) {
    const user = await prisma.user.create({
      data: {
        email: 'nurse_p7@test.com',
        passwordHash: 'hash',
        role: 'NURSE',
        fullName: 'Phase7 Nurse',
        phone: '444555666'
      }
    });
    nurse = await prisma.nurse.create({ data: { userId: user.id, pncNumber: 'P7', cnic: 'P7-NURSE-CNIC' } });
  }

  const patientId = patient.id;
  const nurseId = nurse.id;

  try {
    // --------------------------------------------------
    // SCENARIO 1: CareRequest Cancellation
    // --------------------------------------------------
    console.log('\n--- SCENARIO 1: CareRequest Cancellation ---');
    const cr1 = await prisma.careRequest.create({
      data: { patientId, type: 'NURSE_VISIT', status: 'OPEN' }
    });
    const publishUseCase = new PublishCareRequestToMarketplaceUseCase();
    await publishUseCase.execute(cr1.id);

    // Cancel it
    await CareRepository.updateCareRequestStatus(cr1.id, 'CANCELLED');
    await processOutbox();

    const listing1 = await prisma.marketplaceListing.findUnique({ where: { careRequestId: cr1.id } });
    if (listing1?.status !== 'CLOSED') {
      throw new Error('SCENARIO 1 FAILED: Listing was not closed.');
    }
    console.log('SCENARIO 1 PASSED: CareRequest cancellation closed the MarketplaceListing.');

    // --------------------------------------------------
    // SCENARIO 2: Contract Rejection Reopens Listing
    // --------------------------------------------------
    console.log('\n--- SCENARIO 2: Contract Rejection ---');
    const cr2 = await prisma.careRequest.create({
      data: { patientId, type: 'NURSE_VISIT', status: 'OPEN' }
    });
    await publishUseCase.execute(cr2.id);
    const listing2 = await prisma.marketplaceListing.findUnique({ where: { careRequestId: cr2.id } });

    // Nurse offers
    const offer2 = await MarketplaceService.submitOffer(listing2!.id, nurseId, { price: 1000, proposedStart: new Date() });
    
    // Patient accepts offer
    const { contract: contract2 } = await MarketplaceService.selectOffer(listing2!.id, offer2.id);

    // Patient rejects contract
    await ContractService.rejectContract(contract2.id, 'Too expensive', { id: (await prisma.user.findFirst({ where: { id: patient.userId } }))!.id, role: 'PATIENT', patient });
    await processOutbox();

    const checkListing2 = await prisma.marketplaceListing.findUnique({ where: { careRequestId: cr2.id } });
    if (checkListing2?.status !== 'OPEN') {
      throw new Error(`SCENARIO 2 FAILED: Listing was not reopened. Current status: ${checkListing2?.status}`);
    }
    console.log('SCENARIO 2 PASSED: Contract rejection reopened the MarketplaceListing.');

    // --------------------------------------------------
    // SCENARIO 3: Contract Expiration Reopens Listing
    // --------------------------------------------------
    console.log('\n--- SCENARIO 3: Contract Expiration Sweeper ---');
    const cr3 = await prisma.careRequest.create({
      data: { patientId, type: 'NURSE_VISIT', status: 'OPEN' }
    });
    await publishUseCase.execute(cr3.id);
    const listing3 = await prisma.marketplaceListing.findUnique({ where: { careRequestId: cr3.id } });
    const offer3 = await MarketplaceService.submitOffer(listing3!.id, nurseId, { price: 1000, proposedStart: new Date() });
    const { contract: contract3 } = await MarketplaceService.selectOffer(listing3!.id, offer3.id);

    // Force expiration backwards
    await prisma.contract.update({
      where: { id: contract3.id },
      data: { expiresAt: new Date(Date.now() - 100000) }
    });

    // Run sweeper
    const sweptCount = await ContractService.sweepExpiredContracts();
    await processOutbox();

    if (sweptCount === 0) throw new Error('SCENARIO 3 FAILED: Sweeper did not pick up expired contract.');

    const checkListing3 = await prisma.marketplaceListing.findUnique({ where: { careRequestId: cr3.id } });
    if (checkListing3?.status !== 'OPEN') {
      throw new Error(`SCENARIO 3 FAILED: Listing was not reopened. Current status: ${checkListing3?.status}`);
    }
    console.log('SCENARIO 3 PASSED: Contract expiration sweeper successfully expired and reopened listing.');

    // --------------------------------------------------
    // SCENARIO 4: Contract Cancellation Cascades to Visit
    // --------------------------------------------------
    console.log('\n--- SCENARIO 4: Contract Cancellation ---');
    const cr4 = await prisma.careRequest.create({
      data: { patientId, type: 'NURSE_VISIT', status: 'OPEN' }
    });
    await publishUseCase.execute(cr4.id);
    const listing4 = await prisma.marketplaceListing.findUnique({ where: { careRequestId: cr4.id } });
    const offer4 = await MarketplaceService.submitOffer(listing4!.id, nurseId, { price: 1000, proposedStart: new Date() });
    const { contract: contract4 } = await MarketplaceService.selectOffer(listing4!.id, offer4.id);

    // Approve both sides to make ACTIVE and spawn Visit
    await ContractService.approveContract(contract4.id, { id: patient.userId, role: 'PATIENT', patient });
    await ContractService.approveContract(contract4.id, { id: nurse.userId, role: 'NURSE', nurse });
    await processOutbox(); // Visit created

    let checkVisit = await prisma.visit.findUnique({ where: { requestId: cr4.id } });
    if (!checkVisit || checkVisit.status !== 'SCHEDULED') throw new Error('SCENARIO 4 SETUP FAILED: Visit not SCHEDULED.');

    // Cancel Contract
    await ContractService.cancelContract(contract4.id, 'Changed mind', { id: patient.userId, role: 'PATIENT', patient });
    await processOutbox(); // Should cancel Visit

    checkVisit = await prisma.visit.findUnique({ where: { requestId: cr4.id } });
    if (checkVisit?.status !== 'CANCELLED') {
      throw new Error(`SCENARIO 4 FAILED: Visit was not cancelled. Status: ${checkVisit?.status}`);
    }
    console.log('SCENARIO 4 PASSED: Contract cancellation successfully cancelled the Visit.');

    // --------------------------------------------------
    // SCENARIO 5: Visit Cancellation Cascades to Contract
    // --------------------------------------------------
    console.log('\n--- SCENARIO 5: Visit Cancellation ---');
    const cr5 = await prisma.careRequest.create({
      data: { patientId, type: 'NURSE_VISIT', status: 'OPEN' }
    });
    await publishUseCase.execute(cr5.id);
    const listing5 = await prisma.marketplaceListing.findUnique({ where: { careRequestId: cr5.id } });
    const offer5 = await MarketplaceService.submitOffer(listing5!.id, nurseId, { price: 1000, proposedStart: new Date() });
    const { contract: contract5 } = await MarketplaceService.selectOffer(listing5!.id, offer5.id);

    await ContractService.approveContract(contract5.id, { id: patient.userId, role: 'PATIENT', patient });
    await ContractService.approveContract(contract5.id, { id: nurse.userId, role: 'NURSE', nurse });
    await processOutbox();

    let visit5 = await prisma.visit.findUnique({ where: { requestId: cr5.id } });
    
    // Cancel Visit
    await VisitRepository.cancelVisitAndFutureOccurrences(visit5!.id, false);
    await processOutbox(); // Should cancel Contract

    const checkContract5 = await prisma.contract.findUnique({ where: { id: contract5.id } });
    if (checkContract5?.status !== 'CANCELLED') {
      throw new Error(`SCENARIO 5 FAILED: Contract was not cancelled. Status: ${checkContract5?.status}`);
    }
    console.log('SCENARIO 5 PASSED: Visit cancellation successfully cancelled the Contract.');

    console.log('\nALL PHASE 7 SCENARIOS PASSED SUCCESSFULLY!');
  } catch (err: any) {
    console.error('\nAUDIT FAILED:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

auditPhase7();
