const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function verifyCancelVoids() {
  // Find the most recently cancelled care request
  const cancelled = await p.careRequest.findFirst({
    where: { status: 'CANCELLED' },
    orderBy: { createdAt: 'desc' },
    include: {
      visit: true,
      payment: true,
      marketplaceListing: true
    }
  });

  if (!cancelled) {
    console.log('No cancelled requests found.');
    return;
  }

  console.log(`Checking CareRequest: ${cancelled.id}`);
  console.log(`  CareRequest Status: ${cancelled.status}`);
  console.log(`  Visit Status:       ${cancelled.visit?.status || 'NO VISIT'}`);
  console.log(`  Payment Status:     ${cancelled.payment?.status || 'NO PAYMENT'}`);
  console.log(`  Listing Status:     ${cancelled.marketplaceListing?.status || 'NO LISTING'}`);

  const visitOk = cancelled.visit?.status === 'CANCELLED' || !cancelled.visit;
  const paymentOk = cancelled.payment?.status === 'VOIDED' || !cancelled.payment;
  const listingOk = cancelled.marketplaceListing?.status === 'CLOSED' || !cancelled.marketplaceListing;

  console.log(`\n  ✅ Visit voided:   ${visitOk}`);
  console.log(`  ✅ Payment voided: ${paymentOk}`);
  console.log(`  ✅ Listing closed: ${listingOk}`);

  if (visitOk && paymentOk && listingOk) {
    console.log('\n🎉 Bug #4 Fix Verified: All associated records properly voided on cancellation!');
  } else {
    console.log('\n❌ Bug #4 NOT fully fixed - some records still in invalid state.');
  }
}

verifyCancelVoids().finally(() => p.$disconnect());
