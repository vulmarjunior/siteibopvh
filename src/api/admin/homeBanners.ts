import crypto from 'crypto';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import type { PrismaClient } from '@prisma/client';
import { createAdminAuthMiddleware, type AdminAuthenticatedRequest } from './auth.js';
import { hasAdminPermission } from '../../lib/admin/permissions.js';
import { getAdminAuthToken } from '../../lib/admin/authCookie.js';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const validLink = (value: string) => value.startsWith('/') || value.startsWith('#') || /^https:\/\//i.test(value);
const validImageUrl = (value: string) => value.startsWith('/') || /^https:\/\//i.test(value);
const STORAGE_PUBLIC_MARKER = '/storage/v1/object/public/site-assets/';

function toPortalImageUrl(imageUrl: string) {
  const markerIndex = imageUrl.indexOf(STORAGE_PUBLIC_MARKER);
  if (markerIndex < 0) return imageUrl;
  const storagePath = imageUrl.slice(markerIndex + STORAGE_PUBLIC_MARKER.length);
  return `/api/home-banners/image?object=${encodeURIComponent(storagePath)}`;
}

function slideData(body: any) {
  return {
    subtitle: text(body?.subtitle),
    title: text(body?.title),
    description: text(body?.description),
    ctaLabel: text(body?.ctaLabel),
    ctaLink: text(body?.ctaLink),
    imageUrl: text(body?.imageUrl),
    altText: text(body?.altText),
    position: Number(body?.position),
    active: Boolean(body?.active),
  };
}

function validateSlide(data: ReturnType<typeof slideData>) {
  if (!data.title || !data.subtitle || !data.description || !data.ctaLabel || !data.ctaLink || !data.imageUrl || !data.altText) {
    return 'Preencha todos os textos, o link e a imagem do banner.';
  }
  if ([data.title, data.subtitle, data.ctaLabel, data.altText].some((value) => value.length > 180) || data.description.length > 500) {
    return 'Um ou mais textos ultrapassam o limite permitido.';
  }
  if (!validLink(data.ctaLink)) return 'Use um link interno, uma âncora ou um endereço HTTPS.';
  if (!validImageUrl(data.imageUrl)) return 'Use uma imagem do portal ou um endereço HTTPS.';
  if (!Number.isInteger(data.position) || data.position < 0 || data.position > 999) return 'Informe uma posição válida.';
  return null;
}

