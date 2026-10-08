ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "commissionAmount" DOUBLE PRECISION;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "commissionRecordedAt" TIMESTAMP(3);
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "commissionReference" TEXT;
CREATE TABLE IF NOT EXISTS "support_cases" (
 "id" TEXT PRIMARY KEY,"requestKey" TEXT NOT NULL UNIQUE,"patientId" TEXT NOT NULL,"kind" TEXT NOT NULL,
 "paymentId" TEXT,"visitId" TEXT,"amount" DOUBLE PRECISION,"status" TEXT NOT NULL DEFAULT 'OPEN',"reason" TEXT NOT NULL,
 "decisionNotes" TEXT,"externalReference" TEXT,"createdBy" TEXT NOT NULL,"handledBy" TEXT,"resolvedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "support_cases_patientId_status_idx" ON "support_cases"("patientId","status");
CREATE TABLE IF NOT EXISTS "role_permissions" (
 "role" "Role" NOT NULL,"feature" TEXT NOT NULL,"operation" TEXT NOT NULL,"allowed" BOOLEAN NOT NULL,
 "updatedBy" TEXT NOT NULL,"updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,PRIMARY KEY("role","feature","operation")
);
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "city" TEXT;
