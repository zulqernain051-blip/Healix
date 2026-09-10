import { PrismaClient } from '@prisma/client';
import { CreateVisitFromContractUseCase } from '../create-visit-from-contract.usecase';

const prisma = new PrismaClient();
const usecase = new CreateVisitFromContractUseCase();

describe('CreateVisitFromContractUseCase', () => {
  let patientUser: any, nurseUser: any, careRequest: any;

  beforeAll(async () => {
    patientUser = await prisma.user.create({
      data: {
        email: `p-${Date.now()}@test.com`,
        phone: `+111${Date.now()}`,
        passwordHash: 'hash',
        role: 'PATIENT',
        fullName: 'Test P',
        patient: { create: { cnic: `p-${Date.now()}` } }
      },
      include: { patient: true }
    });

    nurseUser = await prisma.user.create({
      data: {
        email: `n-${Date.now()}@test.com`,
        phone: `+222${Date.now()}`,
        passwordHash: 'hash',
        role: 'NURSE',
        fullName: 'Test N',
        nurse: { create: { cnic: `n-${Date.now()}`, pncNumber: `pnc-${Date.now()}` } }
      },
      include: { nurse: true }
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: { endsWith: '@test.com' } } });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.visitQrToken.deleteMany();
    await prisma.visit.deleteMany();
    await prisma.contract.deleteMany();
    await prisma.offer.deleteMany();
    await prisma.marketplaceListing.deleteMany();
    await prisma.careRequest.deleteMany();

    careRequest = await prisma.careRequest.create({
      data: {
        patientId: patientUser.patient!.id,
        type: 'ONE_TIME',
        status: 'OPEN',
        scheduledAt: new Date('2023-01-01T00:00:00Z') // legacy scheduledAt that should NOT be used
      }
    });
  });

  it('Creates Visit with exact proposedStart from Offer', async () => {
    const listing = await prisma.marketplaceListing.create({ data: { careRequestId: careRequest.id, zone: 'A' } });
    const proposedStart = new Date('2026-10-10T14:30:00.000Z');
    
    const offer = await prisma.offer.create({
      data: { listingId: listing.id, nurseId: nurseUser.nurse!.id, price: 100, priceType: 'FIXED', proposedStart, expiresAt: new Date() }
    });

    const contract = await prisma.contract.create({
      data: { patientId: patientUser.patient!.id, nurseId: nurseUser.nurse!.id, sourceOfferId: offer.id, careRequestId: careRequest.id, price: 100, priceType: 'FIXED', scopeText: 'Test', status: 'ACTIVE', expiresAt: new Date() }
    });

    const visit = await usecase.execute(contract.id);

    expect(visit).toBeDefined();
    expect(visit.requestId).toBe(careRequest.id);
    expect(visit.nurseId).toBe(nurseUser.nurse!.id);
    expect(visit.status).toBe('SCHEDULED');
    
    // IMPORTANT: it MUST exactly equal the proposedStart, NOT the legacy scheduledAt, NOT new Date()
    expect(visit.agreedStartTime).toEqual(proposedStart);
    
    // Ensure QR token was created
    const qrToken = await prisma.visitQrToken.findUnique({ where: { visitId: visit.id } });
    expect(qrToken).toBeDefined();
    expect(qrToken?.status).toBe('PENDING');
  });

  it('Rejects if sourceOffer is missing entirely', async () => {
    const contract = await prisma.contract.create({
      data: { patientId: patientUser.patient!.id, nurseId: nurseUser.nurse!.id, careRequestId: careRequest.id, price: 100, priceType: 'FIXED', scopeText: 'Test', status: 'ACTIVE', expiresAt: new Date() }
    });

    await expect(usecase.execute(contract.id)).rejects.toThrow(/missing sourceOffer/);
  });

  it('Rejects if contract is not ACTIVE', async () => {
    const listing = await prisma.marketplaceListing.create({ data: { careRequestId: careRequest.id, zone: 'A' } });
    const offer = await prisma.offer.create({
      data: { listingId: listing.id, nurseId: nurseUser.nurse!.id, price: 100, priceType: 'FIXED', proposedStart: new Date(), expiresAt: new Date() }
    });

    const contract = await prisma.contract.create({
      data: { patientId: patientUser.patient!.id, nurseId: nurseUser.nurse!.id, sourceOfferId: offer.id, careRequestId: careRequest.id, price: 100, priceType: 'FIXED', scopeText: 'Test', status: 'PENDING_APPROVAL', expiresAt: new Date() }
    });

    await expect(usecase.execute(contract.id)).rejects.toThrow(/status is PENDING_APPROVAL/);
  });

  it('Idempotency: Prevents duplicate Visits (Repeated Event)', async () => {
    const listing = await prisma.marketplaceListing.create({ data: { careRequestId: careRequest.id, zone: 'A' } });
    const proposedStart = new Date('2026-10-10T14:30:00.000Z');
    const offer = await prisma.offer.create({
      data: { listingId: listing.id, nurseId: nurseUser.nurse!.id, price: 100, priceType: 'FIXED', proposedStart, expiresAt: new Date() }
    });
    const contract = await prisma.contract.create({
      data: { patientId: patientUser.patient!.id, nurseId: nurseUser.nurse!.id, sourceOfferId: offer.id, careRequestId: careRequest.id, price: 100, priceType: 'FIXED', scopeText: 'Test', status: 'ACTIVE', expiresAt: new Date() }
    });

    const visit1 = await usecase.execute(contract.id);
    const visit2 = await usecase.execute(contract.id);

    expect(visit1.id).toBe(visit2.id);

    const visitCount = await prisma.visit.count({ where: { requestId: careRequest.id } });
    const qrCount = await prisma.visitQrToken.count({ where: { visitId: visit1.id } });

    expect(visitCount).toBe(1);
    expect(qrCount).toBe(1);
  });

});
