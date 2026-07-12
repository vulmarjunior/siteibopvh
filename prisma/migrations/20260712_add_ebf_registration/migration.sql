CREATE TABLE "EbfRegistration" (
  "id" SERIAL NOT NULL,
  "childName" TEXT NOT NULL,
  "age" INTEGER NOT NULL,
  "colorGroup" TEXT NOT NULL,
  "guardianName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "visitor" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "cancelledAt" TIMESTAMP(3),
  CONSTRAINT "EbfRegistration_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "EbfRegistration_colorGroup_idx" ON "EbfRegistration"("colorGroup");
CREATE INDEX "EbfRegistration_createdAt_idx" ON "EbfRegistration"("createdAt");
