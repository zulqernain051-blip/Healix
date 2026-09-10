import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Database Side Effects for Care Request...');
  
  const user = await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      phone: `0300${Math.floor(1000000 + Math.random() * 9000000)}`,
      passwordHash: 'dummy',
      fullName: 'Test User',
      role: 'PATIENT'
    }
  });

  const patient = await prisma.patient.create({
    data: {
      userId: user.id,
      cnic: '35201-' + Math.floor(Math.random() * 10000000) + '-1',
      address: 'Integration Test Address',
      latitude: 31.5204,
      longitude: 74.3587
    }
  });

  const requestData = {
    patientId: patient.id,
    type: 'NURSE_VISIT',
    scheduleType: 'RECURRING',
    preferredTimeWindow: 'MORNING',
    durationMinutes: 120,
    recurring: {
      startDate: new Date(Date.now() + 86400000),
      frequency: 'WEEKLY',
      occurrencesLimit: 4
    }
  };

  try {
    // 1. Manually instantiate UseCase
    // We import it here so we can call it
    const { CreateCareRequestUseCase } = require('./src/domains/care/requests/usecases/requests/create-care-request.usecase');
    const useCase = new CreateCareRequestUseCase();
    
    // We mock the PatientRepository.findPatientByUserId just for this script
    const { PatientRepository } = require('./src/domains/identity/patient/patient.repository');
    PatientRepository.findPatientByUserId = async () => patient;

    console.log('Executing Use Case...');
    const result = await useCase.execute(user.id, requestData);

    console.log('Created Care Request:', result.id);

    console.log('Testing Duplicate Request Protection...');
    let duplicateRejected = false;
    try {
      await useCase.execute(user.id, requestData);
    } catch (err: any) {
      if (err.message.includes('similar active care request already exists')) {
        duplicateRejected = true;
      } else {
        throw err;
      }
    }
    console.log(`Duplicate Request Rejected: ${duplicateRejected} (Expected: true)`);
    if (!duplicateRejected) throw new Error('Duplicate protection failed!');

    // 2. Audit Database Side Effects
    console.log('Auditing database side effects...');
    
    // Check if Visit was wrongly created
    const visitCount = await prisma.visit.count({ where: { requestId: result.id } });
    console.log(`Visits created: ${visitCount} (Expected: 0)`);
    if (visitCount > 0) throw new Error('Downstream leak: Visit was created!');

    // Check if Payment was wrongly created
    const paymentCount = await prisma.payment.count({ where: { requestId: result.id } });
    console.log(`Payments created: ${paymentCount} (Expected: 0)`);
    if (paymentCount > 0) throw new Error('Downstream leak: Payment was created!');

    // Check if MarketplaceListing was wrongly created
    const listingCount = await prisma.marketplaceListing.count({ where: { careRequestId: result.id } });
    console.log(`Marketplace Listings created: ${listingCount} (Expected: 0)`);
    if (listingCount > 0) throw new Error('Downstream leak: MarketplaceListing was created!');

    // Check RecurringPattern creation
    const pattern = await prisma.recurringPattern.findFirst({ where: { id: result.recurringPatternId } });
    console.log(`Recurring Pattern created: ${!!pattern} (Expected: true)`);
    if (!pattern) throw new Error('Recurring pattern was NOT created!');
    
    console.log('✅ Side Effect Audit Passed! No downstream leaks occurred.');
  } catch (error) {
    console.error('❌ Integration Test Failed:', error);
  } finally {
    // Cleanup
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.$disconnect();
  }
}

main();
