import type { PrismaClient } from '@prisma/client';

let ebdTablesEnsured = false;

/**
 * Garante as tabelas do módulo EBD Digital em runtime.
 *
 * O deploy da Vercel não executa migrations; o primeiro acesso cria/atualiza o
 * schema de forma idempotente, como no módulo Dia das Crianças.
 *
 * Rev. 2 (E5): `EbdQuarter` deixou de existir. Quando o ambiente ainda tem as
 * tabelas do modelo anterior (E2–E4), elas são descartadas uma única vez —
 * a Rev. 2 autoriza o reset porque não há conteúdo EBD em produção.
 */
export async function ensureEbdSchema(prisma: PrismaClient) {
  if (ebdTablesEnsured) return;

  try {
    await prisma.$executeRawUnsafe(`DO $$ BEGIN
      CREATE TYPE "EbdContentStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    await prisma.$executeRawUnsafe(`DO $$ BEGIN
      CREATE TYPE "EbdScheduleException" AS ENUM ('RULE', 'RESCHEDULED', 'NO_MEETING');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    const legacy = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'EbdLesson'
          AND column_name = 'quarterId'
      ) AS "exists"
    `);
    if (legacy[0]?.exists) {
      console.warn('[EBD] Modelo anterior (EbdQuarter) detectado; aplicando reset da Rev. 2.');
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "EbdCycleLesson";`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "EbdCycle";`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "EbdPdfAsset";`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "EbdLesson";`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "EbdQuarter";`);
      await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "EbdEdition";`);
    }

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EbdEdition" (
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
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EbdCycle" (
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
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EbdLesson" (
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
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EbdCycleLesson" (
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
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EbdPdfAsset" (
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
    `);

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EbdEdition_publisher_year_quarter_className_key" ON "EbdEdition"("publisher", "year", "quarter", "className");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EbdEdition_year_quarter_idx" ON "EbdEdition"("year", "quarter");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EbdCycle_slug_key" ON "EbdCycle"("slug");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EbdCycle_editionId_status_idx" ON "EbdCycle"("editionId", "status");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EbdCycle_status_startsOn_idx" ON "EbdCycle"("status", "startsOn");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EbdLesson_slug_key" ON "EbdLesson"("slug");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EbdLesson_editionId_number_key" ON "EbdLesson"("editionId", "number");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EbdLesson_editionId_status_number_idx" ON "EbdLesson"("editionId", "status", "number");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EbdCycleLesson_cycleId_lessonNumber_key" ON "EbdCycleLesson"("cycleId", "lessonNumber");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EbdCycleLesson_lessonId_idx" ON "EbdCycleLesson"("lessonId");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EbdPdfAsset_editionId_version_key" ON "EbdPdfAsset"("editionId", "version");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EbdPdfAsset_editionId_createdAt_idx" ON "EbdPdfAsset"("editionId", "createdAt");`);

    await prisma.$executeRawUnsafe(`DO $$ BEGIN
      ALTER TABLE "EbdCycle"
        ADD CONSTRAINT "EbdCycle_editionId_fkey"
        FOREIGN KEY ("editionId") REFERENCES "EbdEdition"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
    await prisma.$executeRawUnsafe(`DO $$ BEGIN
      ALTER TABLE "EbdLesson"
        ADD CONSTRAINT "EbdLesson_editionId_fkey"
        FOREIGN KEY ("editionId") REFERENCES "EbdEdition"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
    await prisma.$executeRawUnsafe(`DO $$ BEGIN
      ALTER TABLE "EbdCycleLesson"
        ADD CONSTRAINT "EbdCycleLesson_cycleId_fkey"
        FOREIGN KEY ("cycleId") REFERENCES "EbdCycle"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
    await prisma.$executeRawUnsafe(`DO $$ BEGIN
      ALTER TABLE "EbdCycleLesson"
        ADD CONSTRAINT "EbdCycleLesson_lessonId_fkey"
        FOREIGN KEY ("lessonId") REFERENCES "EbdLesson"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
    await prisma.$executeRawUnsafe(`DO $$ BEGIN
      ALTER TABLE "EbdPdfAsset"
        ADD CONSTRAINT "EbdPdfAsset_editionId_fkey"
        FOREIGN KEY ("editionId") REFERENCES "EbdEdition"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    await prisma.$executeRawUnsafe(`ALTER TABLE "EbdEdition" ENABLE ROW LEVEL SECURITY;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "EbdCycle" ENABLE ROW LEVEL SECURITY;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "EbdLesson" ENABLE ROW LEVEL SECURITY;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "EbdCycleLesson" ENABLE ROW LEVEL SECURITY;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "EbdPdfAsset" ENABLE ROW LEVEL SECURITY;`);
    try {
      await prisma.$executeRawUnsafe(`REVOKE ALL ON TABLE "EbdEdition" FROM anon, authenticated;`);
      await prisma.$executeRawUnsafe(`REVOKE ALL ON TABLE "EbdCycle" FROM anon, authenticated;`);
      await prisma.$executeRawUnsafe(`REVOKE ALL ON TABLE "EbdLesson" FROM anon, authenticated;`);
      await prisma.$executeRawUnsafe(`REVOKE ALL ON TABLE "EbdCycleLesson" FROM anon, authenticated;`);
      await prisma.$executeRawUnsafe(`REVOKE ALL ON TABLE "EbdPdfAsset" FROM anon, authenticated;`);
    } catch (error) {
      console.warn('[EBD] RLS revoke skipped:', error instanceof Error ? error.message : error);
    }

    ebdTablesEnsured = true;
  } catch (error) {
    console.error('[EBD] Auto-schema ensure error:', error);
  }
}
