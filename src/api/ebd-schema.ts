import type { PrismaClient } from '@prisma/client';

let ebdTablesEnsured = false;

/**
 * Garante as tabelas do módulo EBD Digital em runtime.
 *
 * O deploy da Vercel não executa migrations; o primeiro acesso cria/atualiza o
 * schema de forma idempotente, como no módulo Dia das Crianças.
 */
export async function ensureEbdSchema(prisma: PrismaClient) {
  if (ebdTablesEnsured) return;

  try {
    await prisma.$executeRawUnsafe(`DO $$ BEGIN
      CREATE TYPE "EbdContentStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EbdQuarter" (
        "id" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "year" INTEGER NOT NULL,
        "quarter" INTEGER NOT NULL,
        "className" TEXT NOT NULL,
        "publisher" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "issue" INTEGER,
        "volume" INTEGER,
        "sourceFileName" TEXT,
        "sourceSha256" TEXT,
        "sourcePageCount" INTEGER,
        "sourceSizeBytes" INTEGER,
        "status" "EbdContentStatus" NOT NULL DEFAULT 'DRAFT',
        "publishedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "EbdQuarter_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EbdLesson" (
        "id" TEXT NOT NULL,
        "quarterId" TEXT NOT NULL,
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
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "EbdLesson_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "EbdPdfAsset" (
        "id" TEXT NOT NULL,
        "quarterId" TEXT NOT NULL,
        "version" INTEGER NOT NULL,
        "fileName" TEXT NOT NULL,
        "storagePath" TEXT,
        "url" TEXT,
        "sha256" TEXT NOT NULL,
        "sizeBytes" INTEGER NOT NULL,
        "pageCount" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "EbdPdfAsset_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EbdQuarter_slug_key" ON "EbdQuarter"("slug");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EbdQuarter_year_quarter_className_key" ON "EbdQuarter"("year", "quarter", "className");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EbdQuarter_status_year_quarter_idx" ON "EbdQuarter"("status", "year", "quarter");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EbdLesson_slug_key" ON "EbdLesson"("slug");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EbdLesson_quarterId_number_key" ON "EbdLesson"("quarterId", "number");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EbdLesson_quarterId_status_number_idx" ON "EbdLesson"("quarterId", "status", "number");`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "EbdPdfAsset_quarterId_version_key" ON "EbdPdfAsset"("quarterId", "version");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "EbdPdfAsset_quarterId_createdAt_idx" ON "EbdPdfAsset"("quarterId", "createdAt");`);

    await prisma.$executeRawUnsafe(`DO $$ BEGIN
      ALTER TABLE "EbdLesson"
        ADD CONSTRAINT "EbdLesson_quarterId_fkey"
        FOREIGN KEY ("quarterId") REFERENCES "EbdQuarter"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);
    await prisma.$executeRawUnsafe(`DO $$ BEGIN
      ALTER TABLE "EbdPdfAsset"
        ADD CONSTRAINT "EbdPdfAsset_quarterId_fkey"
        FOREIGN KEY ("quarterId") REFERENCES "EbdQuarter"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    await prisma.$executeRawUnsafe(`ALTER TABLE "EbdQuarter" ENABLE ROW LEVEL SECURITY;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "EbdLesson" ENABLE ROW LEVEL SECURITY;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "EbdPdfAsset" ENABLE ROW LEVEL SECURITY;`);
    try {
      await prisma.$executeRawUnsafe(`REVOKE ALL ON TABLE "EbdQuarter" FROM anon, authenticated;`);
      await prisma.$executeRawUnsafe(`REVOKE ALL ON TABLE "EbdLesson" FROM anon, authenticated;`);
      await prisma.$executeRawUnsafe(`REVOKE ALL ON TABLE "EbdPdfAsset" FROM anon, authenticated;`);
    } catch (error) {
      console.warn('[EBD] RLS revoke skipped:', error instanceof Error ? error.message : error);
    }

    ebdTablesEnsured = true;
  } catch (error) {
    console.error('[EBD] Auto-schema ensure error:', error);
  }
}
