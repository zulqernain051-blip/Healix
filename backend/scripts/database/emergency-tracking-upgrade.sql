-- Additive upgrade for existing installations (the project uses Prisma db push).
ALTER TABLE "ambulance_dispatches" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "ambulance_dispatches" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;
ALTER TABLE "ambulance_dispatches" ADD COLUMN IF NOT EXISTS "locationUpdatedAt" TIMESTAMP(3);
ALTER TABLE "ambulance_dispatches" ADD COLUMN IF NOT EXISTS "etaUpdatedAt" TIMESTAMP(3);
UPDATE "hospitals" SET "capacityStatus" = 'AVAILABLE' WHERE "capacityStatus" = 'NORMAL';
UPDATE "hospitals" SET "affordabilityTier" = 'MEDIUM' WHERE "affordabilityTier" = 'STANDARD';
UPDATE "hospitals" SET "affordabilityTier" = 'HIGH' WHERE "affordabilityTier" = 'PREMIUM';
