const { io } = require('C:\\Users\\X9420\\.gemini\\antigravity\\brain\\1768a4e4-30dc-4c14-8e76-5720956cc326\\scratch\\node_modules\\socket.io-client');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function run() {
  const patientA = await prisma.user.findFirst({ where: { role: 'PATIENT' }});
  const token = jwt.sign({ id: patientA.id, role: patientA.role }, process.env.JWT_SECRET || 'secret');

  const socket = io('http://localhost:3000', {
    auth: { token },
    transports: ['websocket']
  });

  socket.on('connect', async () => {
    console.log('Socket connected successfully with ID:', socket.id);
    
    // Find thread
    const threads = await prisma.chatThread.findMany({ where: { OR: [{ participantAId: patientA.id }, { participantBId: patientA.id }] } });
    if (threads.length > 0) {
      const threadId = threads[0].id;
      socket.emit('join_thread', { threadId });
      
      socket.on('new_message', (msg) => {
        console.log('Received new message via socket:', msg.contentUrlOrText);
        socket.disconnect();
        process.exit(0);
      });

      // trigger REST
      const res = await fetch(`http://localhost:3000/api/v1/chat/threads/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contentType: 'TEXT', contentUrlOrText: 'Socket Test Message' })
      });
      const data = await res.json();
      console.log('REST POST result:', data.success ? 'PASS' : data.message);
    } else {
      console.log('No threads found for admin to test with.');
      socket.disconnect();
      process.exit(0);
    }
  });

  socket.on('connect_error', (err) => {
    console.error('Connection error:', err.message);
    process.exit(1);
  });

  setTimeout(() => {
    console.error('Connection timed out or message not received');
    process.exit(1);
  }, 5000);
}

run().catch(console.error);
