-- Migration: 20261016000000_enforce_email_contracts
-- Preflight: verify no incompatible rows exist prior to applying enum constraints
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM "SuppressionList"
    WHERE "reason" NOT IN ('BOUNCE', 'COMPLAINT', 'UNSUBSCRIBE')
  ) THEN
    RAISE EXCEPTION 'Preflight check failed: Incompatible suppression reasons found in "SuppressionList". Manual remediation required before applying enum constraint.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM "OutboundEmailQueue"
    WHERE "status" NOT IN ('PENDING', 'RETRYING', 'DELIVERED', 'FAILED')
  ) THEN
    RAISE EXCEPTION 'Preflight check failed: Incompatible status values found in "OutboundEmailQueue". Manual remediation required before applying enum constraint.';
  END IF;
END $$;

-- CreateEnum
CREATE TYPE "SuppressionReason" AS ENUM ('BOUNCE', 'COMPLAINT', 'UNSUBSCRIBE');

-- CreateEnum
CREATE TYPE "OutboundEmailStatus" AS ENUM ('PENDING', 'RETRYING', 'DELIVERED', 'FAILED');

-- DropIndex: Remove redundant non-unique index on SuppressionList(email), preserving unique key
DROP INDEX IF EXISTS "SuppressionList_email_idx";

-- AlterTable: Safely cast reason column in SuppressionList using the new enum
ALTER TABLE "SuppressionList"
  ALTER COLUMN "reason" TYPE "SuppressionReason" USING ("reason"::"SuppressionReason");

-- AlterTable: Safely cast status column in OutboundEmailQueue using the new enum and update default
ALTER TABLE "OutboundEmailQueue"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "OutboundEmailStatus" USING ("status"::"OutboundEmailStatus"),
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"OutboundEmailStatus";
