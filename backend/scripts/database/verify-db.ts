import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  console.log('--- START VERIFICATION ---');
  const outboxCount = await prisma.eventOutbox.count();
  console.log('EventOutbox rows:', outboxCount);
  
  const visits = await prisma.visit.findMany({ take: 1 });
  console.log('Visits found:', visits.length);
  console.log('Visit agreedStartTime exists?', Object.keys(visits[0] || {}).includes('agreedStartTime'));
  
  const listings = await prisma.marketplaceListing.count();
  console.log('MarketplaceListings found:', listings);

  const contracts = await prisma.contract.count();
  console.log('Contracts found:', contracts);
  console.log('--- END VERIFICATION ---');
}

run().finally(() => prisma.$disconnect());
