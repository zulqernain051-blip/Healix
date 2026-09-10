import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.caseAssignment.deleteMany({});
  await prisma.chatMessage.deleteMany({});
  await prisma.chatThread.deleteMany({});
  await prisma.assignmentLog.deleteMany({});
  await prisma.clinicalRemark.deleteMany({});
  await prisma.vitalsRecord.deleteMany({});
  await prisma.riskAssessment.deleteMany({});
  await prisma.visitQrToken.deleteMany({});
  await prisma.visit.deleteMany({});
  await prisma.contract.deleteMany({});
  await prisma.offer.deleteMany({});
  await prisma.marketplaceListing.deleteMany({});
  await prisma.careRequest.deleteMany({});
  await prisma.doctor.deleteMany({});
  await prisma.nurse.deleteMany({});
  await prisma.patient.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('CLEARED');
}
main().then(() => process.exit(0));
