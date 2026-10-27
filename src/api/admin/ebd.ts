import express, { type Response } from 'express';
import type { Prisma, PrismaClient } from '@prisma/client';
import { createAdminAuthMiddleware, type AdminAuthenticatedRequest } from './auth.js';
import { getAdminAuthToken } from '../../lib/admin/authCookie.js';
import { hasAdminPermission } from '../../lib/admin/permissions.js';
import { ensureEbdSchema } from '../ebd-schema.js';
import {
  assertImportHash,
  lessonSlugFor,
  quarterSlugFor,
  validateEbdImport,
  type EbdImportPayload,
} from '../../lib/ebd/import.js';
import {
  normalizeDailyReadings,
  normalizeFigures,
  normalizeQuestions,
  normalizeSections,
  normalizeStringArray,
} from '../../lib/ebd/content.js';
import {
  MAX_EBD_PDF_BYTES,
  buildPdfStoragePath,
  createUploadTarget,
  isValidPdfStoragePath,
  isLocalEbdStorage,
  localPathForStoragePath,
  localPdfSize,
  resolveStoredPdf,
  saveLocalPdf,
  sha256Buffer,
  sha256File,
  verifyLocalUploadToken,
  verifySupabaseObject,
} from '../../lib/ebd/storage.js';

const MAX_PDF_BYTES = MAX_EBD_PDF_BYTES;
const SHA256 = /^[a-f0-9]{64}$/;

const text = (value: unknown, maxLength = 500): string => {
  const result = typeof value === 'string' ? value.trim() : '';
  return result.length > maxLength ? result.slice(0, maxLength) : result;
};

const integer = (value: unknown): number | null => {
  const number = typeof value === 'string' ? Number(value) : value;
  return typeof number === 'number' && Number.isInteger(number) ? number : null;
};

const param = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) || '';

