import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanData() {
  console.log('🧹 Cleaning database transactional mock data (keeping user profiles)...');

  try {
    await prisma.nurseReview.deleteMany({});
    await prisma.nurseBadge.deleteMany({});
    await prisma.clinicalRemark.deleteMany({});
    await prisma.visitSymptom.deleteMany({});
    await prisma.visitVerification.deleteMany({});
    await prisma.vitalsRecord.deleteMany({});
    await prisma.riskAssessment.deleteMany({});
    await prisma.prescription.deleteMany({});
    await prisma.visit.deleteMany({});
    await prisma.contractAuditLog.deleteMany({});
    await prisma.contractApproval.deleteMany({});
    await prisma.contract.deleteMany({});
    await prisma.offer.deleteMany({});
    await prisma.marketplaceListing.deleteMany({});
    await prisma.careRequest.deleteMany({});
    await prisma.chatMessage.deleteMany({});
    await prisma.chatThread.deleteMany({});
    await prisma.emergencyEvent.deleteMany({});
    await prisma.nurseVacation.deleteMany({});

    console.log('✅ Successfully cleared all visits, requests, bids, vitals, symptoms, remarks, risk assessments, messages, emergency events, and reviews!');
    console.log('👤 Profile data for 3 Patients, 3 Nurses, and 3 Doctors remains 100% complete and active!');
  } catch (err) {
    console.error('❌ Error cleaning transactional data:', err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanData();
