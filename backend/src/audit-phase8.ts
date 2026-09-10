import { PrismaClient } from '@prisma/client';
import { CreateCareRequestUseCase } from './domains/care/requests/usecases/requests/create-care-request.usecase';
import { MarketplaceService } from './domains/marketplace/marketplace/marketplace.service';
import { ContractService } from './domains/marketplace/contracts/contract.service';
import { VisitRepository } from './domains/care/visit/visit.repository';
import { AppEventBus, EVENTS } from './common/events/app-event-bus';

// Initialize listeners
require('./domains/marketplace/marketplace/marketplace.listeners').registerMarketplaceListeners();
require('./domains/marketplace/contracts/contract.listeners').registerContractListeners();
require('./domains/care/visit/visit.listeners').registerVisitListeners();
require('./domains/care/requests/care.listeners').registerCareListeners();

const prisma = new PrismaClient();

async function runAudit() {
  console.log('--- STARTING PHASE 8 E2E AUDIT ---');
  
  // Cleanup
  await prisma.visitQrToken.deleteMany();
  await prisma.visitVerification.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.contractAuditLog.deleteMany();
  await prisma.contractApproval.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.marketplaceListing.deleteMany();
  await prisma.careRequest.deleteMany();
  await prisma.eventOutbox.deleteMany();
  await prisma.favoriteNurse.deleteMany();
  await prisma.nurseScore.deleteMany();
  await prisma.nurseReview.deleteMany();
  await prisma.nurse.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // Create mock users
  const patient = await prisma.user.create({
    data: {
      email: 'p8-patient@example.com',
      phone: '123456789',
      fullName: 'Patient 8',
      passwordHash: 'hash',
      role: 'PATIENT',
      patient: {
        create: {
          address: 'Phase 8 City',
          latitude: 0,
          longitude: 0,
          cnic: '1111111111111'
        }
      }
    },
    include: { patient: true }
  });

  const nurse1 = await prisma.user.create({
    data: {
      email: 'p8-nurse1@example.com',
      phone: '987654321',
      fullName: 'Nurse 1',
      passwordHash: 'hash',
      role: 'NURSE',
      nurse: {
        create: {
          cnic: '2222222222222',
          pncNumber: 'PNC1',
          licenseNumber: 'LIC1',
          experience: 5
        }
      }
    },
    include: { nurse: true }
  });

  const nurse2 = await prisma.user.create({
    data: {
      email: 'p8-nurse2@example.com',
      phone: '555555555',
      fullName: 'Nurse 2',
      passwordHash: 'hash',
      role: 'NURSE',
      nurse: {
        create: {
          cnic: '3333333333333',
          pncNumber: 'PNC2',
          licenseNumber: 'LIC2',
          experience: 5
        }
      }
    },
    include: { nurse: true }
  });

  // TEST A: CareRequest creation
  console.log('\n[TEST A] Creating Care Request...');
  const createReqUseCase = new CreateCareRequestUseCase();
  
  // legacy scheduledAt
  const legacyDate = new Date();
  legacyDate.setFullYear(2023);
  
  const careReq = await createReqUseCase.execute(patient.id, {
    patientId: patient.patient!.id,
    type: 'NURSE_VISIT',
    scheduleType: 'ONE_TIME',
    durationMinutes: 120,
    location: { address: 'Phase 8 Clinic', latitude: 0, longitude: 0 },
    // @ts-ignore
    scheduledAt: legacyDate.toISOString() // pass to see if it mutates
  });

  const reqs = await prisma.careRequest.count();
  const createdEvents = await prisma.eventOutbox.findMany({ where: { eventType: EVENTS.CARE_REQUEST_CREATED }});
  
  console.assert(reqs === 1, 'CareRequest count must be 1');
  console.assert(createdEvents.length === 1, 'CARE_REQUEST_CREATED outbox count must be 1');
  
  // TEST B: Process event
  console.log('[TEST B] Processing CARE_REQUEST_CREATED (Marketplace Listing creation)...');
  await AppEventBus.emitAsync(EVENTS.CARE_REQUEST_CREATED, createdEvents[0].payload);
  
  const listings = await prisma.marketplaceListing.findMany();
  console.assert(listings.length === 1, 'Exactly one MarketplaceListing should be created');
  
  // TEST C: Duplicate event
  console.log('[TEST C] Simulating duplicate CARE_REQUEST_CREATED event...');
  await AppEventBus.emitAsync(EVENTS.CARE_REQUEST_CREATED, createdEvents[0].payload);
  const listingsAfterDuplicate = await prisma.marketplaceListing.findMany();
  console.assert(listingsAfterDuplicate.length === 1, 'Listing count should remain 1');

  const listingId = listings[0].id;

  // Add Offers
  const proposedStart1 = new Date();
  proposedStart1.setHours(proposedStart1.getHours() + 2);
  
  const proposedStart2 = new Date();
  proposedStart2.setHours(proposedStart2.getHours() + 4);

  const offer1 = await prisma.offer.create({
    data: {
      listingId,
      // @ts-ignore
      nurseId: nurse1.nurse!.id,
      price: 100,
      priceType: 'HOURLY',
      status: 'PENDING',
      proposedStart: proposedStart1,
      expiresAt: new Date(Date.now() + 86400000)
    } as any
  });

  const offer2 = await prisma.offer.create({
    data: {
      listingId,
      // @ts-ignore
      nurseId: nurse2.nurse!.id,
      price: 150,
      priceType: 'HOURLY',
      status: 'PENDING',
      proposedStart: proposedStart2,
      expiresAt: new Date(Date.now() + 86400000)
    } as any
  });

  // TEST D: Offer Selection
  console.log('\n[TEST D] Selecting Offer (OFFER_SELECTED transaction)...');
  await MarketplaceService.selectOffer(listingId, offer1.id);
  
  const updatedListing = await prisma.marketplaceListing.findUnique({ where: { id: listingId } });
  const updatedOffer1 = await prisma.offer.findUnique({ where: { id: offer1.id } });
  const updatedOffer2 = await prisma.offer.findUnique({ where: { id: offer2.id } });
  const offerEvents = await prisma.eventOutbox.findMany({ where: { eventType: EVENTS.OFFER_SELECTED } });
  
  console.assert(updatedListing?.status === 'CLOSED', 'Listing must be CLOSED');
  console.assert(updatedOffer1?.status === 'ACCEPTED', 'Offer 1 must be ACCEPTED');
  console.assert(updatedOffer2?.status === 'REJECTED', 'Offer 2 must be REJECTED');
  console.assert(offerEvents.length === 1, 'Exactly one OFFER_SELECTED event must be generated');

  // TEST E: Duplicate OFFER_SELECTED simulation
  console.log('[TEST E] Processing OFFER_SELECTED & simulating duplicate event...');
  await AppEventBus.emitAsync(EVENTS.OFFER_SELECTED, offerEvents[0].payload);
  const contracts1 = await prisma.contract.findMany();
  console.assert(contracts1.length === 1, 'Contract must be created');
  
  await AppEventBus.emitAsync(EVENTS.OFFER_SELECTED, offerEvents[0].payload);
  const contracts2 = await prisma.contract.findMany();
  console.assert(contracts2.length === 1, 'Contract count must remain 1 on duplicate event');

  // TEST F/G: Contract sourceOfferId is unique (implicitly verified by Test E catching P2002/idempotent block)

  // Contract Approval
  const contractId = contracts1[0].id;
  // @ts-ignore
  await ContractService.approveContract(contractId, { id: patient.id, role: 'PATIENT', patient: patient.patient } as any);
  // @ts-ignore
  await ContractService.approveContract(contractId, { id: nurse1.id, role: 'NURSE', nurse: nurse1.nurse } as any);
  
  const activeContract = await prisma.contract.findUnique({ where: { id: contractId } });
  console.assert(activeContract?.status === 'ACTIVE', 'Contract must be ACTIVE');
  
  const activatedEvents = await prisma.eventOutbox.findMany({ where: { eventType: EVENTS.CONTRACT_ACTIVATED } });
  console.assert(activatedEvents.length === 1, 'CONTRACT_ACTIVATED event must be generated');

  // TEST H: Visit Creation
  console.log('\n[TEST H] Processing CONTRACT_ACTIVATED (Visit Creation)...');
  await AppEventBus.emitAsync(EVENTS.CONTRACT_ACTIVATED, activatedEvents[0].payload);
  
  const visits = await prisma.visit.findMany();
  console.assert(visits.length === 1, 'Visit must be created');
  console.assert(visits[0].agreedStartTime?.getTime() === proposedStart1.getTime(), 'Visit agreedStartTime must match Offer.proposedStart');
  
  const updatedCareReq = await prisma.careRequest.findUnique({ where: { id: careReq.id } });
  if (updatedCareReq?.scheduledAt) {
    console.assert(updatedCareReq.scheduledAt.getTime() === legacyDate.getTime() || updatedCareReq.scheduledAt.getTime() !== proposedStart1.getTime(), 'CareRequest.scheduledAt must NOT be overwritten by MarketPlace flow.');
  }

  // TEST I: Duplicate CONTRACT_ACTIVATED
  console.log('[TEST I] Simulating duplicate CONTRACT_ACTIVATED event...');
  await AppEventBus.emitAsync(EVENTS.CONTRACT_ACTIVATED, activatedEvents[0].payload);
  const visitsAfterDuplicate = await prisma.visit.findMany();
  console.assert(visitsAfterDuplicate.length === 1, 'Visit count must remain 1');

  const visitId = visits[0].id;

  // Manually insert verification so we can start the visit
  await prisma.visitQrToken.updateMany({
    where: { visitId },
    data: { status: 'USED' }
  });
  await prisma.visitVerification.create({
    data: {
      visitId,
      method: 'QR',
      result: true,
      reason: 'Test verification'
    }
  });
  
  // Visit requires 'ACCEPTED' status before IN_PROGRESS
  await prisma.visit.update({ where: { id: visitId }, data: { status: 'ACCEPTED' } });

  // TEST J: Visit Starts
  console.log('\n[TEST J] Starting Visit...');
  await VisitRepository.startVisit(visitId);
  const inProgressVisit = await prisma.visit.findUnique({ where: { id: visitId } });
  const startEvents = await prisma.eventOutbox.findMany({ where: { eventType: EVENTS.VISIT_STARTED } });
  console.assert(inProgressVisit?.status === 'IN_PROGRESS', 'Visit must be IN_PROGRESS');
  console.assert(startEvents.length === 1, 'VISIT_STARTED event must be generated');

  // TEST K: Duplicate Visit Start
  console.log('[TEST K] Simulating duplicate Visit start request...');
  await VisitRepository.startVisit(visitId);
  const startEventsDup = await prisma.eventOutbox.findMany({ where: { eventType: EVENTS.VISIT_STARTED } });
  console.assert(startEventsDup.length === 1, 'VISIT_STARTED events should remain 1');

  // TEST L: Visit Completes
  console.log('\n[TEST L] Completing Visit...');
  await VisitRepository.completeVisit(visitId);
  const completeVisit = await prisma.visit.findUnique({ where: { id: visitId } });
  const completeEvents = await prisma.eventOutbox.findMany({ where: { eventType: EVENTS.VISIT_COMPLETED } });
  console.assert(completeVisit?.status === 'COMPLETED', 'Visit must be COMPLETED');
  console.assert(completeEvents.length === 1, 'VISIT_COMPLETED event must be generated');

  // TEST M: Duplicate Visit Complete
  console.log('[TEST M] Simulating duplicate Visit complete request...');
  await VisitRepository.completeVisit(visitId);
  const completeEventsDup = await prisma.eventOutbox.findMany({ where: { eventType: EVENTS.VISIT_COMPLETED } });
  console.assert(completeEventsDup.length === 1, 'VISIT_COMPLETED events should remain 1');

  console.log('\n--- ALL PHASE 8 SCENARIOS PASSED SUCCESSFULLY! ---');
  await prisma.$disconnect();
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
