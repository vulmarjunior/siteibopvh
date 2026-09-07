import express from 'express';
import type { PrismaClient } from '@prisma/client';
import { createAdminAuthMiddleware, type AdminAuthenticatedRequest } from './auth.js';
import { hasAdminPermission } from '../../lib/admin/permissions.js';

const cleanString = (val: unknown) => typeof val === 'string' ? val.trim() : '';

export function createAdminHistoryRouter(prisma: PrismaClient) {
  const router = express.Router();
  router.use(createAdminAuthMiddleware(prisma));
  router.use((req: AdminAuthenticatedRequest, res, next) => {
    if (hasAdminPermission(req.adminUser!.role, 'history:manage')) {
      return next();
    }
    return res.status(403).json({ error: 'Sem permissão para gerenciar a história da igreja.' });
  });

  // --- PASTORADOS ---
  router.get('/pastorates', async (_req, res) => {
    try {
      const pastorates = await prisma.churchPastorate.findMany({
        orderBy: [{ startYear: 'asc' }, { orderIndex: 'asc' }],
      });
      res.json({ pastorates });
    } catch (error) {
      console.error('Erro ao buscar pastorados (admin):', error);
      res.status(500).json({ error: 'Erro ao carregar pastorados' });
    }
  });

  router.post('/pastorates', async (req, res) => {
    try {
      const pastorName = cleanString(req.body.pastorName);
      const role = cleanString(req.body.role) || 'Pastor Titular';
      const startYear = Number(req.body.startYear);
      const endYear = req.body.endYear ? Number(req.body.endYear) : null;
      const photoUrl = cleanString(req.body.photoUrl) || null;
      const biography = cleanString(req.body.biography);
      const keyMilestones = cleanString(req.body.keyMilestones) || null;
      const orderIndex = Number(req.body.orderIndex) || 0;
      const active = req.body.active !== false;

      if (!pastorName || !startYear || !biography) {
        return res.status(400).json({ error: 'Nome do pastor, ano de início e biografia são obrigatórios.' });
      }

      const pastorate = await prisma.churchPastorate.create({
        data: {
          pastorName,
          role,
          startYear,
          endYear,
          photoUrl,
          biography,
          keyMilestones,
          orderIndex,
          active,
        },
      });

      res.status(201).json({ pastorate });
    } catch (error) {
      console.error('Erro ao criar pastorado:', error);
      res.status(500).json({ error: 'Falha ao salvar pastorado' });
    }
  });

  router.put('/pastorates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const pastorName = cleanString(req.body.pastorName);
      const role = cleanString(req.body.role) || 'Pastor Titular';
      const startYear = Number(req.body.startYear);
      const endYear = req.body.endYear ? Number(req.body.endYear) : null;
      const photoUrl = cleanString(req.body.photoUrl) || null;
      const biography = cleanString(req.body.biography);
      const keyMilestones = cleanString(req.body.keyMilestones) || null;
      const orderIndex = Number(req.body.orderIndex) || 0;
      const active = req.body.active !== false;

      if (!pastorName || !startYear || !biography) {
        return res.status(400).json({ error: 'Nome do pastor, ano de início e biografia são obrigatórios.' });
      }

      const pastorate = await prisma.churchPastorate.update({
        where: { id },
        data: {
          pastorName,
          role,
          startYear,
          endYear,
          photoUrl,
          biography,
          keyMilestones,
          orderIndex,
          active,
        },
      });

      res.json({ pastorate });
    } catch (error) {
      console.error('Erro ao atualizar pastorado:', error);
      res.status(500).json({ error: 'Falha ao atualizar pastorado' });
    }
  });

  router.delete('/pastorates/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.churchPastorate.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao remover pastorado:', error);
      res.status(500).json({ error: 'Falha ao excluir pastorado' });
    }
  });

  // --- ACERVO & MARCOS HISTÓRICOS ---
  router.get('/items', async (_req, res) => {
    try {
      const items = await prisma.churchHistoryItem.findMany({
        orderBy: [{ year: 'asc' }, { orderIndex: 'asc' }],
      });
      res.json({ items });
    } catch (error) {
      console.error('Erro ao buscar itens históricos (admin):', error);
      res.status(500).json({ error: 'Erro ao carregar acervo histórico' });
    }
  });

  router.post('/items', async (req, res) => {
    try {
      const year = Number(req.body.year);
      const title = cleanString(req.body.title);
      const description = cleanString(req.body.description);
      const imageUrl = cleanString(req.body.imageUrl) || null;
      const category = cleanString(req.body.category) || 'FUNDACAO';
      const source = cleanString(req.body.source) || null;
      const orderIndex = Number(req.body.orderIndex) || 0;
      const active = req.body.active !== false;

      if (!year || !title || !description) {
        return res.status(400).json({ error: 'Ano, título e descrição são obrigatórios.' });
      }

      const item = await prisma.churchHistoryItem.create({
        data: {
          year,
          title,
          description,
          imageUrl,
          category,
          source,
          orderIndex,
          active,
        },
      });

      res.status(201).json({ item });
    } catch (error) {
      console.error('Erro ao criar item histórico:', error);
      res.status(500).json({ error: 'Falha ao salvar item histórico' });
    }
  });

  router.put('/items/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const year = Number(req.body.year);
      const title = cleanString(req.body.title);
      const description = cleanString(req.body.description);
      const imageUrl = cleanString(req.body.imageUrl) || null;
      const category = cleanString(req.body.category) || 'FUNDACAO';
      const source = cleanString(req.body.source) || null;
      const orderIndex = Number(req.body.orderIndex) || 0;
      const active = req.body.active !== false;

      if (!year || !title || !description) {
        return res.status(400).json({ error: 'Ano, título e descrição são obrigatórios.' });
      }

      const item = await prisma.churchHistoryItem.update({
        where: { id },
        data: {
          year,
          title,
          description,
          imageUrl,
          category,
          source,
          orderIndex,
          active,
        },
      });

      res.json({ item });
    } catch (error) {
      console.error('Erro ao atualizar item histórico:', error);
      res.status(500).json({ error: 'Falha ao atualizar item histórico' });
    }
  });

  router.delete('/items/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.churchHistoryItem.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao remover item histórico:', error);
      res.status(500).json({ error: 'Falha ao excluir item histórico' });
    }
  });

  return router;
}
