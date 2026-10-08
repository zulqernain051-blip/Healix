-- Existing managed/development accounts retain their current access.
-- Public and invited registrations explicitly require email verification.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerificationRequired" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
