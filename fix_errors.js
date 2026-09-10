const fs = require('fs');
function fix(f) {
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('import { AppError }')) {
    c = 'import { AppError } from \'../../../../../common/errors/AppError\';\nimport { HTTP_STATUS } from \'../../../../../common/constants/index\';\n' + c;
  }
  c = c.replace(/throw new Error\('([^']+not found[^']*)'\)/g, 'throw new AppError(\'\', HTTP_STATUS.NOT_FOUND)');
  c = c.replace(/throw new Error\('([^']+assigned[^']*)'\)/g, 'throw new AppError(\'\', HTTP_STATUS.FORBIDDEN)');
  c = c.replace(/throw new Error\('([^']+Only the patient[^']*)'\)/g, 'throw new AppError(\'\', HTTP_STATUS.FORBIDDEN)');
  c = c.replace(/throw new Error\('([^']+)'\)/g, 'throw new AppError(\'\', HTTP_STATUS.BAD_REQUEST)');
  c = c.replace(/throw new Error\(\([^\]+not found[^\]*)\\)/g, 'throw new AppError($1, HTTP_STATUS.NOT_FOUND)');
  c = c.replace(/throw new Error\(\([^\]+)\\)/g, 'throw new AppError($1, HTTP_STATUS.BAD_REQUEST)');
  fs.writeFileSync(f, c, 'utf8');
  console.log('Fixed', f);
}
fix('backend/src/domains/care/visit/verification/verification.service.ts');
fix('backend/src/domains/care/visit/visit.repository.ts');