const audit = async (
  prisma: PrismaClient,
  req: AdminAuthenticatedRequest,
  action: string,
  entity: string,
  entityId: string,
  data: Record<string, unknown> = {},
) => {
  try {
    await prisma.curadoriaAuditoria.create({
      data: {
        usuarioId: req.adminUser!.id,
        usuarioEmail: req.adminUser!.email,
        acao: action,
        entidade: entity,
        entidadeId: entityId,
        dados: data as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    console.error('[EBD admin] audit error:', error);
  }
};

const quarterDetailInclude = {
  lessons: {
    orderBy: { number: 'asc' },
    select: {
      id: true,
      number: true,
      slug: true,
      title: true,
      baseText: true,
      startPage: true,
      endPage: true,
      status: true,
      publishedAt: true,
      publishedBy: true,
      reviewedAt: true,
      updatedAt: true,
    },
  },
  pdfAssets: {
    orderBy: { version: 'desc' },
    select: {
      id: true,
      version: true,
      fileName: true,
      storagePath: true,
      sha256: true,
      sizeBytes: true,
      pageCount: true,
      uploadedBy: true,
      createdAt: true,
    },
  },
} satisfies Prisma.EbdQuarterInclude;

function sendPdf(res: Response, filePath: string) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="revista-ebd.pdf"');
  res.setHeader('Cache-Control', 'private, no-store');
  res.sendFile(filePath);
}

export function createAdminEbdRouter(prisma: PrismaClient) {
  const router = express.Router();

  router.use(createAdminAuthMiddleware(prisma));
  router.use((req: AdminAuthenticatedRequest, res, next) => {
    if (!req.adminUser || !hasAdminPermission(req.adminUser.role, 'ebd:manage')) {
      res.status(403).json({ error: 'Sem permissão para gerenciar a EBD Digital.' });
      return;
    }
    next();
  });
  router.use(async (_req, _res, next) => {
    await ensureEbdSchema(prisma);
    next();
  });
  router.use((_req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  });

  router.get('/quarters', async (_req, res) => {
    const quarters = await prisma.ebdQuarter.findMany({
      orderBy: [{ year: 'desc' }, { quarter: 'desc' }, { className: 'asc' }],
      include: {
        lessons: { select: { status: true } },
        pdfAssets: { select: { version: true } },
      },
    });
    res.json({
      quarters: quarters.map(({ lessons, pdfAssets, ...quarter }) => ({
        ...quarter,
        lessonCount: lessons.length,
        publishedLessonCount: lessons.filter((lesson) => lesson.status === 'PUBLISHED').length,
        pdfAssetCount: pdfAssets.length,
        latestPdfVersion: pdfAssets.reduce((max, asset) => Math.max(max, asset.version), 0),
      })),
    });
  });

  router.post('/quarters', async (req: AdminAuthenticatedRequest, res) => {
    const body = req.body ?? {};
    const year = integer(body.year);
    const quarterNumber = integer(body.quarter);
    const className = text(body.className, 80);
    const publisher = text(body.publisher, 160);
    const title = text(body.title, 200);
    const issue = body.issue == null || body.issue === '' ? null : integer(body.issue);
    const volume = body.volume == null || body.volume === '' ? null : integer(body.volume);

    if (year === null || year < 1900 || year > 2100) return res.status(400).json({ error: 'Informe um ano válido.' });
    if (quarterNumber === null || quarterNumber < 1 || quarterNumber > 4) return res.status(400).json({ error: 'Informe o trimestre de 1 a 4.' });
    if (!className || !publisher || !title) return res.status(400).json({ error: 'Informe turma, editora e título.' });
    if (issue !== null && (issue < 1 || issue > 9999)) return res.status(400).json({ error: 'Edição inválida.' });
    if (volume !== null && (volume < 1 || volume > 9999)) return res.status(400).json({ error: 'Volume inválido.' });

    const slug = quarterSlugFor(year, quarterNumber, className);
    const existing = await prisma.ebdQuarter.findUnique({ where: { slug }, select: { id: true } });
    if (existing) return res.status(409).json({ error: 'Já existe um trimestre com essa turma, ano e trimestre.' });

    const created = await prisma.ebdQuarter.create({
      data: {
        slug,
        year,
        quarter: quarterNumber,
        className,
        publisher,
        title,
        issue,
        volume,
        status: 'DRAFT',
      },
    });
    await audit(prisma, req, 'CRIAR_TRIMESTRE_EBD', 'EbdQuarter', created.id, {
      year,
      quarter: quarterNumber,
      className,
      slug,
    });
    const detail = await prisma.ebdQuarter.findUnique({ where: { id: created.id }, include: quarterDetailInclude });
    return res.status(201).json({ quarter: detail });
  });

  router.get('/quarters/:id', async (req, res) => {
    const id = param(req.params.id);
    const quarter = await prisma.ebdQuarter.findUnique({ where: { id }, include: quarterDetailInclude });
    if (!quarter) return res.status(404).json({ error: 'Trimestre não encontrado.' });
    return res.json({ quarter });
  });

  router.patch('/quarters/:id', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const existing = await prisma.ebdQuarter.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Trimestre não encontrado.' });

    const body = req.body ?? {};
    const publisher = body.publisher === undefined ? existing.publisher : text(body.publisher, 160);
    const title = body.title === undefined ? existing.title : text(body.title, 200);
    const issue = body.issue === undefined ? existing.issue : body.issue === null || body.issue === '' ? null : integer(body.issue);
    const volume = body.volume === undefined ? existing.volume : body.volume === null || body.volume === '' ? null : integer(body.volume);
    if (!publisher || !title) return res.status(400).json({ error: 'Editora e título são obrigatórios.' });
    if (issue !== null && (issue < 1 || issue > 9999)) return res.status(400).json({ error: 'Edição inválida.' });
    if (volume !== null && (volume < 1 || volume > 9999)) return res.status(400).json({ error: 'Volume inválido.' });

    const updated = await prisma.ebdQuarter.update({
      where: { id },
      data: { publisher, title, issue, volume },
      include: quarterDetailInclude,
    });
    await audit(prisma, req, 'ATUALIZAR_TRIMESTRE_EBD', 'EbdQuarter', id, {
      before: { publisher: existing.publisher, title: existing.title, issue: existing.issue, volume: existing.volume },
      after: { publisher, title, issue, volume },
    });
    return res.json({ quarter: updated });
  });

  router.post('/quarters/:id/pdf-upload', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const quarter = await prisma.ebdQuarter.findUnique({ where: { id } });
    if (!quarter) return res.status(404).json({ error: 'Trimestre não encontrado.' });

    const body = req.body ?? {};
    const fileName = text(body.fileName, 240);
    const sizeBytes = integer(body.sizeBytes);
    const pageCount = body.pageCount === undefined ? 0 : integer(body.pageCount);
    const sha256 = text(body.sha256, 64).toLowerCase();

    if (!fileName || !/\.pdf$/i.test(fileName)) return res.status(400).json({ error: 'Selecione um arquivo PDF.' });
    if (sizeBytes === null || sizeBytes < 1 || sizeBytes > MAX_PDF_BYTES) {
      return res.status(400).json({ error: 'O PDF deve ter no máximo 50 MB.' });
    }
    if (!SHA256.test(sha256)) return res.status(400).json({ error: 'Informe o SHA-256 do PDF.' });
    if (pageCount === null || pageCount < 0) return res.status(400).json({ error: 'Número de páginas inválido.' });

    const latest = await prisma.ebdPdfAsset.findFirst({
      where: { quarterId: id },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const version = (latest?.version ?? 0) + 1;

    try {
      const target = await createUploadTarget({
        quarterId: id,
        year: quarter.year,
        quarter: quarter.quarter,
        className: quarter.className,
        version,
        fileName,
        sizeBytes,
        sha256,
        pageCount,
        adminToken: getAdminAuthToken(req)?.token,
      });
      return res.json({ ...target, maxBytes: MAX_PDF_BYTES });
    } catch (error) {
      console.error('[EBD admin] upload target error:', error);
      return res.status(503).json({ error: error instanceof Error ? error.message : 'Upload indisponível no momento.' });
    }
  });

  router.put(
    '/local-upload',
    express.raw({ type: 'application/pdf', limit: '55mb' }),
    async (req: AdminAuthenticatedRequest, res) => {
      if (!isLocalEbdStorage()) return res.status(404).json({ error: 'Upload local indisponível.' });
      const payload = verifyLocalUploadToken(String(req.query.token || ''));
      if (!payload) return res.status(401).json({ error: 'URL de upload inválida ou expirada.' });
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) return res.status(400).json({ error: 'Envie o PDF.' });
      if (req.body.length > MAX_PDF_BYTES) return res.status(413).json({ error: 'O PDF deve ter no máximo 50 MB.' });
      if (req.body.length !== payload.sizeBytes) return res.status(400).json({ error: 'O tamanho do PDF não confere.' });
      if (req.body.subarray(0, 5).toString('ascii') !== '%PDF-') return res.status(400).json({ error: 'O arquivo enviado não é um PDF válido.' });

      const digest = sha256Buffer(req.body);
      if (digest !== payload.sha256) return res.status(400).json({ error: 'O hash do PDF não confere com o arquivo enviado.' });

      try {
        await saveLocalPdf(payload.path, req.body);
        return res.json({ success: true, mode: 'local', path: payload.path, sizeBytes: req.body.length, sha256: digest });
      } catch (error) {
        console.error('[EBD admin] local upload error:', error);
        return res.status(500).json({ error: 'Não foi possível gravar o PDF local.' });
      }
    },
  );

  router.post('/quarters/:id/pdf-assets', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const quarter = await prisma.ebdQuarter.findUnique({ where: { id } });
    if (!quarter) return res.status(404).json({ error: 'Trimestre não encontrado.' });

    const body = req.body ?? {};
    const version = integer(body.version);
    const storagePath = text(body.path, 500);
    const fileName = text(body.fileName, 240);
    const sizeBytes = integer(body.sizeBytes);
    const pageCount = integer(body.pageCount);
    const sha256 = text(body.sha256, 64).toLowerCase();

    if (version === null || version < 1) return res.status(400).json({ error: 'Versão inválida.' });
    if (!isValidPdfStoragePath(storagePath)) return res.status(400).json({ error: 'Caminho do PDF inválido.' });
    const expectedPath = buildPdfStoragePath(quarter.year, quarter.quarter, quarter.className, version);
    if (storagePath !== expectedPath) return res.status(400).json({ error: 'Caminho do PDF não corresponde à versão.' });
    if (!fileName || !/\.pdf$/i.test(fileName)) return res.status(400).json({ error: 'Nome do PDF inválido.' });
    if (sizeBytes === null || sizeBytes < 1 || sizeBytes > MAX_PDF_BYTES) return res.status(400).json({ error: 'Tamanho do PDF inválido.' });
    if (pageCount === null || pageCount < 0) return res.status(400).json({ error: 'Número de páginas inválido.' });
    if (!SHA256.test(sha256)) return res.status(400).json({ error: 'SHA-256 inválido.' });

    const existing = await prisma.ebdPdfAsset.findUnique({
      where: { quarterId_version: { quarterId: id, version } },
      select: { id: true },
    });
    if (existing) return res.status(409).json({ error: 'Essa versão do PDF já foi registrada.' });

    if (isLocalEbdStorage()) {
      const localPath = localPathForStoragePath(storagePath);
      if (!localPath) return res.status(400).json({ error: 'Caminho local inválido.' });
      const size = await localPdfSize(storagePath);
      if (size === null) return res.status(409).json({ error: 'O PDF ainda não foi enviado ao armazenamento local.' });
      if (size !== sizeBytes) return res.status(409).json({ error: 'O tamanho do PDF no armazenamento não confere.' });
      const digest = await sha256File(localPath);
      if (digest !== sha256) return res.status(409).json({ error: 'O hash do PDF no armazenamento não confere.' });
    } else {
      const found = await verifySupabaseObject(storagePath, sizeBytes);
      if (!found) return res.status(409).json({ error: 'O PDF não foi encontrado no Supabase Storage.' });
    }

    const created = await prisma.ebdPdfAsset.create({
      data: {
        quarterId: id,
        version,
        fileName,
        storagePath,
        sha256,
        sizeBytes,
        pageCount,
        uploadedBy: req.adminUser!.email,
      },
    });
    await audit(prisma, req, 'UPLOAD_PDF_EBD', 'EbdPdfAsset', created.id, {
      quarterId: id,
      version,
      fileName,
      sizeBytes,
      sha256,
    });
    return res.status(201).json({ asset: created });
  });

  router.get('/quarters/:id/pdf', async (req, res) => {
    const id = param(req.params.id);
    const assetId = text(req.query.assetId, 80);
    const quarter = await prisma.ebdQuarter.findUnique({ where: { id }, select: { id: true } });
    if (!quarter) return res.status(404).json({ error: 'Trimestre não encontrado.' });

    const asset = assetId
      ? await prisma.ebdPdfAsset.findFirst({ where: { id: assetId, quarterId: id } })
      : await prisma.ebdPdfAsset.findFirst({ where: { quarterId: id }, orderBy: { version: 'desc' } });
    if (!asset) return res.status(404).json({ error: 'Nenhum PDF cadastrado para este trimestre.' });

    const resolved = await resolveStoredPdf(asset);
    if (!resolved) return res.status(404).json({ error: 'PDF não encontrado no armazenamento.' });
    if (resolved.kind === 'file') return sendPdf(res, resolved.path);
    return res.redirect(302, resolved.url);
  });

  router.post('/quarters/:id/import', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const quarter = await prisma.ebdQuarter.findUnique({ where: { id } });
    if (!quarter) return res.status(404).json({ error: 'Trimestre não encontrado.' });

    const body = req.body ?? {};
    const payloadValue = body.data ?? body.payload;
    const validation = validateEbdImport(payloadValue);
    if (validation.ok === false) {
      return res.status(422).json({ error: 'O JSON não segue o esquema de importação.', details: validation.errors });
    }
    const data: EbdImportPayload = validation.data;

    if (data.edition.year !== quarter.year || data.edition.quarter !== quarter.quarter || data.edition.class !== quarter.className) {
      return res.status(400).json({ error: 'A edição do JSON não coincide com o trimestre cadastrado.' });
    }

    const assetId = text(body.assetId, 80);
    const asset = assetId
      ? await prisma.ebdPdfAsset.findFirst({ where: { id: assetId, quarterId: id } })
      : await prisma.ebdPdfAsset.findFirst({ where: { quarterId: id }, orderBy: { version: 'desc' } });
    if (!asset) return res.status(409).json({ error: 'Envie e registre o PDF antes de importar o JSON.' });

    const hashError = assertImportHash(data, asset.sha256);
    if (hashError) {
      return res.status(409).json({
        error: hashError,
        expectedHash: asset.sha256,
        receivedHash: data.source.sha256,
      });
    }
    if (data.source.size_bytes !== asset.sizeBytes) {
      return res.status(409).json({ error: 'O tamanho do PDF do JSON não confere com o arquivo enviado.' });
    }

    const warnings: string[] = [];
    const prepared = data.lessons.map((lesson) => {
      const sections = normalizeSections(lesson.sections);
      const questions = normalizeQuestions(lesson.questions);
      const dailyReadings = normalizeDailyReadings(lesson.daily_readings);
      const introduction = normalizeStringArray(lesson.introduction);
      if (introduction.length === 0) warnings.push(`Lição ${lesson.number}: introdução vazia.`);
      if (questions.length === 0) warnings.push(`Lição ${lesson.number}: sem perguntas.`);
      if (dailyReadings.length === 0) warnings.push(`Lição ${lesson.number}: sem leitura diária.`);
      return {
        ...lesson,
        introduction,
        sections,
        questions,
        dailyReadings,
      };
    });

    await prisma.$transaction(async (tx) => {
      await tx.ebdQuarter.update({
        where: { id },
        data: {
          publisher: data.edition.publisher,
          title: data.edition.title,
          issue: data.edition.issue ?? null,
          volume: data.edition.volume ?? null,
          sourceFileName: data.source.file_name,
          sourceSha256: data.source.sha256,
          sourcePageCount: data.source.page_count,
          sourceSizeBytes: data.source.size_bytes,
          status: 'REVIEW',
          publishedAt: null,
          publishedBy: null,
        },
      });

      for (const lesson of prepared) {
        const values: Prisma.EbdLessonUncheckedUpdateInput = {
          slug: lessonSlugFor(quarter.slug, lesson.number),
          title: lesson.title,
          baseText: lesson.base_text,
          startPage: lesson.start_page,
          endPage: lesson.end_page,
          introduction: lesson.introduction as Prisma.InputJsonValue,
          sections: lesson.sections as unknown as Prisma.InputJsonValue,
          questions: lesson.questions as unknown as Prisma.InputJsonValue,
          dailyReadings: lesson.dailyReadings as unknown as Prisma.InputJsonValue,
          figures: normalizeFigures(lesson.figures) as unknown as Prisma.InputJsonValue,
          status: 'DRAFT',
          sourceHash: data.source.sha256,
          reviewedBy: null,
          reviewedAt: null,
          publishedAt: null,
          publishedBy: null,
        };
        await tx.ebdLesson.upsert({
          where: { quarterId_number: { quarterId: id, number: lesson.number } },
          update: values,
          create: { ...values, quarterId: id, number: lesson.number } as Prisma.EbdLessonUncheckedCreateInput,
        });
      }

      await tx.ebdLesson.updateMany({
        where: {
          quarterId: id,
          number: { notIn: prepared.map((lesson) => lesson.number) },
          status: { not: 'ARCHIVED' },
        },
        data: { status: 'ARCHIVED', publishedAt: null, publishedBy: null },
      });

      await tx.ebdPdfAsset.update({
        where: { id: asset.id },
        data: { pageCount: data.source.page_count },
      });
    });

    await audit(prisma, req, 'IMPORTAR_TRIMESTRE_EBD', 'EbdQuarter', id, {
      quarterId: id,
      assetId: asset.id,
      version: asset.version,
      sha256: data.source.sha256,
      lessonCount: prepared.length,
    });

    const detail = await prisma.ebdQuarter.findUnique({ where: { id }, include: quarterDetailInclude });
    return res.json({
      quarter: detail,
      imported: prepared.length,
      warnings,
      assetId: asset.id,
      sha256: data.source.sha256,
    });
  });

  router.get('/lessons/:id', async (req, res) => {
    const id = param(req.params.id);
    const lesson = await prisma.ebdLesson.findUnique({
      where: { id },
      include: {
        quarter: {
          select: { id: true, slug: true, year: true, quarter: true, className: true, title: true, status: true },
        },
      },
    });
    if (!lesson) return res.status(404).json({ error: 'Lição não encontrada.' });
    const latestPdf = await prisma.ebdPdfAsset.findFirst({
      where: { quarterId: lesson.quarterId },
      orderBy: { version: 'desc' },
    });
    return res.json({
      lesson: {
        ...lesson,
        introduction: normalizeStringArray(lesson.introduction),
        sections: normalizeSections(lesson.sections),
        questions: normalizeQuestions(lesson.questions),
        dailyReadings: normalizeDailyReadings(lesson.dailyReadings),
        figures: normalizeFigures(lesson.figures),
      },
      latestPdf: latestPdf
        ? {
            id: latestPdf.id,
            version: latestPdf.version,
            fileName: latestPdf.fileName,
            sizeBytes: latestPdf.sizeBytes,
            pageCount: latestPdf.pageCount,
            uploadedBy: latestPdf.uploadedBy,
            createdAt: latestPdf.createdAt,
            sha256: latestPdf.sha256,
            storagePath: latestPdf.storagePath,
          }
        : null,
    });
  });

  router.patch('/lessons/:id', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const existing = await prisma.ebdLesson.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Lição não encontrada.' });

    const body = req.body ?? {};
    const title = body.title === undefined ? existing.title : text(body.title, 300);
    const baseText = body.baseText === undefined ? existing.baseText : text(body.baseText, 300);
    const startPage = body.startPage === undefined ? existing.startPage : integer(body.startPage);
    const endPage = body.endPage === undefined ? existing.endPage : integer(body.endPage);
    const introduction = body.introduction === undefined ? normalizeStringArray(existing.introduction) : normalizeStringArray(body.introduction);
    const sections = body.sections === undefined ? normalizeSections(existing.sections) : normalizeSections(body.sections);
    const questions = body.questions === undefined ? normalizeQuestions(existing.questions) : normalizeQuestions(body.questions);
    const dailyReadings = body.dailyReadings === undefined ? normalizeDailyReadings(existing.dailyReadings) : normalizeDailyReadings(body.dailyReadings);
    const figures = body.figures === undefined ? normalizeFigures(existing.figures) : normalizeFigures(body.figures);

    if (!title || !baseText) return res.status(400).json({ error: 'Título e texto base são obrigatórios.' });
    if (startPage === null || startPage < 1 || endPage === null || endPage < startPage) {
      return res.status(400).json({ error: 'Informe um intervalo de páginas válido.' });
    }
    if (sections.length === 0) return res.status(400).json({ error: 'A lição precisa de pelo menos uma seção.' });

    const updated = await prisma.ebdLesson.update({
      where: { id },
      data: {
        title,
        baseText,
        startPage,
        endPage,
        introduction: introduction as Prisma.InputJsonValue,
        sections: sections as unknown as Prisma.InputJsonValue,
        questions: questions as unknown as Prisma.InputJsonValue,
        dailyReadings: dailyReadings as unknown as Prisma.InputJsonValue,
        figures: figures as unknown as Prisma.InputJsonValue,
        status: 'DRAFT',
        publishedAt: null,
        publishedBy: null,
        reviewedBy: req.adminUser!.email,
        reviewedAt: new Date(),
      },
    });
    await audit(prisma, req, 'ATUALIZAR_LICAO_EBD', 'EbdLesson', id, {
      quarterId: existing.quarterId,
      status: 'DRAFT',
    });
    return res.json({ lesson: updated });
  });

  router.post('/lessons/:id/publish', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const existing = await prisma.ebdLesson.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Lição não encontrada.' });
    if (normalizeSections(existing.sections).length === 0) {
      return res.status(400).json({ error: 'A lição não tem seções válidas para publicar.' });
    }
    const updated = await prisma.ebdLesson.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date(), publishedBy: req.adminUser!.email },
    });
    await audit(prisma, req, 'PUBLICAR_LICAO_EBD', 'EbdLesson', id, {
      quarterId: existing.quarterId,
      number: existing.number,
    });
    return res.json({ lesson: updated });
  });

  router.post('/lessons/:id/unpublish', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const existing = await prisma.ebdLesson.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Lição não encontrada.' });
    const updated = await prisma.ebdLesson.update({
      where: { id },
      data: { status: 'DRAFT', publishedAt: null, publishedBy: null },
    });
    await audit(prisma, req, 'DESPUBLICAR_LICAO_EBD', 'EbdLesson', id, {
      quarterId: existing.quarterId,
      number: existing.number,
    });
    return res.json({ lesson: updated });
  });

  router.post('/quarters/:id/publish', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const quarter = await prisma.ebdQuarter.findUnique({ where: { id }, include: { lessons: true } });
    if (!quarter) return res.status(404).json({ error: 'Trimestre não encontrado.' });
    if (quarter.lessons.length === 0) return res.status(409).json({ error: 'Importe as lições antes de publicar o trimestre.' });
    const publishable = quarter.lessons.filter(
      (lesson) => lesson.status !== 'ARCHIVED' && normalizeSections(lesson.sections).length > 0,
    );
    if (publishable.length === 0) {
      return res.status(409).json({ error: 'Nenhuma lição válida para publicar neste trimestre.' });
    }

    const publishedAt = new Date();
    const publishedBy = req.adminUser!.email;
    await prisma.$transaction(async (tx) => {
      await tx.ebdQuarter.update({
        where: { id },
        data: { status: 'PUBLISHED', publishedAt, publishedBy },
      });
      for (const lesson of publishable) {
        await tx.ebdLesson.update({
          where: { id: lesson.id },
          data: { status: 'PUBLISHED', publishedAt, publishedBy },
        });
      }
    });
    await audit(prisma, req, 'PUBLICAR_TRIMESTRE_EBD', 'EbdQuarter', id, {
      publishedAt: publishedAt.toISOString(),
      lessonCount: quarter.lessons.length,
    });
    const detail = await prisma.ebdQuarter.findUnique({ where: { id }, include: quarterDetailInclude });
    return res.json({ quarter: detail });
  });

  router.post('/quarters/:id/unpublish', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const quarter = await prisma.ebdQuarter.findUnique({ where: { id }, select: { id: true } });
    if (!quarter) return res.status(404).json({ error: 'Trimestre não encontrado.' });
    const updated = await prisma.ebdQuarter.update({
      where: { id },
      data: { status: 'DRAFT', publishedAt: null, publishedBy: null },
      include: quarterDetailInclude,
    });
    await audit(prisma, req, 'DESPUBLICAR_TRIMESTRE_EBD', 'EbdQuarter', id, {});
    return res.json({ quarter: updated });
  });

  router.post('/quarters/:id/archive', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const quarter = await prisma.ebdQuarter.findUnique({ where: { id }, select: { id: true } });
    if (!quarter) return res.status(404).json({ error: 'Trimestre não encontrado.' });
    const updated = await prisma.ebdQuarter.update({
      where: { id },
      data: { status: 'ARCHIVED', publishedAt: null, publishedBy: null },
      include: quarterDetailInclude,
    });
    await audit(prisma, req, 'ARQUIVAR_TRIMESTRE_EBD', 'EbdQuarter', id, {});
    return res.json({ quarter: updated });
  });

  router.get('/quarters/:id/audit', async (req, res) => {
    const id = param(req.params.id);
    const rows = await prisma.curadoriaAuditoria.findMany({
      where: { entidade: { in: ['EbdQuarter', 'EbdLesson', 'EbdPdfAsset'] } },
      orderBy: { criadoEm: 'desc' },
      take: 200,
    });
    const filtered = rows.filter((row) => {
      if (row.entidade === 'EbdQuarter') return row.entidadeId === id;
      const data = row.dados as Record<string, unknown> | null;
      return data?.quarterId === id;
    });
    res.json({ audit: filtered.slice(0, 30) });
  });

  return router;
}
