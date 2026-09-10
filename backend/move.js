const fs = require("fs");
const file = fs.readFileSync("src/domains/care/requests/care.repository.ts", "utf8");

function extractMethod(methodName) {
  const match = file.match(new RegExp("  public static async " + methodName + "\\(.*?\\) \\{[\\s\\S]*?\\n  \\}"));
  return match ? match[0] : null;
}

const methods = [
  "createVisit",
  "findVisitsHistory",
  "assignVisitProvider",
  "findVisitById",
  "cancelVisitAndFutureOccurrences",
  "findVisitWithRequestAndPatient",
  "findVisitWithRequest",
  "createAssignmentLog",
  "findAvailableNurses",
  "findUserWithClinicalRoles"
];

const found = methods.map(extractMethod).filter(x => x).join("\n\n");
fs.writeFileSync("src/domains/care/visit/visit.repository.ts", fs.readFileSync("src/domains/care/visit/visit.repository.ts", "utf8").replace(/\}\s*$/, "") + "\n" + found + "\n}\n");
