-- CreateTable
CREATE TABLE IF NOT EXISTS "SuppressionList" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuppressionList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "OutboundEmailQueue" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "replyTo" TEXT,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "text" TEXT,
    "tags" JSONB,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "nextRetryAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutboundEmailQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SuppressionList_email_key" ON "SuppressionList"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SuppressionList_email_idx" ON "SuppressionList"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OutboundEmailQueue_status_nextRetryAt_idx" ON "OutboundEmailQueue"("status", "nextRetryAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "OutboundEmailQueue_createdAt_idx" ON "OutboundEmailQueue"("createdAt");
