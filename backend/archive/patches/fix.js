const fs = require('fs');
let code = fs.readFileSync('prisma/schema.prisma');
let str = code.toString('utf8');
const badIndex = str.indexOf('\0m\0o\0d\0e\0l');
if (badIndex > -1) {
  str = str.substring(0, badIndex);
  str += 'model Paramedic {\n  id String @id @default(uuid())\n  userId String @unique\n  cnic String @unique\n  certificationNumber String @unique\n  verificationStatus String @default("PENDING")\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n  ambulanceDispatches AmbulanceDispatch[]\n\n  @@map("paramedics")\n}\n';
  fs.writeFileSync('prisma/schema.prisma', str);
}
