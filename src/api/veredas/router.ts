import express, { Response } from 'express';
import { PrismaClient, CuradoriaPapelUsuario, CuradoriaStatus, CuradoriaMotivoRelato, CuradoriaStatusRelato } from '@prisma/client';
import { ItemsService } from '../../lib/veredas/services/itemsService.js';
import { createAuthMiddleware, requireRole, VeredasAuthenticatedRequest } from './authMiddleware.js';
import { validateReportPayload, validateItemPayload, validateAccessPayload } from '../../lib/veredas/validation.js';
import { checkReportRateLimit, generateIpHash } from '../../lib/veredas/rateLimit.js';
import { parseYoutubeUrl } from '../../lib/veredas/youtube.js';
import { parseAmazonUrl } from '../../lib/veredas/amazon.js';
import { lookupBookByIsbn } from '../../lib/veredas/books.js';
import { generateSlug } from '../../lib/veredas/slug.js';
import { refreshAmazonAccessPrices } from '../../lib/veredas/amazonPrice.js';

export function createVeredasRouter(prisma: PrismaClient) {
  const router = express.Router();
  const itemsService = new ItemsService(prisma);
  const authMiddleware = createAuthMiddleware(prisma);

  // ==========================================
  // ROTAS PÚBLICAS (/api/veredas/*)
  // ==========================================

  // GET /api/veredas/items
  router.get('/items', async (req, res) => {
    try {
      const result = await itemsService.getPublicItems({
        q: req.query.q as string,
        tipo: req.query.tipo as any,
        categoria: req.query.categoria as string,
        nivel: req.query.nivel as any,
        pessoa: req.query.pessoa as string,
        gratuito: req.query.gratuito === 'true',
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 12,
      });

      res.json(result);
    } catch (err) {
      console.error('Error fetching public items:', err);
      res.status(500).json({ error: 'Erro ao buscar catálogo' });
    }
  });

  // GET /api/veredas/destaques
  router.get('/destaques', async (req, res) => {
    try {
      const result = await itemsService.getPublicItems({
        destaqueOnly: true,
        limit: 6,
      });

      res.json(result.items);
    } catch (err) {
      console.error('Error fetching destaques:', err);
      res.status(500).json({ error: 'Erro ao buscar destaques' });
    }
  });

  // GET /api/veredas/recentes
  router.get('/recentes', async (req, res) => {
    try {
      const result = await itemsService.getPublicItems({
        page: 1,
        limit: 8,
      });

      res.json(result.items);
    } catch (err) {
      console.error('Error fetching recentes:', err);
      res.status(500).json({ error: 'Erro ao buscar recentes' });
    }
  });

  // GET /api/veredas/items/:slug
  router.get('/items/:slug', async (req, res) => {
    try {
      let item = await itemsService.getPublicItemBySlug(req.params.slug);
      if (!item) {
        return res.status(404).json({ error: 'Conteúdo não encontrado ou não publicado' });
      }
      if (item.livro && !item.descricao) {
        const isbn = item.livro.isbn13 || item.livro.isbn10;
        if (isbn) {
          try {
            const lookup = await lookupBookByIsbn(isbn);
            const description = lookup.metadata?.description?.trim();
            if (description) {
              await prisma.curadoriaItem.update({
                where: { id: item.id },
                data: { descricao: description },
              });
              item = await itemsService.getPublicItemBySlug(req.params.slug);
            }
          } catch (metadataError) {
            console.warn('Could not backfill book synopsis:', metadataError);
          }
        }
      }
      if (item.livro?.acessos?.length) {
        try {
          const refreshed = await refreshAmazonAccessPrices(prisma, item.livro.acessos);
          if (refreshed) item = await itemsService.getPublicItemBySlug(req.params.slug);
        } catch (priceError) {
          console.warn('Could not refresh Amazon prices:', priceError);
        }
      }
      res.json(item);
    } catch (err) {
      console.error('Error fetching item by slug:', err);
      res.status(500).json({ error: 'Erro ao carregar detalhes do conteúdo' });
    }
  });

  // GET /api/veredas/categorias
  router.get('/categorias', async (req, res) => {
    try {
      const categorias = await prisma.curadoriaCategoria.findMany({
        where: { ativa: true },
        orderBy: [{ ordem: 'asc' }, { nome: 'asc' }],
      });
      res.json(categorias);
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ error: 'Erro ao carregar categorias' });
    }
  });

  // GET /api/veredas/pessoas/:slug
  router.get('/pessoas/:slug', async (req, res) => {
    try {
      const pessoa = await prisma.curadoriaPessoa.findUnique({
        where: { slug: req.params.slug },
      });

      if (!pessoa || !pessoa.ativa) {
        return res.status(404).json({ error: 'Autor ou expositor não encontrado' });
      }

      const items = await itemsService.getPublicItems({
        pessoa: pessoa.slug,
        limit: 20,
      });

      res.json({
        pessoa,
        items: items.items,
      });
    } catch (err) {
      console.error('Error fetching person detail:', err);
      res.status(500).json({ error: 'Erro ao carregar dados do autor' });
    }
  });

  // POST /api/veredas/acessos/:id/reportar (Reporte público de link quebrado)
  router.post('/acessos/:id/reportar', async (req, res) => {
    try {
      const acessoId = Number(req.params.id);
      const validation = validateReportPayload({ ...req.body, acessoId });

      if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
      }

      const acesso = await prisma.curadoriaAcesso.findUnique({
        where: { id: acessoId },
      });

      if (!acesso || !acesso.ativo) {
        return res.status(404).json({ error: 'Link de acesso não encontrado' });
      }

      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const ipHash = generateIpHash(clientIp.split(',')[0].trim());

      // Database-persisted rate limit check
      const rateLimitCheck = await checkReportRateLimit(prisma, ipHash, acessoId);
      if (!rateLimitCheck.allowed) {
        return res.status(429).json({ error: rateLimitCheck.reason });
      }

      const relato = await prisma.curadoriaLinkRelato.create({
        data: {
          acessoId,
          motivo: validation.data!.motivo,
          observacao: validation.data!.observacao || null,
          ipHash,
          userAgentResumido: req.headers['user-agent'] ? req.headers['user-agent'].substring(0, 150) : null,
          status: CuradoriaStatusRelato.PENDENTE,
        },
      });

      res.status(201).json({
        message: 'Obrigado por nos avisar. Nossa equipe verificará este link.',
        id: relato.id,
      });
    } catch (err) {
      console.error('Error reporting link:', err);
      res.status(500).json({ error: 'Erro ao enviar reporte de link' });
    }
  });

  // ==========================================
  // UTILS IMPORTADORES ASSISTIDOS (/api/veredas/admin/importar/*)
  // ==========================================

  router.use('/admin', authMiddleware, requireRole(CuradoriaPapelUsuario.CURADOR));

  router.post('/admin/importar/youtube', async (req, res) => {
    const { url } = req.body;
    const parsed = parseYoutubeUrl(url);

    if (!parsed.isValid) {
      return res.status(400).json({ error: parsed.error || 'URL inválida' });
    }

    try {
      const oembedResponse = await fetch(
        'https://www.youtube.com/oembed?format=json&url=' + encodeURIComponent(parsed.canonicalUrl!),
        { signal: AbortSignal.timeout(5000) },
      );
      if (oembedResponse.ok) {
        const metadata: any = await oembedResponse.json();
        return res.json({
          ...parsed,
          title: metadata.title || null,
          channel: metadata.author_name || null,
          thumbnailUrl: metadata.thumbnail_url || parsed.thumbnailUrl,
        });
      }
    } catch (error) {
      console.warn('YouTube oEmbed lookup failed:', error);
    }

    res.json(parsed);
  });

  router.post('/admin/importar/amazon', (req, res) => {
    const { url, affiliateTag } = req.body;
    const parsed = parseAmazonUrl(url, affiliateTag);

    if (!parsed.isValid) {
      return res.status(400).json({ error: parsed.error || 'URL inválida' });
    }

    res.json(parsed);
  });

  router.post('/admin/importar/isbn', async (req, res) => {
    const result = await lookupBookByIsbn(req.body?.isbn);

    if (!result.isValid) {
      return res.status(404).json({ error: result.error || 'Livro nao encontrado' });
    }

    res.json(result);
  });

  // ==========================================
  // ROTAS ADMINISTRATIVAS PROTEGIDAS (/api/veredas/admin/*)
  // ==========================================

  router.post('/admin/categorias', async (req, res) => {
    const nome = typeof req.body?.nome === 'string' ? req.body.nome.trim() : '';
    if (nome.length < 2 || nome.length > 60) {
      return res.status(400).json({ error: 'Informe um tema entre 2 e 60 caracteres' });
    }

    const slug = generateSlug(nome);
    const existing = await prisma.curadoriaCategoria.findFirst({
      where: {
        OR: [
          { slug },
          { nome: { equals: nome, mode: 'insensitive' } },
        ],
      },
    });

    if (existing) {
      const categoria = existing.ativa
        ? existing
        : await prisma.curadoriaCategoria.update({ where: { id: existing.id }, data: { ativa: true } });
      return res.json(categoria);
    }

    const categoria = await prisma.curadoriaCategoria.create({
      data: { nome, slug, ativa: true },
    });
    res.status(201).json(categoria);
  });

  // GET /api/veredas/admin/me (Verifica usuário atual)
  router.get('/admin/me', (req: VeredasAuthenticatedRequest, res: Response) => {
    res.json(req.veredasUser);
  });

  // GET /api/veredas/admin/dashboard
  router.get('/admin/dashboard', async (req, res) => {
    try {
      const [
        totalVideos,
        totalLivros,
        totalCursos,
        totalConferencias,
        rascunhos,
        arquivados,
        livrosGratuitos,
        relatosPendentes,
      ] = await Promise.all([
        prisma.curadoriaItem.count({ where: { tipo: 'VIDEO', status: 'PUBLICADO' } }),
        prisma.curadoriaItem.count({ where: { tipo: 'LIVRO', status: 'PUBLICADO' } }),
        prisma.curadoriaItem.count({ where: { tipo: 'CURSO', status: 'PUBLICADO' } }),
        prisma.curadoriaItem.count({ where: { tipo: 'CONFERENCIA', status: 'PUBLICADO' } }),
        prisma.curadoriaItem.count({ where: { status: 'RASCUNHO' } }),
        prisma.curadoriaItem.count({ where: { status: 'ARQUIVADO' } }),
        prisma.curadoriaAcesso.count({ where: { gratuito: true, ativo: true } }),
        prisma.curadoriaLinkRelato.count({ where: { status: 'PENDENTE' } }),
      ]);

      res.json({
        totalVideos,
        totalLivros,
        totalCursos,
        totalConferencias,
        rascunhos,
        arquivados,
        livrosGratuitos,
        relatosPendentes,
      });
    } catch (err) {
      console.error('Dashboard stats error:', err);
      res.status(500).json({ error: 'Erro ao carregar estatísticas do painel' });
    }
  });

  // GET /api/veredas/admin/items (Listagem completa para o painel admin)
  router.get('/admin/items', async (req, res) => {
    try {
      const { status, tipo } = req.query;
      const items = await itemsService.getAdminItems(status as string, tipo as string);
      res.json(items);
    } catch (err) {
      console.error('Error fetching admin items:', err);
      res.status(500).json({ error: 'Erro ao listar conteúdos administrativos' });
    }
  });

  // GET /api/veredas/admin/items/:id (Busca item específico por ID para edição)
  router.get('/admin/items/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      const item = await itemsService.getAdminItemById(id);
      if (!item) {
        return res.status(404).json({ error: 'Conteúdo não encontrado' });
      }
      res.json(item);
    } catch (err) {
      console.error('Error fetching admin item by id:', err);
      res.status(500).json({ error: 'Erro ao carregar conteúdo' });
    }
  });

  // DELETE /api/veredas/admin/items/:id (Exclusão de conteúdo)
  router.delete('/admin/items/:id', requireRole(CuradoriaPapelUsuario.ADMIN), async (req: VeredasAuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req.params.id);
      const deleted = await prisma.$transaction(async (tx) => {
        const item = await tx.curadoriaItem.delete({ where: { id } });
        await tx.curadoriaAuditoria.create({
          data: {
            usuarioId: req.veredasUser!.id,
            usuarioEmail: req.veredasUser!.email,
            acao: 'EXCLUIR',
            entidade: 'CuradoriaItem',
            entidadeId: String(id),
          },
        });
        return item;
      });

      res.json(deleted);
    } catch (err) {
      console.error('Error deleting admin item:', err);
      res.status(500).json({ error: 'Erro ao excluir conteúdo' });
    }
  });

  // POST /api/veredas/admin/items (Criação de Vídeo, Livro, Curso ou Conferência)
  router.post('/admin/items', async (req: VeredasAuthenticatedRequest, res: Response) => {
    try {
      const validation = validateItemPayload(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
      }

      const item = await itemsService.createAdminItem(req.body);

      // Log audit action
      await prisma.curadoriaAuditoria.create({
        data: {
          usuarioId: req.veredasUser!.id,
          usuarioEmail: req.veredasUser!.email,
          acao: 'CRIAR',
          entidade: 'CuradoriaItem',
          entidadeId: String(item.id),
          dados: { titulo: item.titulo, tipo: item.tipo, status: item.status },
        },
      });

      res.status(201).json(item);
    } catch (err) {
      console.error('Error creating admin item:', err);
      res.status(500).json({ error: 'Erro ao cadastrar novo conteúdo' });
    }
  });

  // PUT /api/veredas/admin/items/:id (Atualização de Vídeo, Livro, Curso ou Conferência)
  router.put('/admin/items/:id', async (req: VeredasAuthenticatedRequest, res: Response) => {
    try {
      const validation = validateItemPayload(req.body);
      if (!validation.isValid) {
        return res.status(400).json({ errors: validation.errors });
      }

      const id = Number(req.params.id);
      const item = await itemsService.updateAdminItem(id, req.body);
      if (!item) {
        return res.status(404).json({ error: 'Conteudo nao encontrado' });
      }

      await prisma.curadoriaAuditoria.create({
        data: {
          usuarioId: req.veredasUser!.id,
          usuarioEmail: req.veredasUser!.email,
          acao: 'EDITAR',
          entidade: 'CuradoriaItem',
          entidadeId: String(id),
          dados: { titulo: item.titulo, tipo: item.tipo, status: item.status },
        },
      });

      res.json(item);
    } catch (err) {
      console.error('Error updating admin item:', err);
      res.status(500).json({ error: 'Erro ao atualizar conteudo' });
    }
  });

  // POST /api/veredas/admin/items/:id/publicar
  router.post('/admin/items/:id/publicar', async (req: VeredasAuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req.params.id);
      const item = await prisma.$transaction(async (tx) => {
        const updated = await tx.curadoriaItem.update({
          where: { id },
          data: { status: CuradoriaStatus.PUBLICADO, publicadoEm: new Date(), arquivadoEm: null },
        });
        await tx.curadoriaAuditoria.create({
          data: {
            usuarioId: req.veredasUser!.id,
            usuarioEmail: req.veredasUser!.email,
            acao: 'PUBLICAR',
            entidade: 'CuradoriaItem',
            entidadeId: String(updated.id),
          },
        });
        return updated;
      });

      res.json(item);
    } catch (err) {
      console.error('Error publishing item:', err);
      res.status(500).json({ error: 'Erro ao publicar conteúdo' });
    }
  });

  // POST /api/veredas/admin/items/:id/arquivar
  router.post('/admin/items/:id/arquivar', async (req: VeredasAuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req.params.id);
      const item = await prisma.$transaction(async (tx) => {
        const updated = await tx.curadoriaItem.update({
          where: { id },
          data: { status: CuradoriaStatus.ARQUIVADO, arquivadoEm: new Date() },
        });
        await tx.curadoriaAuditoria.create({
          data: {
            usuarioId: req.veredasUser!.id,
            usuarioEmail: req.veredasUser!.email,
            acao: 'ARQUIVAR',
            entidade: 'CuradoriaItem',
            entidadeId: String(updated.id),
          },
        });
        return updated;
      });

      res.json(item);
    } catch (err) {
      console.error('Error archiving item:', err);
      res.status(500).json({ error: 'Erro ao arquivar conteúdo' });
    }
  });

  // GET /api/veredas/admin/relatos
  router.get('/admin/relatos', async (req, res) => {
    try {
      const relatos = await prisma.curadoriaLinkRelato.findMany({
        orderBy: { criadoEm: 'desc' },
        include: {
          acesso: {
            include: {
              livro: {
                include: {
                  item: true,
                },
              },
            },
          },
        },
      });
      res.json(relatos);
    } catch (err) {
      console.error('Error fetching admin reports:', err);
      res.status(500).json({ error: 'Erro ao carregar relatos de links' });
    }
  });

  // POST /api/veredas/admin/relatos/:id/resolver
  router.post('/admin/relatos/:id/resolver', async (req: VeredasAuthenticatedRequest, res: Response) => {
    try {
      const id = Number(req.params.id);
      const relato = await prisma.curadoriaLinkRelato.update({
        where: { id },
        data: {
          status: CuradoriaStatusRelato.RESOLVIDO,
          resolvidoEm: new Date(),
          resolvidoPor: req.veredasUser!.email,
          notaAdministrativa: req.body.notaAdministrativa || null,
        },
      });

      res.json(relato);
    } catch (err) {
      console.error('Error resolving report:', err);
      res.status(500).json({ error: 'Erro ao marcar relato como resolvido' });
    }
  });

  return router;
}
