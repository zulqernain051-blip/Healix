ALTER TABLE "visits" ADD COLUMN IF NOT EXISTS "completionApprovedAt" TIMESTAMP(3);
ALTER TABLE "visits" ADD COLUMN IF NOT EXISTS "completionDisputeReason" TEXT;
ALTER TABLE "visits" ADD COLUMN IF NOT EXISTS "sourceContractId" TEXT;
ALTER TABLE "contracts" ADD COLUMN IF NOT EXISTS "originalCareRequestId" TEXT;
