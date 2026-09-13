const fs = require('fs');
const path = 'backend/src/domains/identity/patient/patient.controller.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /if \(user\.role === 'ADMIN'\) return;/g,
  "if (['ADMIN', 'NURSE', 'DOCTOR', 'PARAMEDIC'].includes(user.role)) return;"
);

fs.writeFileSync(path, code);
console.log('Fixed checkOwnership');
