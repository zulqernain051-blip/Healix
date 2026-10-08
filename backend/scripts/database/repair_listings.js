const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function repair() {
  try {
    const pendingRequests = await prisma.careRequest.findMany({
      where: {
        type: 'NURSE_VISIT',
        status: { in: ['PENDING', 'OPEN', 'MARKETPLACE_BIDDING'] },
        marketplaceListing: null
      },
      include: {
        patient: true
      }
    });

    console.log(`Found ${pendingRequests.length} pending nurse visits lacking marketplace listings.`);

    for (const req of pendingRequests) {
      const zoneStr = req.patient?.address ? req.patient.address.split(',')[0] || 'Lahore' : 'Lahore';
      await prisma.marketplaceListing.create({
        data: {
          careRequestId: req.id,
          zone: zoneStr,
          status: 'OPEN'
        }
      });
      console.log(`Created MarketplaceListing for CareRequest ID: ${req.id}`);
    }

    console.log('Repair completed successfully.');

  } catch (err) {
    console.error('Error during repair:', err);
  } finally {
    await prisma.$disconnect();
  }
}

repair();
