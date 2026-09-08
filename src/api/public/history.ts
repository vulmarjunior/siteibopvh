import express from 'express';
import type { PrismaClient } from '@prisma/client';

let historyTablesEnsured = false;
async function ensureHistoryTables(prisma: PrismaClient) {
  if (historyTablesEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ChurchPastorate" (
        "id" TEXT NOT NULL,
        "pastorName" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'Pastor Titular',
        "startYear" INTEGER NOT NULL,
        "endYear" INTEGER,
        "photoUrl" TEXT,
        "biography" TEXT NOT NULL,
        "keyMilestones" TEXT,
        "orderIndex" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ChurchPastorate_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ChurchPastorate_startYear_orderIndex_idx" ON "ChurchPastorate"("startYear", "orderIndex");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ChurchPastorate_active_idx" ON "ChurchPastorate"("active");`);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ChurchHistoryItem" (
        "id" TEXT NOT NULL,
        "year" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "imageUrl" TEXT,
        "category" TEXT NOT NULL,
        "source" TEXT,
        "orderIndex" INTEGER NOT NULL DEFAULT 0,
        "active" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "ChurchHistoryItem_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ChurchHistoryItem_year_category_idx" ON "ChurchHistoryItem"("year", "category");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ChurchHistoryItem_active_idx" ON "ChurchHistoryItem"("active");`);

    historyTablesEnsured = true;
  } catch (e) {
    console.error('[History] Auto-schema ensure error:', e);
  }
}

export function createPublicHistoryRouter(prisma: PrismaClient) {
  const router = express.Router();
  router.use(async (_req, _res, next) => {
    if (!historyTablesEnsured) {
      await ensureHistoryTables(prisma);
    }
    next();
  });

  // Buscar pastorados ativos da IBO
  router.get('/pastorates', async (_req, res) => {
    try {
      const pastorates = await prisma.churchPastorate.findMany({
        where: { active: true },
        orderBy: [{ startYear: 'asc' }, { orderIndex: 'asc' }],
      });
      res.json({ pastorates });
    } catch (error) {
      console.error('Erro ao buscar pastorados públicos:', error);
      res.status(500).json({ error: 'Erro ao carregar os pastorados' });
    }
  });

  // Buscar itens do acervo histórico ativos
  router.get('/items', async (_req, res) => {
    try {
      const items = await prisma.churchHistoryItem.findMany({
        where: { active: true },
        orderBy: [{ year: 'asc' }, { orderIndex: 'asc' }],
      });
      res.json({ items });
    } catch (error) {
      console.error('Erro ao buscar itens históricos públicos:', error);
      res.status(500).json({ error: 'Erro ao carregar acervo histórico' });
    }
  });

  return router;
}
