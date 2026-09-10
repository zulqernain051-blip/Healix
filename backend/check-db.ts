import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  console.log('--- START ---');
  const duplicateOffers = await prisma.contract.groupBy({
    by: ['sourceOfferId'],
    having: { sourceOfferId: { _count: { gt: 1 } } },
    where: { sourceOfferId: { not: null } }
  });
  console.log('Duplicate sourceOfferIds:', duplicateOffers);

  const visits = await prisma.visit.findMany({ take: 5 });
  console.log('Sample visits count:', visits.length);

  const listings = await prisma.marketplaceListing.findMany({ take: 5 });
  console.log('Sample listings count:', listings.length);
  console.log('--- END ---');
}

run().finally(() => prisma.$disconnect());
