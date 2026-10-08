const fs = require('fs');
let code = fs.readFileSync('test_e2e.ts', 'utf8');

code = code.replace(
  `    res = await axios.get(\`\${BASE_URL}/doctors/queue\`, { headers: { Authorization: \`Bearer \${doctorToken}\` }});
    caseId = res.data.data.find(c => c.visitId === visitId)?.id;
    if (!caseId) {
      console.log(' Doctor queue:', res.data.data);
      throw new Error('Case not assigned to doctor');
    }`,
  `    res = await axios.get(\`\${BASE_URL}/doctors/queue/high-risk\`, { headers: { Authorization: \`Bearer \${doctorToken}\` }});
    caseId = res.data.data.find(c => c.visitId === visitId)?.id;
    if (!caseId) {
      console.log(' Doctor high-risk queue:', res.data.data);
      throw new Error('Case not assigned to doctor');
    }
    
    await axios.put(\`\${BASE_URL}/cases/\${caseId}/accept-emergency\`, {}, { headers: { Authorization: \`Bearer \${doctorToken}\` }});
    console.log(' Doctor accepted emergency case');`
);

fs.writeFileSync('test_e2e.ts', code);