export function createAdminHomeBannersRouter(prisma: PrismaClient) {
  const router = express.Router();
  router.use(createAdminAuthMiddleware(prisma));
  router.use((req: AdminAuthenticatedRequest, res, next) => hasAdminPermission(req.adminUser!.role, 'banners:manage')
    ? next()
    : res.status(403).json({ error: 'Sem permissão para gerenciar os banners.' }));

  router.get('/', async (_req, res) => {
    const slides = await prisma.homeBannerSlide.findMany({ orderBy: [{ position: 'asc' }, { createdAt: 'asc' }] });
    res.json(slides.map((slide) => ({ ...slide, imageUrl: toPortalImageUrl(slide.imageUrl) })));
  });

  router.post('/upload', express.raw({ type: Object.keys(IMAGE_TYPES), limit: MAX_IMAGE_BYTES }), async (req: AdminAuthenticatedRequest, res) => {
    const contentType = req.headers['content-type']?.split(';')[0] || '';
    const extension = IMAGE_TYPES[contentType];
    if (!extension || !Buffer.isBuffer(req.body) || req.body.length === 0) return res.status(400).json({ error: 'Selecione uma imagem JPG, PNG ou WebP.' });
    if (req.body.length > MAX_IMAGE_BYTES) return res.status(413).json({ error: 'A imagem deve ter no máximo 4 MB.' });

    const auth = getAdminAuthToken(req);
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    if (!auth || !supabaseUrl || !supabaseAnonKey) return res.status(503).json({ error: 'Não foi possível validar o envio da imagem.' });

    const path = `home-banners/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${auth.token}` } },
    });
    const { error } = await supabase.storage.from('site-assets').upload(path, req.body, { contentType, cacheControl: '31536000', upsert: false });
    if (error) {
      console.error('Home banner upload error:', error);
      return res.status(502).json({ error: 'Não foi possível enviar a imagem.' });
    }
    return res.status(201).json({ imageUrl: `/api/home-banners/image?object=${encodeURIComponent(path)}` });
  });

  router.post('/', async (req: AdminAuthenticatedRequest, res) => {
    const data = slideData(req.body);
    const error = validateSlide(data);
    if (error) return res.status(400).json({ error });
    const created = await prisma.homeBannerSlide.create({ data });
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: 'CRIAR_BANNER_HOME', entidade: 'HomeBannerSlide', entidadeId: created.id, dados: created } });
    return res.status(201).json(created);
  });

  router.put('/:id', async (req: AdminAuthenticatedRequest, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = slideData(req.body);
    const error = validateSlide(data);
    if (error) return res.status(400).json({ error });
    const before = await prisma.homeBannerSlide.findUnique({ where: { id } });
    if (!before) return res.status(404).json({ error: 'Banner não encontrado.' });
    const updated = await prisma.homeBannerSlide.update({ where: { id }, data });
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: 'ATUALIZAR_BANNER_HOME', entidade: 'HomeBannerSlide', entidadeId: id, dados: { before, after: updated } } });
    return res.json(updated);
  });

  router.delete('/:id', async (req: AdminAuthenticatedRequest, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const before = await prisma.homeBannerSlide.findUnique({ where: { id } });
    if (!before) return res.status(404).json({ error: 'Banner não encontrado.' });
    await prisma.homeBannerSlide.delete({ where: { id } });
    await prisma.curadoriaAuditoria.create({ data: { usuarioId: req.adminUser!.id, usuarioEmail: req.adminUser!.email, acao: 'EXCLUIR_BANNER_HOME', entidade: 'HomeBannerSlide', entidadeId: id, dados: before } });
    return res.json({ success: true });
  });

  return router;
}

export function createPublicHomeBannersRouter(prisma: PrismaClient) {
  const router = express.Router();
  router.get('/image', async (req, res) => {
    // `path` is reserved by the Vercel catch-all rewrite and is replaced with
    // the API route itself. Keep the storage object in a distinct parameter.
    const path = text(req.query.object);
    if (!/^home-banners\/[a-zA-Z0-9._/-]+$/.test(path) || path.includes('..')) return res.status(400).json({ error: 'Imagem inválida.' });
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    if (!supabaseUrl) return res.status(503).json({ error: 'Imagens temporariamente indisponíveis.' });
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    const upstream = await fetch(`${supabaseUrl}/storage/v1/object/public/site-assets/${encodedPath}`);
    if (!upstream.ok) {
      console.error('Home banner proxy error:', { path, status: upstream.status });
      return res.status(404).json({ error: 'Imagem não encontrada.' });
    }
    const contentType = upstream.headers.get('content-type') || (path.endsWith('.png') ? 'image/png' : path.endsWith('.webp') ? 'image/webp' : 'image/jpeg');
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    return res.send(Buffer.from(await upstream.arrayBuffer()));
  });

  router.get('/', async (_req, res) => {
    try {
      const slides = await prisma.homeBannerSlide.findMany({
        where: { active: true },
        select: { id: true, subtitle: true, title: true, description: true, ctaLabel: true, ctaLink: true, imageUrl: true, altText: true, position: true },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      });
      res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
      return res.json({ slides: slides.map((slide) => ({ ...slide, imageUrl: toPortalImageUrl(slide.imageUrl) })) });
    } catch (error) {
      console.error('Public home banners error:', error);
      return res.status(503).json({ slides: [] });
    }
  });
  return router;
}
