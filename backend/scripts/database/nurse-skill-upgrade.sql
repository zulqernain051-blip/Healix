ALTER TABLE "nurse_specializations" ADD COLUMN IF NOT EXISTS "proficiencyRating" INTEGER CHECK ("proficiencyRating" BETWEEN 1 AND 5);
ALTER TABLE "nurse_specializations" ADD COLUMN IF NOT EXISTS "assessmentNotes" TEXT;
ALTER TABLE "nurse_specializations" ADD COLUMN IF NOT EXISTS "assessedBy" TEXT;
ALTER TABLE "nurse_specializations" ADD COLUMN IF NOT EXISTS "assessedAt" TIMESTAMP(3);
