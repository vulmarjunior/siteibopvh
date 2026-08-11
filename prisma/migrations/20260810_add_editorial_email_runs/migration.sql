CREATE TYPE "EditorialEmailRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'PARTIAL', 'FAILED');
CREATE TYPE "EditorialEmailDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

CREATE TABLE "EditorialEmailRun" (
  "id" TEXT NOT NULL,
  "seriesId" TEXT NOT NULL,
  "messageId" TEXT NOT NULL,
  "weekStart" TIMESTAMP(3) NOT NULL,
  "status" "EditorialEmailRunStatus" NOT NULL DEFAULT 'RUNNING',
  "recipientCount" INTEGER NOT NULL DEFAULT 0,
  "sentCount" INTEGER NOT NULL DEFAULT 0,
  "failedCount" INTEGER NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "error" TEXT,
  CONSTRAINT "EditorialEmailRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EditorialEmailDelivery" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "subscriberId" INTEGER NOT NULL,
  "status" "EditorialEmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "providerId" TEXT,
  "error" TEXT,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EditorialEmailDelivery_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EditorialEmailRun_seriesId_messageId_weekStart_key" ON "EditorialEmailRun"("seriesId", "messageId", "weekStart");
CREATE INDEX "EditorialEmailRun_seriesId_startedAt_idx" ON "EditorialEmailRun"("seriesId", "startedAt");
CREATE UNIQUE INDEX "EditorialEmailDelivery_runId_subscriberId_key" ON "EditorialEmailDelivery"("runId", "subscriberId");
CREATE INDEX "EditorialEmailDelivery_subscriberId_createdAt_idx" ON "EditorialEmailDelivery"("subscriberId", "createdAt");
CREATE INDEX "EditorialEmailDelivery_runId_status_idx" ON "EditorialEmailDelivery"("runId", "status");

ALTER TABLE "EditorialEmailRun" ADD CONSTRAINT "EditorialEmailRun_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "EditorialSeries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EditorialEmailRun" ADD CONSTRAINT "EditorialEmailRun_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "EditorialMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EditorialEmailDelivery" ADD CONSTRAINT "EditorialEmailDelivery_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EditorialEmailRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EditorialEmailDelivery" ADD CONSTRAINT "EditorialEmailDelivery_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "ReadingSubscriber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EditorialEmailRun" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EditorialEmailDelivery" ENABLE ROW LEVEL SECURITY;
