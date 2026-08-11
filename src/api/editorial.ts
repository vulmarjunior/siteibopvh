import express from 'express';
import type { PrismaClient } from '@prisma/client';
import { PrismaEditorialSeriesRepository } from '../lib/editorial/prismaRepository.js';
import { EditorialSeriesService } from '../lib/editorial/service.js';

export function createEditorialSeriesRouter(prisma: PrismaClient) {
  const router = express.Router();
  const service = new EditorialSeriesService(new PrismaEditorialSeriesRepository(prisma));

  router.get('/', async (_req, res) => {
    try { res.json({ series: await service.list() }); }
    catch (error) { console.error('Editorial series list error:', error); res.status(503).json({ error: 'Séries indisponíveis neste momento.' }); }
  });
  router.get('/:slug', async (req, res) => {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
      const series = await service.getBySlug(slug);
      if (!series) return res.status(404).json({ error: 'Série não encontrada.' });
      res.json(series);
    } catch (error) { console.error('Editorial series detail error:', error); res.status(503).json({ error: 'Série indisponível neste momento.' }); }
  });
  return router;
}
