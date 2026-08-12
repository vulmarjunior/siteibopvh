ALTER TABLE "EditorialMessage"
  ADD COLUMN "contentHtml" TEXT,
  ADD COLUMN "sourceSystem" TEXT,
  ADD COLUMN "externalId" TEXT,
  ADD COLUMN "lastSyncedAt" TIMESTAMPTZ;

CREATE UNIQUE INDEX "EditorialMessage_sourceSystem_externalId_key"
  ON "EditorialMessage"("sourceSystem", "externalId");
