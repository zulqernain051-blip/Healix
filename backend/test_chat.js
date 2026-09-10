const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_URL = 'http://localhost:3000/api/v1';

async function runTests() {
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }});
  const patientA = await prisma.user.findFirst({ where: { role: 'PATIENT' }});
  let patientB = await prisma.user.findFirst({ where: { role: 'PATIENT', id: { not: patientA?.id } }});
  
  if (!patientB) {
    patientB = admin; // fallback to admin for testing unauthorized thread creation
  }

  if (!patientA) {
    console.log("Need at least 1 patient");
    return;
  }

  const tokenA = jwt.sign({ id: patientA.id, role: patientA.role }, process.env.JWT_SECRET || 'secret');
  const tokenB = jwt.sign({ id: patientB.id, role: patientB.role }, process.env.JWT_SECRET || 'secret');
  
  // Test 4: Get threads (should be empty initially or just patientA's)
  let res = await fetch(`${API_URL}/chat/threads`, { headers: { Authorization: `Bearer ${tokenA}` }});
  let data = await res.json();
  console.log('Test 4 (Get patientA threads):', data.success ? 'PASS' : 'FAIL', data.data?.length);

  // Test 6: Unrelated users cannot create healthcare conversations
  res = await fetch(`${API_URL}/chat/threads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ participantId: patientB.id })
  });
  data = await res.json();
  console.log('Test 6 (Patient to Patient thread):', data.success === false ? 'PASS' : 'FAIL', data.message);

  // Let's find a valid nurse for Patient A
  const patientAModel = await prisma.patient.findUnique({ where: { userId: patientA.id }});
  const contract = await prisma.contract.findFirst({
    where: { patientId: patientAModel.id, status: 'ACTIVE' },
    include: { nurse: { include: { user: true } } }
  });
  
  if (contract && contract.nurse) {
    const nurseUser = contract.nurse.user;
    console.log("Found valid nurse for Patient A", nurseUser.id);
    const nurseToken = jwt.sign({ id: nurseUser.id, role: nurseUser.role }, process.env.JWT_SECRET || 'secret');
    
    // Create thread
    res = await fetch(`${API_URL}/chat/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ participantId: nurseUser.id })
    });
    data = await res.json();
    console.log('Create thread:', data.success ? 'PASS' : 'FAIL');
    const threadId = data.data.id;
    
    // Send message
    res = await fetch(`${API_URL}/chat/threads/${threadId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenA}` },
      body: JSON.stringify({ contentType: 'TEXT', contentUrlOrText: 'Hello Nurse!' })
    });
    data = await res.json();
    console.log('Send message:', data.success ? 'PASS' : 'FAIL');
    
    // Test 1: Patient B attempts to get Patient A's thread
    res = await fetch(`${API_URL}/chat/threads/${threadId}/messages`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    data = await res.json();
    console.log('Test 1 (Patient B gets A thread):', res.status === 403 ? 'PASS' : `FAIL (${res.status})`, data.message);
    
    // Test 2: Patient B attempts to send message to A's thread
    res = await fetch(`${API_URL}/chat/threads/${threadId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenB}` },
      body: JSON.stringify({ contentType: 'TEXT', contentUrlOrText: 'I am a hacker' })
    });
    data = await res.json();
    console.log('Test 2 (Patient B sends to A thread):', res.status === 403 ? 'PASS' : `FAIL (${res.status})`, data.message);
    
    // Test 5: Patient B requests Patient A's consolidated history
    res = await fetch(`${API_URL}/patients/${patientAModel.id}/communication-history`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    data = await res.json();
    console.log('Test 5 (Patient B gets A history):', res.status === 403 ? 'PASS' : `FAIL (${res.status})`, data.message);
    
    // Test 7: Mark read endpoint
    res = await fetch(`${API_URL}/chat/threads/${threadId}/messages/read`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${nurseToken}` }
    });
    data = await res.json();
    console.log('Test 7 (Nurse marks read):', data.success ? 'PASS' : 'FAIL', 'updated:', data.data?.updatedCount);
  } else {
    console.log("No valid nurse/patient relationship found for testing.");
  }
}

runTests().then(() => process.exit(0)).catch(console.error);
