const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.careRequest.findUnique({
  where: { id: '7271c9c9-c417-41de-a245-4a5c9fd3097a' },
  include: { marketplaceListing: true }
}).then(r => {
  console.log('Status:', r?.status);
  console.log('Type:', r?.type);
  console.log('Has Listing:', !!r?.marketplaceListing);
  console.log('Listing:', JSON.stringify(r?.marketplaceListing, null, 2));
  return p.$disconnect();
}).catch(e => {
  console.error(e);
  p.$disconnect();
});
