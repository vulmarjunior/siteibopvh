import express from 'express';
import type { PrismaClient } from '@prisma/client';

export function createPublicHistoryRouter(prisma: PrismaClient) {
  const router = express.Router();

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
