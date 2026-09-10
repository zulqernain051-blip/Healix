const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDetails() {
  try {
    const patient = await prisma.patient.findFirst({
      include: {
        user: true,
        emergencyContacts: true,
        careRequests: true
      }
    });

    if (patient) {
      console.log('--- PATIENT DETAILS ---');
      console.log('Patient ID:', patient.id);
      console.log('Full Name:', patient.user.fullName);
      console.log('CNIC:', patient.cnic);
      console.log('Emergency Contacts Count:', patient.emergencyContacts.length);
      console.log('Care Requests Count:', patient.careRequests.length);
    } else {
      console.log('No patients found');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

checkDetails();
