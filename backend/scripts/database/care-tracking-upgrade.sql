ALTER TABLE "care_plans" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;
CREATE TABLE IF NOT EXISTS "care_plan_versions" (
 "id" TEXT PRIMARY KEY, "carePlanId" TEXT NOT NULL REFERENCES "care_plans"("id") ON DELETE CASCADE,
 "version" INTEGER NOT NULL, "changedBy" TEXT NOT NULL, "reason" TEXT NOT NULL, "snapshot" JSONB NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE ("carePlanId", "version")
);
CREATE TABLE IF NOT EXISTS "medication_doses" (
 "id" TEXT PRIMARY KEY, "medicationId" TEXT NOT NULL REFERENCES "medications"("id") ON DELETE CASCADE,
 "scheduledAt" TIMESTAMP(3) NOT NULL, "status" TEXT NOT NULL DEFAULT 'PENDING', UNIQUE ("medicationId", "scheduledAt")
);
ALTER TABLE "medication_logs" ADD COLUMN IF NOT EXISTS "scheduledDoseId" TEXT REFERENCES "medication_doses"("id") ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "medication_logs_scheduledDoseId_key" ON "medication_logs"("scheduledDoseId");
