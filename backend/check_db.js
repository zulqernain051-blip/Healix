const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const patients = await prisma.patient.count();
    const nurses = await prisma.nurse.count();
    const requests = await prisma.careRequest.count();
    const listings = await prisma.marketplaceListing.count();
    const offers = await prisma.offer.count();
    const visits = await prisma.visit.count();
    const contracts = await prisma.contract.count();

    console.log('--- DATABASE STATUS ---');
    console.log('Patients:', patients);
    console.log('Nurses:', nurses);
    console.log('Care Requests:', requests);
    console.log('Marketplace Listings:', listings);
    console.log('Offers/Bids:', offers);
    console.log('Visits:', visits);
    console.log('Contracts:', contracts);

    const latestRequests = await prisma.careRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { include: { user: { select: { fullName: true } } } },
        marketplaceListing: true
      }
    });

    console.log('\n--- LATEST CARE REQUESTS ---');
    latestRequests.forEach(r => {
      console.log(`ID: ${r.id} | Patient: ${r.patient?.user?.fullName} | Status: ${r.status} | Has Listing: ${!!r.marketplaceListing}`);
    });

  } catch (err) {
    console.error('Error checking DB:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
