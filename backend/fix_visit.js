const fs = require('fs');

const careRepo = fs.readFileSync('src/domains/care/requests/care.repository.ts', 'utf8');
const visitRepo = fs.readFileSync('src/domains/care/visit/visit.repository.ts', 'utf8');

function extract(name) {
  const rx = new RegExp(`  public static async ${name}\\([\\s\\S]*?\\n  \\}`, 'g');
  const match = careRepo.match(rx);
  return match ? match[0] : '';
}

const methods = [
  'createVisit',
  'findVisitsHistory',
  'assignVisitProvider',
  'cancelVisitAndFutureOccurrences',
  'findVisitWithRequestAndPatient',
  'findVisitWithRequest',
  'createAssignmentLog'
];

let extracted = methods.map(extract).join('\n\n');

// Strip out my broken appended methods from visit.repository.ts
// We know my broken methods started after findUpcomingVisits.
const cleanVisitRepo = visitRepo.split('  public static async createVisit')[0].trim();

const newVisitRepo = cleanVisitRepo + '\n\n' + extracted + '\n}\n';

fs.writeFileSync('src/domains/care/visit/visit.repository.ts', newVisitRepo);
