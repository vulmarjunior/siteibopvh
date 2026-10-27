-- EBD Digital — Rev. 2 (ciclos de estudo e calendário)
--
-- Substitui o modelo em que `EbdQuarter` era a identidade do bloco de lições.
-- Não há migração de dados (decisão registrada em REVISAO_2_CICLOS.md):
-- a produção não tem conteúdo EBD publicado e o banco local tem apenas a
-- amostra de 2 lições da E2/E3/E4. As tabelas antigas são descartadas e o
-- schema nasce já no formato de edição + ciclo + agenda.

DO $$ BEGIN
  CREATE TYPE "EbdContentStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "EbdScheduleException" AS ENUM ('RULE', 'RESCHEDULED', 'NO_MEETING');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Reset do modelo anterior (E2–E4). Sem dados a preservar.
DROP TABLE IF EXISTS "EbdCycleLesson";
DROP TABLE IF EXISTS "EbdCycle";
DROP TABLE IF EXISTS "EbdPdfAsset";
DROP TABLE IF EXISTS "EbdLesson";
DROP TABLE IF EXISTS "EbdQuarter";
DROP TABLE IF EXISTS "EbdEdition";

CREATE TABLE "EbdEdition" (
  "id" TEXT NOT NULL,
  "publisher" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "quarter" INTEGER NOT NULL,
  "className" TEXT NOT NULL,
  "issue" INTEGER,
  "volume" INTEGER,
  "title" TEXT NOT NULL,
  "sourceFileName" TEXT,
  "sourceSha256" TEXT,
  "sourcePageCount" INTEGER,
  "sourceSizeBytes" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EbdEdition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EbdCycle" (
  "id" TEXT NOT NULL,
  "editionId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "className" TEXT NOT NULL,
  "startsOn" DATE NOT NULL,
  "weekday" INTEGER NOT NULL DEFAULT 0,
  "anchorRevision" INTEGER NOT NULL DEFAULT 1,
  "status" "EbdContentStatus" NOT NULL DEFAULT 'DRAFT',
  "publishedAt" TIMESTAMP(3),
  "publishedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EbdCycle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EbdLesson" (
  "id" TEXT NOT NULL,
  "editionId" TEXT NOT NULL,
  "number" INTEGER NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "baseText" TEXT NOT NULL,
  "startPage" INTEGER NOT NULL,
  "endPage" INTEGER NOT NULL,
  "introduction" JSONB NOT NULL,
  "sections" JSONB NOT NULL,
  "questions" JSONB NOT NULL,
  "dailyReadings" JSONB NOT NULL,
  "figures" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "status" "EbdContentStatus" NOT NULL DEFAULT 'DRAFT',
  "sourceHash" TEXT,
  "reviewedBy" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "publishedAt" TIMESTAMP(3),
  "publishedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EbdLesson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EbdCycleLesson" (
  "id" TEXT NOT NULL,
  "cycleId" TEXT NOT NULL,
  "lessonId" TEXT NOT NULL,
  "lessonNumber" INTEGER NOT NULL,
  "scheduledOn" DATE,
  "exceptionKind" "EbdScheduleException" NOT NULL DEFAULT 'RULE',
  "adjustedAtRevision" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EbdCycleLesson_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EbdPdfAsset" (
  "id" TEXT NOT NULL,
  "editionId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "fileName" TEXT NOT NULL,
  "storagePath" TEXT,
  "url" TEXT,
  "sha256" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "pageCount" INTEGER NOT NULL,
  "uploadedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EbdPdfAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EbdEdition_publisher_year_quarter_className_key"
  ON "EbdEdition"("publisher", "year", "quarter", "className");
CREATE INDEX "EbdEdition_year_quarter_idx" ON "EbdEdition"("year", "quarter");
CREATE UNIQUE INDEX "EbdCycle_slug_key" ON "EbdCycle"("slug");
CREATE INDEX "EbdCycle_editionId_status_idx" ON "EbdCycle"("editionId", "status");
CREATE INDEX "EbdCycle_status_startsOn_idx" ON "EbdCycle"("status", "startsOn");
CREATE UNIQUE INDEX "EbdLesson_slug_key" ON "EbdLesson"("slug");
CREATE UNIQUE INDEX "EbdLesson_editionId_number_key" ON "EbdLesson"("editionId", "number");
CREATE INDEX "EbdLesson_editionId_status_number_idx" ON "EbdLesson"("editionId", "status", "number");
CREATE UNIQUE INDEX "EbdCycleLesson_cycleId_lessonNumber_key"
  ON "EbdCycleLesson"("cycleId", "lessonNumber");
CREATE INDEX "EbdCycleLesson_lessonId_idx" ON "EbdCycleLesson"("lessonId");
CREATE UNIQUE INDEX "EbdPdfAsset_editionId_version_key" ON "EbdPdfAsset"("editionId", "version");
CREATE INDEX "EbdPdfAsset_editionId_createdAt_idx" ON "EbdPdfAsset"("editionId", "createdAt");

ALTER TABLE "EbdCycle"
  ADD CONSTRAINT "EbdCycle_editionId_fkey"
  FOREIGN KEY ("editionId") REFERENCES "EbdEdition"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EbdLesson"
  ADD CONSTRAINT "EbdLesson_editionId_fkey"
  FOREIGN KEY ("editionId") REFERENCES "EbdEdition"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EbdCycleLesson"
  ADD CONSTRAINT "EbdCycleLesson_cycleId_fkey"
  FOREIGN KEY ("cycleId") REFERENCES "EbdCycle"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EbdCycleLesson"
  ADD CONSTRAINT "EbdCycleLesson_lessonId_fkey"
  FOREIGN KEY ("lessonId") REFERENCES "EbdLesson"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EbdPdfAsset"
  ADD CONSTRAINT "EbdPdfAsset_editionId_fkey"
  FOREIGN KEY ("editionId") REFERENCES "EbdEdition"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EbdEdition" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EbdCycle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EbdLesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EbdCycleLesson" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EbdPdfAsset" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  REVOKE ALL ON TABLE "EbdEdition" FROM anon, authenticated;
  REVOKE ALL ON TABLE "EbdCycle" FROM anon, authenticated;
  REVOKE ALL ON TABLE "EbdLesson" FROM anon, authenticated;
  REVOKE ALL ON TABLE "EbdCycleLesson" FROM anon, authenticated;
  REVOKE ALL ON TABLE "EbdPdfAsset" FROM anon, authenticated;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;
