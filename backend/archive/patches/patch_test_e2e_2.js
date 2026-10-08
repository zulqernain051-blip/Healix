const fs = require('fs');
let code = fs.readFileSync('test_e2e.ts', 'utf8');

code = code.replace(
  `        await prisma.doctor.update({ where: { id: doctor.id }, data: { verificationStatus: 'VERIFIED' } });`,
  `        await prisma.doctor.update({ where: { id: doctor.id }, data: { verificationStatus: 'VERIFIED', isProfessional: true } });`
);

fs.writeFileSync('test_e2e.ts', code);
