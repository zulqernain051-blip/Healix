const fs = require('fs');

let file = fs.readFileSync('src/domains/care/requests/care.repository.ts', 'utf8');

const methodsToRemove = [
  'createMedicationLog',
  'findMedicationLogs',
  'findActiveMedications',
  'findMedicationLogsInRange',
  'findMedicationById',
  'createVisit',
  'findVisitsHistory',
  'assignVisitProvider',
  'cancelVisitAndFutureOccurrences',
  'findVisitWithRequestAndPatient',
  'findVisitWithRequest',
  'createAssignmentLog'
];

methodsToRemove.forEach(name => {
  const rx = new RegExp(`  public static async ${name}\\([\\s\\S]*?\\n  \\}`, 'g');
  file = file.replace(rx, '');
});

// Also make sure to add TODO Phase 6 comments to createCareRequest for Payment and Marketplace.
// Let's add them before they are instantiated.
file = file.replace(
  "await tx.payment.create",
  "// TODO Phase 6: Extract into Finance bounded context after Event Bus introduction\n      await tx.payment.create"
);

file = file.replace(
  "await tx.marketplaceListing.create",
  "// TODO Phase 6: Extract into Marketplace bounded context after Event Bus introduction\n        await tx.marketplaceListing.create"
);

fs.writeFileSync('src/domains/care/requests/care.repository.ts', file);
