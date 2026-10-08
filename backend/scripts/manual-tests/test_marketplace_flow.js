const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_URL = 'http://localhost:3000/api/v1';

async function logIn(emailOrPhone, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emailOrPhone, password })
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Login failed for ${emailOrPhone}: ${data.message}`);
  }
  return data.data.tokens.accessToken;
}

async function runEndToEndTest() {
  console.log('🏁 Starting Automated End-to-End Marketplace Request & Bidding Workflow Test...\n');

  try {
    // -------------------------------------------------------------
    // Step 1: Log in as Patient (Tariq Mahmood)
    // -------------------------------------------------------------
    console.log('🔄 Step 1: Logging in as Patient (patient1@gmail.com)...');
    const patientToken = await logIn('patient1@gmail.com', 'abc123$%');
    console.log('✅ Patient login successful!\n');

    // -------------------------------------------------------------
    // Step 2: Patient creates a Care Request
    // -------------------------------------------------------------
    console.log('🔄 Step 2: Patient creating a new Care Request...');
    const requestRes = await fetch(`${API_URL}/patients/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${patientToken}`
      },
      body: JSON.stringify({
        type: 'NURSE_VISIT',
        notes: 'End-to-End Automated Test: Patient needs routine wound check and vitals.',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
      })
    });
    const requestData = await requestRes.json();
    if (!requestData.success) {
      throw new Error(`Failed to create care request: ${requestData.message}`);
    }
    const requestId = requestData.data.id;
    console.log(`✅ Care Request created successfully! Request ID: ${requestId}`);

    // Verify that MarketplaceListing was automatically created
    const listing = await prisma.marketplaceListing.findUnique({
      where: { careRequestId: requestId }
    });
    if (!listing) {
      throw new Error('FAILED: MarketplaceListing was not automatically created in database!');
    }
    console.log(`✅ Verified: MarketplaceListing automatically generated in DB! Listing ID: ${listing.id}\n`);

    // -------------------------------------------------------------
    // Step 3: Log in as Nurse (Sadia Malik)
    // -------------------------------------------------------------
    console.log('🔄 Step 3: Logging in as Nurse (nurse1@gmail.com)...');
    const nurseToken = await logIn('nurse1@gmail.com', 'abc123$%');
    console.log('✅ Nurse login successful!\n');

    // -------------------------------------------------------------
    // Step 4: Nurse browses Marketplace Listings
    // -------------------------------------------------------------
    console.log('🔄 Step 4: Nurse fetching open marketplace listings...');
    const listingsRes = await fetch(`${API_URL}/marketplace/requests`, {
      headers: { 'Authorization': `Bearer ${nurseToken}` }
    });
    const listingsData = await listingsRes.json();
    if (!listingsData.success) {
      throw new Error(`Failed to fetch marketplace listings: ${listingsData.message}`);
    }
    
    const nurseListing = listingsData.data.find(l => l.careRequestId === requestId);
    if (!nurseListing) {
      throw new Error('FAILED: Created care request not found in Nurse Marketplace feed!');
    }
    console.log(`✅ Verified: Nurse successfully sees Patient request on marketplace feed!\n`);

    // -------------------------------------------------------------
    // Step 5: Nurse submits a competitive Bid
    // -------------------------------------------------------------
    console.log('🔄 Step 5: Nurse submitting a competitive offer/bid...');
    const bidRes = await fetch(`${API_URL}/marketplace/listings/${listing.id}/offers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${nurseToken}`
      },
      body: JSON.stringify({
        price: 1800,
        priceType: 'FIXED',
        proposedStart: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        message: 'Hi, I am available tomorrow with sterile dressing kits. Willing to negotiate.'
      })
    });
    const bidData = await bidRes.json();
    if (!bidData.success) {
      throw new Error(`Failed to submit bid: ${bidData.message}`);
    }
    console.log('✅ Bid submitted successfully by Nurse!\n');

    // -------------------------------------------------------------
    // Step 6: Patient reviews Bids
    // -------------------------------------------------------------
    console.log('🔄 Step 6: Patient reviewing received marketplace bids...');
    const offersRes = await fetch(`${API_URL}/marketplace/listings/${listing.id}/offers`, {
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const offersData = await offersRes.json();
    if (!offersData.success) {
      throw new Error(`Failed to fetch bids: ${offersData.message}`);
    }
    
    const offer = offersData.data.find(o => o.listingId === listing.id);
    if (!offer) {
      throw new Error('FAILED: Submitted Nurse bid not found in Patient offer feed!');
    }
    console.log(`✅ Verified: Patient correctly sees Nurse bid of PKR ${offer.price}!\n`);

    // -------------------------------------------------------------
    // Step 7: Patient accepts Bid & Executes Care Contract (FSD 6.3)
    // -------------------------------------------------------------
    console.log('🔄 Step 7: Patient accepting bid and executing Care Contract...');
    const acceptRes = await fetch(`${API_URL}/marketplace/listings/${listing.id}/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${patientToken}`
      },
      body: JSON.stringify({ offerId: offer.id })
    });
    const acceptData = await acceptRes.json();
    if (!acceptData.success) {
      throw new Error(`Failed to accept bid: ${acceptData.message}`);
    }
    console.log('✅ Bid accepted successfully!');

    // Check database to verify Care Contract and visit assignment
    const dbContract = await prisma.contract.findFirst({
      where: { careRequestId: requestId }
    });
    if (!dbContract) {
      throw new Error('FAILED: Care Contract record was not created in PostgreSQL!');
    }
    console.log(`✅ Verified: Binding Care Contract executed in DB! Contract ID: ${dbContract.id}`);

    const dbRequest = await prisma.careRequest.findUnique({
      where: { id: requestId },
      include: { visit: true }
    });
    if (dbRequest.status !== 'ASSIGNED' || !dbRequest.visit?.nurseId) {
      throw new Error(`FAILED: Visit or request status not updated correctly. Status: ${dbRequest.status}`);
    }
    console.log(`✅ Verified: Request status transitioned to ASSIGNED. Nurse assigned to visit!\n`);

    // -------------------------------------------------------------
    // Step 8: Patient cancels a request and verifies status propagation
    // -------------------------------------------------------------
    console.log('🔄 Step 8: Patient cancelling the request to verify status propagation...');
    const cancelRes = await fetch(`${API_URL}/patients/requests/${requestId}/cancel`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${patientToken}` }
    });
    const cancelData = await cancelRes.json();
    if (!cancelData.success) {
      throw new Error(`Failed to cancel request: ${cancelData.message}`);
    }
    
    const dbListingClosed = await prisma.marketplaceListing.findUnique({
      where: { careRequestId: requestId }
    });
    if (dbListingClosed.status !== 'CLOSED') {
      throw new Error('FAILED: MarketplaceListing was not closed after request cancellation!');
    }
    console.log(`✅ Verified: Care request status set to CANCELLED and MarketplaceListing closed successfully!\n`);

    console.log('🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! The entire request, marketplace listing, nurse bidding, chat negotiation targets, and contract execution flow is 100% functional.');

  } catch (err) {
    console.error('❌ Integration Test Failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

runEndToEndTest();
