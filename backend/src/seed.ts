import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding 3 Patients, 3 Nurses, and 3 Doctors...');

  const rawPassword = 'abc123$%';
  const passwordHash = await bcrypt.hash(rawPassword, 12);

  // ─────────────────────────────────────────────
  // 1. SEED 3 PATIENTS
  // ─────────────────────────────────────────────
  const patientData = [
    {
      email: 'patient1@gmail.com',
      phone: '+923001111111',
      fullName: 'Tariq Mahmood',
      cnic: '35202-1111111-1',
      dob: new Date('1985-04-12'),
      gender: 'MALE',
      address: 'House 42, Block C, Model Town, Lahore',
      latitude: 31.48,
      longitude: 74.32,
      emergencyContacts: [
        { name: 'Saima Tariq', phone: '+923001111112', relationship: 'Wife' },
      ],
      chronicConditions: [{ name: 'Hypertension', diagnosedDate: new Date('2020-01-15'), notes: 'Controlled with Meds' }],
      allergies: [{ allergen: 'Penicillin', severity: 'SEVERE' as const }],
    },
    {
      email: 'patient2@gmail.com',
      phone: '+923002222222',
      fullName: 'Ayesha Bibi',
      cnic: '35202-2222222-2',
      dob: new Date('1992-09-24'),
      gender: 'FEMALE',
      address: 'Flat 4B, Falcon Complex, Gulberg III, Lahore',
      latitude: 31.52,
      longitude: 74.35,
      emergencyContacts: [
        { name: 'Bilal Bibi', phone: '+923002222223', relationship: 'Brother' },
      ],
      chronicConditions: [{ name: 'Type 2 Diabetes', diagnosedDate: new Date('2021-06-10'), notes: 'Diet and Metformin' }],
      allergies: [{ allergen: 'Peanuts', severity: 'MODERATE' as const }],
    },
    {
      email: 'patient3@gmail.com',
      phone: '+923003333333',
      fullName: 'Usman Ghani',
      cnic: '35202-3333333-3',
      dob: new Date('1978-11-05'),
      gender: 'MALE',
      address: 'Street 12, Phase 5, DHA, Lahore',
      latitude: 31.47,
      longitude: 74.38,
      emergencyContacts: [
        { name: 'Zahra Ghani', phone: '+923003333334', relationship: 'Daughter' },
      ],
      chronicConditions: [{ name: 'Asthma', diagnosedDate: new Date('2018-03-20'), notes: 'Inhaler as needed' }],
      allergies: [{ allergen: 'Dust Mites', severity: 'MILD' as const }],
    },
  ];

  for (const p of patientData) {
    const existingUser = await prisma.user.findUnique({ where: { email: p.email } });
    if (existingUser) {
      console.log(`ℹ️  Updating existing patient: ${p.email}`);
      await prisma.user.update({
        where: { email: p.email },
        data: { passwordHash, status: 'ACTIVE' },
      });
      continue;
    }

    await prisma.user.create({
      data: {
        email: p.email,
        phone: p.phone,
        fullName: p.fullName,
        passwordHash,
        role: 'PATIENT',
        status: 'ACTIVE',
        patient: {
          create: {
            cnic: p.cnic,
            dob: p.dob,
            gender: p.gender,
            address: p.address,
            latitude: p.latitude,
            longitude: p.longitude,
            emergencyContacts: { create: p.emergencyContacts },
            chronicConditions: { create: p.chronicConditions },
            allergies: { create: p.allergies },
          },
        },
      },
    });
    console.log(`✅ Created Patient: ${p.email}`);
  }

  // ─────────────────────────────────────────────
  // 2. SEED 3 NURSES
  // ─────────────────────────────────────────────
  const nurseData = [
    {
      email: 'nurse1@gmail.com',
      phone: '+923011111111',
      fullName: 'Sadia Malik',
      cnic: '35202-4444444-4',
      pncNumber: 'PNC-N1001',
      licenseNumber: 'RN-88421',
      experience: 6,
      bio: 'Certified Registered Nurse specializing in wound care, post-op recovery, and diabetes monitoring.',
      photoUrl: 'https://images.unsplash.com/photo-1594824813566-88855ce78905',
      specializations: ['WOUND_CARE', 'DIABETES_CARE', 'ELDERLY_CARE'],
      qualifications: [
        { title: 'BS Nursing (BSN)', issuingBody: 'University of Health Sciences', yearObtained: 2018 },
        { title: 'Certified Wound Care Specialist', issuingBody: 'Pakistan Nursing Council', yearObtained: 2020 },
      ],
    },
    {
      email: 'nurse2@gmail.com',
      phone: '+923012222222',
      fullName: 'Fatima Noor',
      cnic: '35202-5555555-5',
      pncNumber: 'PNC-N1002',
      licenseNumber: 'RN-99312',
      experience: 8,
      bio: 'Senior Clinical Nurse practitioner with expertise in IV therapy, palliative care, and pediatric nursing.',
      photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2',
      specializations: ['IV_THERAPY', 'PALLIATIVE_CARE', 'PEDIATRIC_CARE'],
      qualifications: [
        { title: 'BSc Nursing Science', issuingBody: 'Aga Khan University', yearObtained: 2016 },
        { title: 'Diploma in Advanced IV Infusion', issuingBody: 'College of Nursing Lahore', yearObtained: 2019 },
      ],
    },
    {
      email: 'nurse3@gmail.com',
      phone: '+923013333333',
      fullName: 'Zainab Ahmed',
      cnic: '35202-6666666-6',
      pncNumber: 'PNC-N1003',
      licenseNumber: 'RN-77104',
      experience: 5,
      bio: 'Compassionate Home Care Nurse focused on elderly rehabilitation, maternal care, and general nursing.',
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d',
      specializations: ['ELDERLY_CARE', 'MATERNAL_CARE', 'GENERAL_NURSING'],
      qualifications: [
        { title: 'Bachelor of Science in Nursing', issuingBody: 'King Edward Medical University', yearObtained: 2019 },
      ],
    },
  ];

  for (const n of nurseData) {
    const existingUser = await prisma.user.findUnique({ where: { email: n.email } });
    if (existingUser) {
      console.log(`ℹ️  Updating existing nurse: ${n.email}`);
      await prisma.user.update({
        where: { email: n.email },
        data: { passwordHash, status: 'ACTIVE' },
      });
      continue;
    }

    await prisma.user.create({
      data: {
        email: n.email,
        phone: n.phone,
        fullName: n.fullName,
        passwordHash,
        role: 'NURSE',
        status: 'ACTIVE',
        nurse: {
          create: {
            cnic: n.cnic,
            pncNumber: n.pncNumber,
            licenseNumber: n.licenseNumber,
            experience: n.experience,
            bio: n.bio,
            photoUrl: n.photoUrl,
            available: true,
            verificationStatus: 'VERIFIED',
            verificationApprovedAt: new Date(),
            qualifications: { create: n.qualifications },
            specializations: {
              create: n.specializations.map(spec => ({ specialization: spec })),
            },
            availabilitySlots: {
              create: [
                { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
                { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
                { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
                { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
                { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
              ],
            },
            score: {
              create: {
                skillScore: 92,
                experienceScore: 88,
                reliabilityScore: 95,
                performanceScore: 90,
                compositeScore: 91.5,
                totalVisits: 45,
                avgRating: 4.9,
              },
            },
          },
        },
      },
    });
    console.log(`✅ Created Nurse: ${n.email}`);
  }

  // ─────────────────────────────────────────────
  // 3. SEED 3 DOCTORS
  // ─────────────────────────────────────────────
  const doctorData = [
    {
      email: 'doctor1@gmail.com',
      phone: '+923021111111',
      fullName: 'Dr. Shahzad Hassan',
      cnic: '35202-7777777-7',
      pmdcNumber: 'PMDC-99201-P',
      bio: 'Consultant Physician & Cardiologist with 12 years clinical experience in hospital & home consultation.',
    },
    {
      email: 'doctor2@gmail.com',
      phone: '+923022222222',
      fullName: 'Dr. Maria Farooq',
      cnic: '35202-8888888-8',
      pmdcNumber: 'PMDC-88312-P',
      bio: 'Senior Diabetologist & Endocrinologist specializing in chronic disease care management.',
    },
    {
      email: 'doctor3@gmail.com',
      phone: '+923023333333',
      fullName: 'Dr. Imran Qureshi',
      cnic: '35202-9999999-9',
      pmdcNumber: 'PMDC-77405-P',
      bio: 'General Practitioner & Emergency Medicine Specialist available for telemedicine and urgent home visits.',
    },
  ];

  for (const d of doctorData) {
    const existingUser = await prisma.user.findUnique({ where: { email: d.email } });
    if (existingUser) {
      console.log(`ℹ️  Updating existing doctor: ${d.email}`);
      await prisma.user.update({
        where: { email: d.email },
        data: { passwordHash, status: 'ACTIVE' },
      });
      continue;
    }

    await prisma.user.create({
      data: {
        email: d.email,
        phone: d.phone,
        fullName: d.fullName,
        passwordHash,
        role: 'DOCTOR',
        status: 'ACTIVE',
        doctor: {
          create: {
            cnic: d.cnic,
            pmdcNumber: d.pmdcNumber,
            bio: d.bio,
            verificationStatus: 'VERIFIED',
            verificationApprovedAt: new Date(),
          },
        },
      },
    });
    console.log(`✅ Created Doctor: ${d.email}`);
  }

  console.log('\n🎉 ALL 9 ACCOUNTS SEEDED SUCCESSFULLY!');
  console.log('🔑 Common Password for ALL users: abc123$%');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
