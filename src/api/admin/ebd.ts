import express, { type Response } from 'express';
import type { Prisma, PrismaClient } from '@prisma/client';
import { createAdminAuthMiddleware, type AdminAuthenticatedRequest } from './auth.js';
import { getAdminAuthToken } from '../../lib/admin/authCookie.js';
import { hasAdminPermission } from '../../lib/admin/permissions.js';
import { ensureEbdSchema } from '../ebd-schema.js';
import {
  assertImportHash,
  cycleSlugFor,
  editionSlugFor,
  lessonSlugFor,
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
  civilDateFromDb,
  computeEbdSchedule,
  dbDateFromCivil,
  isCivilDate,
  isValidWeekday,
  type EbdCycleSchedule,
} from '../../lib/ebd/schedule.js';
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
const SCHEDULE_KINDS = new Set(['RULE', 'RESCHEDULED', 'NO_MEETING']);

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

const iso = (value: Date | null | undefined): string | null => (value ? value.toISOString() : null);

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

const editionRefSelect = {
  id: true,
  publisher: true,
  year: true,
  quarter: true,
  className: true,
  title: true,
  issue: true,
  volume: true,
} satisfies Prisma.EbdEditionSelect;

const lessonAdminSelect = {
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
} satisfies Prisma.EbdLessonSelect;

const scheduleRowSelect = {
  lessonNumber: true,
  exceptionKind: true,
  scheduledOn: true,
  adjustedAtRevision: true,
  lesson: { select: { status: true } },
} satisfies Prisma.EbdCycleLessonSelect;

const scheduleRowWithLessonSelect = {
  id: true,
  lessonNumber: true,
  exceptionKind: true,
  scheduledOn: true,
  adjustedAtRevision: true,
  lesson: { select: lessonAdminSelect },
} satisfies Prisma.EbdCycleLessonSelect;

const cycleDetailInclude = {
  edition: { select: editionRefSelect },
  schedule: {
    orderBy: { lessonNumber: 'asc' },
    select: scheduleRowWithLessonSelect,
  },
} satisfies Prisma.EbdCycleInclude;

type CycleDetailRow = Prisma.EbdCycleGetPayload<{ include: typeof cycleDetailInclude }>;

type ScheduleRow = Pick<
  Prisma.EbdCycleLessonGetPayload<{ select: typeof scheduleRowSelect }>,
  'lessonNumber' | 'exceptionKind' | 'scheduledOn' | 'adjustedAtRevision'
>;

function scheduleFor(
  cycle: { startsOn: Date; weekday: number; anchorRevision: number },
  rows: ReadonlyArray<ScheduleRow>,
): EbdCycleSchedule {
  const lessonCount = rows.reduce((max, row) => Math.max(max, row.lessonNumber), 0);
  return computeEbdSchedule({
    startsOn: civilDateFromDb(cycle.startsOn) ?? '',
    weekday: cycle.weekday,
    lessonCount: Math.max(1, lessonCount),
    anchorRevision: cycle.anchorRevision,
    exceptions: rows.map((row) => ({
      lessonNumber: row.lessonNumber,
      exceptionKind: row.exceptionKind,
      scheduledOn: civilDateFromDb(row.scheduledOn),
      adjustedAtRevision: row.adjustedAtRevision,
    })),
  });
}

function cyclePayload(cycle: CycleDetailRow) {
  const schedule = scheduleFor(cycle, cycle.schedule);
  const entryByNumber = new Map(schedule.entries.map((entry) => [entry.lessonNumber, entry]));

  return {
    id: cycle.id,
    editionId: cycle.editionId,
    slug: cycle.slug,
    className: cycle.className,
    startsOn: civilDateFromDb(cycle.startsOn),
    weekday: cycle.weekday,
    anchorRevision: cycle.anchorRevision,
    status: cycle.status,
    publishedAt: iso(cycle.publishedAt),
    publishedBy: cycle.publishedBy,
    createdAt: iso(cycle.createdAt),
    updatedAt: iso(cycle.updatedAt),
    edition: cycle.edition,
    periodLabel: schedule.periodLabel,
    firstDate: schedule.firstDate,
    lastDate: schedule.lastDate,
    lessons: cycle.schedule.map((row) => {
      const entry = entryByNumber.get(row.lessonNumber);
      return {
        ...row.lesson,
        lessonNumber: row.lessonNumber,
        publishedAt: iso(row.lesson.publishedAt),
        reviewedAt: iso(row.lesson.reviewedAt),
        updatedAt: iso(row.lesson.updatedAt),
        date: entry?.date ?? null,
        ruleDate: entry?.ruleDate ?? null,
        exceptionKind: row.exceptionKind,
        scheduledOn: civilDateFromDb(row.scheduledOn),
        divergesFromRule: entry?.divergesFromRule ?? false,
        sharesDateWith: entry?.sharesDateWith ?? [],
      };
    }),
  };
}

async function uniqueCycleSlug(prisma: PrismaClient, className: string, firstDate: string): Promise<string> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const slug = cycleSlugFor(className, firstDate, attempt);
    const existing = await prisma.ebdCycle.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) return slug;
  }
  throw new Error('Não foi possível gerar um slug único para o ciclo.');
}

async function syncCycleSchedules(
  tx: Prisma.TransactionClient,
  editionId: string,
): Promise<void> {
  const lessons = await tx.ebdLesson.findMany({
    where: { editionId, status: { not: 'ARCHIVED' } },
    orderBy: { number: 'asc' },
    select: { id: true },
  });
  const targetPosition = new Map(lessons.map((lesson, index) => [lesson.id, index + 1]));
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  const cycles = await tx.ebdCycle.findMany({ where: { editionId }, select: { id: true } });

  for (const cycle of cycles) {
    const rows = await tx.ebdCycleLesson.findMany({
      where: { cycleId: cycle.id },
      orderBy: { lessonNumber: 'asc' },
    });

    for (const row of rows) {
      if (!lessonIds.has(row.lessonId)) {
        await tx.ebdCycleLesson.delete({ where: { id: row.id } });
      }
    }

    const kept = rows.filter((row) => lessonIds.has(row.lessonId));
    const changed = kept.filter((row) => targetPosition.get(row.lessonId) !== row.lessonNumber);

    // Passagem negativa evita colisão com o índice único (cycleId, lessonNumber).
    for (const row of changed) {
      await tx.ebdCycleLesson.update({
        where: { id: row.id },
        data: { lessonNumber: -row.lessonNumber - 1000 },
      });
    }
    for (const row of changed) {
      await tx.ebdCycleLesson.update({
        where: { id: row.id },
        data: { lessonNumber: targetPosition.get(row.lessonId)! },
      });
    }

    const present = new Set(kept.map((row) => row.lessonId));
    for (const lesson of lessons) {
      if (present.has(lesson.id)) continue;
      await tx.ebdCycleLesson.create({
        data: { cycleId: cycle.id, lessonId: lesson.id, lessonNumber: targetPosition.get(lesson.id)! },
      });
    }
  }
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

  // ---------------------------------------------------------------- edições

  router.get('/editions', async (_req, res) => {
    const editions = await prisma.ebdEdition.findMany({
      orderBy: [{ year: 'desc' }, { quarter: 'desc' }, { className: 'asc' }],
      include: {
        lessons: { select: { status: true } },
        pdfAssets: { select: { version: true } },
        cycles: { select: { id: true, status: true } },
      },
    });
    res.json({
      editions: editions.map(({ lessons, pdfAssets, cycles, ...edition }) => ({
        ...edition,
        lessonCount: lessons.length,
        publishedLessonCount: lessons.filter((lesson) => lesson.status === 'PUBLISHED').length,
        pdfAssetCount: pdfAssets.length,
        latestPdfVersion: pdfAssets.reduce((max, asset) => Math.max(max, asset.version), 0),
        cycleCount: cycles.length,
        publishedCycleCount: cycles.filter((cycle) => cycle.status === 'PUBLISHED').length,
      })),
    });
  });

  router.post('/editions', async (req: AdminAuthenticatedRequest, res) => {
    const body = req.body ?? {};
    const year = integer(body.year);
    const quarterNumber = integer(body.quarter);
    const className = text(body.className, 80);
    const publisher = text(body.publisher, 160);
    const title = text(body.title, 200);
    const issue = body.issue == null || body.issue === '' ? null : integer(body.issue);
    const volume = body.volume == null || body.volume === '' ? null : integer(body.volume);

    if (year === null || year < 1900 || year > 2100) return res.status(400).json({ error: 'Informe um ano válido.' });
    if (quarterNumber === null || quarterNumber < 1 || quarterNumber > 4) return res.status(400).json({ error: 'Informe o trimestre editorial de 1 a 4.' });
    if (!className || !publisher || !title) return res.status(400).json({ error: 'Informe turma, editora e título.' });
    if (issue !== null && (issue < 1 || issue > 9999)) return res.status(400).json({ error: 'Edição inválida.' });
    if (volume !== null && (volume < 1 || volume > 9999)) return res.status(400).json({ error: 'Volume inválido.' });

    const existing = await prisma.ebdEdition.findUnique({
      where: {
        publisher_year_quarter_className: { publisher, year, quarter: quarterNumber, className },
      },
      select: { id: true },
    });
    if (existing) return res.status(409).json({ error: 'Já existe uma edição dessa editora, ano, trimestre e turma.' });

    const created = await prisma.ebdEdition.create({
      data: { publisher, year, quarter: quarterNumber, className, title, issue, volume },
    });
    await audit(prisma, req, 'CRIAR_EDICAO_EBD', 'EbdEdition', created.id, {
      year,
      quarter: quarterNumber,
      className,
      title,
    });
    return res.status(201).json({ edition: created });
  });

  router.get('/editions/:id', async (req, res) => {
    const id = param(req.params.id);
    const edition = await prisma.ebdEdition.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { number: 'asc' }, select: lessonAdminSelect },
        pdfAssets: { orderBy: { version: 'desc' } },
        cycles: {
          orderBy: { startsOn: 'desc' },
          include: {
            schedule: { select: scheduleRowSelect },
            edition: { select: editionRefSelect },
          },
        },
      },
    });
    if (!edition) return res.status(404).json({ error: 'Edição não encontrada.' });

    return res.json({
      edition: {
        ...edition,
        cycles: edition.cycles.map((cycle) => {
          const schedule = scheduleFor(cycle, cycle.schedule);
          return {
            id: cycle.id,
            slug: cycle.slug,
            className: cycle.className,
            startsOn: civilDateFromDb(cycle.startsOn),
            weekday: cycle.weekday,
            anchorRevision: cycle.anchorRevision,
            status: cycle.status,
            publishedAt: iso(cycle.publishedAt),
            periodLabel: schedule.periodLabel,
            lessonCount: cycle.schedule.length,
          };
        }),
      },
    });
  });

  router.patch('/editions/:id', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const existing = await prisma.ebdEdition.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Edição não encontrada.' });

    const body = req.body ?? {};
    const publisher = body.publisher === undefined ? existing.publisher : text(body.publisher, 160);
    const title = body.title === undefined ? existing.title : text(body.title, 200);
    const issue = body.issue === undefined ? existing.issue : body.issue === null || body.issue === '' ? null : integer(body.issue);
    const volume = body.volume === undefined ? existing.volume : body.volume === null || body.volume === '' ? null : integer(body.volume);
    if (!publisher || !title) return res.status(400).json({ error: 'Editora e título são obrigatórios.' });
    if (issue !== null && (issue < 1 || issue > 9999)) return res.status(400).json({ error: 'Edição inválida.' });
    if (volume !== null && (volume < 1 || volume > 9999)) return res.status(400).json({ error: 'Volume inválido.' });

    const updated = await prisma.ebdEdition.update({
      where: { id },
      data: { publisher, title, issue, volume },
    });
    await audit(prisma, req, 'ATUALIZAR_EDICAO_EBD', 'EbdEdition', id, {
      before: { publisher: existing.publisher, title: existing.title, issue: existing.issue, volume: existing.volume },
      after: { publisher, title, issue, volume },
    });
    return res.json({ edition: updated });
  });

  router.post('/editions/:id/pdf-upload', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const edition = await prisma.ebdEdition.findUnique({ where: { id } });
    if (!edition) return res.status(404).json({ error: 'Edição não encontrada.' });

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
      where: { editionId: id },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const version = (latest?.version ?? 0) + 1;

    try {
      const target = await createUploadTarget({
        editionId: id,
        year: edition.year,
        quarter: edition.quarter,
        className: edition.className,
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

  router.post('/editions/:id/pdf-assets', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const edition = await prisma.ebdEdition.findUnique({ where: { id } });
    if (!edition) return res.status(404).json({ error: 'Edição não encontrada.' });

    const body = req.body ?? {};
    const version = integer(body.version);
    const storagePath = text(body.path, 500);
    const fileName = text(body.fileName, 240);
    const sizeBytes = integer(body.sizeBytes);
    const pageCount = integer(body.pageCount);
    const sha256 = text(body.sha256, 64).toLowerCase();

    if (version === null || version < 1) return res.status(400).json({ error: 'Versão inválida.' });
    if (!isValidPdfStoragePath(storagePath)) return res.status(400).json({ error: 'Caminho do PDF inválido.' });
    const expectedPath = buildPdfStoragePath(edition.year, edition.quarter, edition.className, version);
    if (storagePath !== expectedPath) return res.status(400).json({ error: 'Caminho do PDF não corresponde à versão.' });
    if (!fileName || !/\.pdf$/i.test(fileName)) return res.status(400).json({ error: 'Nome do PDF inválido.' });
    if (sizeBytes === null || sizeBytes < 1 || sizeBytes > MAX_PDF_BYTES) return res.status(400).json({ error: 'Tamanho do PDF inválido.' });
    if (pageCount === null || pageCount < 0) return res.status(400).json({ error: 'Número de páginas inválido.' });
    if (!SHA256.test(sha256)) return res.status(400).json({ error: 'SHA-256 inválido.' });

    const existing = await prisma.ebdPdfAsset.findUnique({
      where: { editionId_version: { editionId: id, version } },
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
        editionId: id,
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
      editionId: id,
      version,
      fileName,
      sizeBytes,
      sha256,
    });
    return res.status(201).json({ asset: created });
  });

  router.get('/editions/:id/pdf', async (req, res) => {
    const id = param(req.params.id);
    const assetId = text(req.query.assetId, 80);
    const edition = await prisma.ebdEdition.findUnique({ where: { id }, select: { id: true } });
    if (!edition) return res.status(404).json({ error: 'Edição não encontrada.' });

    const asset = assetId
      ? await prisma.ebdPdfAsset.findFirst({ where: { id: assetId, editionId: id } })
      : await prisma.ebdPdfAsset.findFirst({ where: { editionId: id }, orderBy: { version: 'desc' } });
    if (!asset) return res.status(404).json({ error: 'Nenhum PDF cadastrado para esta edição.' });

    const resolved = await resolveStoredPdf(asset);
    if (!resolved) return res.status(404).json({ error: 'PDF não encontrado no armazenamento.' });
    if (resolved.kind === 'file') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="revista-ebd.pdf"');
      res.setHeader('Cache-Control', 'private, no-store');
      res.sendFile(resolved.path);
      return;
    }
    return res.redirect(302, resolved.url);
  });

  router.post('/editions/:id/import', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const edition = await prisma.ebdEdition.findUnique({ where: { id } });
    if (!edition) return res.status(404).json({ error: 'Edição não encontrada.' });

    const body = req.body ?? {};
    const payloadValue = body.data ?? body.payload;
    const validation = validateEbdImport(payloadValue);
    if (validation.ok === false) {
      return res.status(422).json({ error: 'O JSON não segue o esquema de importação.', details: validation.errors });
    }
    const data: EbdImportPayload = validation.data;

    if (
      data.edition.year !== edition.year ||
      data.edition.quarter !== edition.quarter ||
      data.edition.class !== edition.className
    ) {
      return res.status(400).json({ error: 'A edição do JSON não coincide com a edição cadastrada.' });
    }

    const assetId = text(body.assetId, 80);
    const asset = assetId
      ? await prisma.ebdPdfAsset.findFirst({ where: { id: assetId, editionId: id } })
      : await prisma.ebdPdfAsset.findFirst({ where: { editionId: id }, orderBy: { version: 'desc' } });
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

    const editionSlug = editionSlugFor(edition.year, edition.quarter, edition.className);

    await prisma.$transaction(async (tx) => {
      await tx.ebdEdition.update({
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
        },
      });

      for (const lesson of prepared) {
        const values: Prisma.EbdLessonUncheckedUpdateInput = {
          slug: lessonSlugFor(editionSlug, lesson.number),
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
          where: { editionId_number: { editionId: id, number: lesson.number } },
          update: values,
          create: { ...values, editionId: id, number: lesson.number } as Prisma.EbdLessonUncheckedCreateInput,
        });
      }

      await tx.ebdLesson.updateMany({
        where: {
          editionId: id,
          number: { notIn: prepared.map((lesson) => lesson.number) },
          status: { not: 'ARCHIVED' },
        },
        data: { status: 'ARCHIVED', publishedAt: null, publishedBy: null },
      });

      await syncCycleSchedules(tx, id);

      await tx.ebdPdfAsset.update({
        where: { id: asset.id },
        data: { pageCount: data.source.page_count },
      });
    });

    await audit(prisma, req, 'IMPORTAR_EDICAO_EBD', 'EbdEdition', id, {
      editionId: id,
      assetId: asset.id,
      version: asset.version,
      sha256: data.source.sha256,
      lessonCount: prepared.length,
    });

    const detail = await prisma.ebdEdition.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { number: 'asc' }, select: lessonAdminSelect },
        pdfAssets: { orderBy: { version: 'desc' } },
      },
    });
    return res.json({
      edition: detail,
      imported: prepared.length,
      warnings,
      assetId: asset.id,
      sha256: data.source.sha256,
    });
  });

  router.get('/editions/:id/audit', async (req, res) => {
    const id = param(req.params.id);
    const rows = await prisma.curadoriaAuditoria.findMany({
      where: { entidade: { in: ['EbdEdition', 'EbdCycle', 'EbdLesson', 'EbdPdfAsset'] } },
      orderBy: { criadoEm: 'desc' },
      take: 200,
    });
    const filtered = rows.filter((row) => {
      const data = row.dados as Record<string, unknown> | null;
      if (row.entidade === 'EbdEdition') return row.entidadeId === id;
      return data?.editionId === id;
    });
    res.json({ audit: filtered.slice(0, 30) });
  });

  // ----------------------------------------------------------------- ciclos

  router.get('/cycles', async (req, res) => {
    const editionId = text(req.query.editionId, 80);
    const cycles = await prisma.ebdCycle.findMany({
      where: editionId ? { editionId } : undefined,
      orderBy: [{ startsOn: 'desc' }, { className: 'asc' }],
      include: {
        edition: { select: editionRefSelect },
        schedule: { select: scheduleRowSelect },
      },
    });

    res.json({
      cycles: cycles.map((cycle) => {
        const schedule = scheduleFor(cycle, cycle.schedule);
        return {
          id: cycle.id,
          editionId: cycle.editionId,
          slug: cycle.slug,
          className: cycle.className,
          startsOn: civilDateFromDb(cycle.startsOn),
          weekday: cycle.weekday,
          anchorRevision: cycle.anchorRevision,
          status: cycle.status,
          publishedAt: iso(cycle.publishedAt),
          periodLabel: schedule.periodLabel,
          firstDate: schedule.firstDate,
          lastDate: schedule.lastDate,
          lessonCount: cycle.schedule.length,
          publishedLessonCount: cycle.schedule.filter((row) => row.lesson.status === 'PUBLISHED').length,
          edition: cycle.edition,
        };
      }),
    });
  });

  router.post('/cycles/preview', async (req, res) => {
    const body = req.body ?? {};
    const startsOn = text(body.startsOn, 10);
    const weekday = body.weekday === undefined ? 0 : integer(body.weekday);
    const lessonCount = body.lessonCount === undefined ? 13 : integer(body.lessonCount);

    if (!isCivilDate(startsOn)) return res.status(400).json({ error: 'Informe uma data de início válida.' });
    if (!isValidWeekday(weekday)) return res.status(400).json({ error: 'Informe um dia da semana entre domingo (0) e sábado (6).' });
    if (lessonCount === null || lessonCount < 1 || lessonCount > 60) {
      return res.status(400).json({ error: 'Informe a quantidade de lições.' });
    }

    const schedule = computeEbdSchedule({ startsOn, weekday, lessonCount });
    return res.json({ schedule });
  });

  router.post('/cycles', async (req: AdminAuthenticatedRequest, res) => {
    const body = req.body ?? {};
    const editionId = text(body.editionId, 80);
    const startsOn = text(body.startsOn, 10);
    const weekday = body.weekday === undefined ? 0 : integer(body.weekday);

    if (!editionId) return res.status(400).json({ error: 'Informe a edição do ciclo.' });
    if (!isCivilDate(startsOn)) return res.status(400).json({ error: 'Informe uma data de início válida.' });
    if (!isValidWeekday(weekday)) return res.status(400).json({ error: 'Informe um dia da semana entre domingo (0) e sábado (6).' });

    const edition = await prisma.ebdEdition.findUnique({
      where: { id: editionId },
      include: { lessons: { orderBy: { number: 'asc' }, select: { id: true, status: true } } },
    });
    if (!edition) return res.status(404).json({ error: 'Edição não encontrada.' });
    const lessons = edition.lessons.filter((lesson) => lesson.status !== 'ARCHIVED');
    if (lessons.length === 0) return res.status(409).json({ error: 'Importe as lições antes de criar o ciclo.' });
    if (lessons.length > 60) return res.status(409).json({ error: 'A edição tem lições demais para um ciclo.' });

    const className = text(body.className, 80) || edition.className;
    const schedule = computeEbdSchedule({ startsOn, weekday, lessonCount: lessons.length });
    const slug = await uniqueCycleSlug(prisma, className, schedule.firstDate);

    const created = await prisma.$transaction(async (tx) => {
      const cycle = await tx.ebdCycle.create({
        data: {
          editionId,
          slug,
          className,
          startsOn: dbDateFromCivil(startsOn),
          weekday,
          status: 'DRAFT',
        },
      });
      await tx.ebdCycleLesson.createMany({
        data: lessons.map((lesson, index) => ({
          cycleId: cycle.id,
          lessonId: lesson.id,
          lessonNumber: index + 1,
        })),
      });
      return cycle;
    });

    await audit(prisma, req, 'CRIAR_CICLO_EBD', 'EbdCycle', created.id, {
      editionId,
      slug,
      className,
      startsOn,
      weekday,
      lessonCount: lessons.length,
    });

    const detail = await prisma.ebdCycle.findUnique({ where: { id: created.id }, include: cycleDetailInclude });
    return res.status(201).json({ cycle: detail ? cyclePayload(detail) : null });
  });

  router.get('/cycles/:id', async (req, res) => {
    const id = param(req.params.id);
    const cycle = await prisma.ebdCycle.findUnique({ where: { id }, include: cycleDetailInclude });
    if (!cycle) return res.status(404).json({ error: 'Ciclo não encontrado.' });
    return res.json({ cycle: cyclePayload(cycle) });
  });

  router.patch('/cycles/:id', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const existing = await prisma.ebdCycle.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Ciclo não encontrado.' });

    const body = req.body ?? {};
    const className = body.className === undefined ? existing.className : text(body.className, 80);
    if (!className) return res.status(400).json({ error: 'Informe a turma do ciclo.' });

    await prisma.ebdCycle.update({ where: { id }, data: { className } });
    await audit(prisma, req, 'ATUALIZAR_CICLO_EBD', 'EbdCycle', id, {
      editionId: existing.editionId,
      before: { className: existing.className },
      after: { className },
    });
    const detail = await prisma.ebdCycle.findUnique({ where: { id }, include: cycleDetailInclude });
    return res.json({ cycle: detail ? cyclePayload(detail) : null });
  });

  router.post('/cycles/:id/reanchor', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const existing = await prisma.ebdCycle.findUnique({
      where: { id },
      include: { schedule: { select: scheduleRowSelect } },
    });
    if (!existing) return res.status(404).json({ error: 'Ciclo não encontrado.' });

    const body = req.body ?? {};
    const startsOn = text(body.startsOn, 10);
    const weekday = body.weekday === undefined ? existing.weekday : integer(body.weekday);
    if (!isCivilDate(startsOn)) return res.status(400).json({ error: 'Informe uma data de início válida.' });
    if (!isValidWeekday(weekday)) return res.status(400).json({ error: 'Informe um dia da semana entre domingo (0) e sábado (6).' });

    const before = scheduleFor(existing, existing.schedule);
    const after = computeEbdSchedule({
      startsOn,
      weekday,
      lessonCount: Math.max(1, existing.schedule.length),
      anchorRevision: existing.anchorRevision,
      exceptions: existing.schedule.map((row) => ({
        lessonNumber: row.lessonNumber,
        exceptionKind: row.exceptionKind,
        scheduledOn: civilDateFromDb(row.scheduledOn),
        adjustedAtRevision: row.adjustedAtRevision,
      })),
    });

    const changed = before.firstDate !== after.firstDate || existing.weekday !== weekday;
    const anchorRevision = changed ? existing.anchorRevision + 1 : existing.anchorRevision;

    await prisma.ebdCycle.update({
      where: { id },
      data: { startsOn: dbDateFromCivil(startsOn), weekday, anchorRevision },
    });
    await audit(prisma, req, 'REANCORAR_CICLO_EBD', 'EbdCycle', id, {
      editionId: existing.editionId,
      before: { startsOn: civilDateFromDb(existing.startsOn), weekday: existing.weekday, anchorRevision: existing.anchorRevision },
      after: { startsOn, weekday, anchorRevision },
      changed,
    });

    const detail = await prisma.ebdCycle.findUnique({ where: { id }, include: cycleDetailInclude });
    return res.json({ cycle: detail ? cyclePayload(detail) : null });
  });

  router.post('/cycles/:id/schedule/:lessonNumber', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const lessonNumber = integer(param(req.params.lessonNumber));
    if (lessonNumber === null || lessonNumber < 1) return res.status(400).json({ error: 'Lição inválida.' });

    const cycle = await prisma.ebdCycle.findUnique({ where: { id }, select: { id: true, editionId: true, anchorRevision: true } });
    if (!cycle) return res.status(404).json({ error: 'Ciclo não encontrado.' });

    const row = await prisma.ebdCycleLesson.findUnique({
      where: { cycleId_lessonNumber: { cycleId: id, lessonNumber } },
    });
    if (!row) return res.status(404).json({ error: 'Lição não encontrada na agenda deste ciclo.' });

    const body = req.body ?? {};
    const kind = text(body.kind, 20).toUpperCase();
    if (!SCHEDULE_KINDS.has(kind)) {
      return res.status(400).json({ error: 'Informe a exceção: RULE, RESCHEDULED ou NO_MEETING.' });
    }

    let scheduledOn: Date | null = null;
    let adjustedAtRevision: number | null = null;

    if (kind === 'RESCHEDULED') {
      const value = text(body.scheduledOn, 10);
      if (!isCivilDate(value)) return res.status(400).json({ error: 'Informe a data do ajuste manual.' });
      scheduledOn = dbDateFromCivil(value);
      adjustedAtRevision = cycle.anchorRevision;
    }

    await prisma.ebdCycleLesson.update({
      where: { id: row.id },
      data: {
        exceptionKind: kind as 'RULE' | 'RESCHEDULED' | 'NO_MEETING',
        scheduledOn,
        adjustedAtRevision,
      },
    });

    await audit(prisma, req, 'AJUSTAR_AGENDA_EBD', 'EbdCycleLesson', row.id, {
      editionId: cycle.editionId,
      cycleId: id,
      lessonNumber,
      before: {
        exceptionKind: row.exceptionKind,
        scheduledOn: civilDateFromDb(row.scheduledOn),
        adjustedAtRevision: row.adjustedAtRevision,
      },
      after: { exceptionKind: kind, scheduledOn: civilDateFromDb(scheduledOn), adjustedAtRevision },
    });

    const detail = await prisma.ebdCycle.findUnique({ where: { id }, include: cycleDetailInclude });
    return res.json({ cycle: detail ? cyclePayload(detail) : null });
  });

  router.post('/cycles/:id/publish', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const cycle = await prisma.ebdCycle.findUnique({
      where: { id },
      include: { schedule: { include: { lesson: true } } },
    });
    if (!cycle) return res.status(404).json({ error: 'Ciclo não encontrado.' });
    if (cycle.schedule.length === 0) {
      return res.status(409).json({ error: 'Importe as lições antes de publicar o ciclo.' });
    }
    const publishable = cycle.schedule
      .map((row) => row.lesson)
      .filter((lesson) => lesson.status !== 'ARCHIVED' && normalizeSections(lesson.sections).length > 0);
    if (publishable.length === 0) {
      return res.status(409).json({ error: 'Nenhuma lição válida para publicar neste ciclo.' });
    }

    const publishedAt = new Date();
    const publishedBy = req.adminUser!.email;
    await prisma.$transaction(async (tx) => {
      await tx.ebdCycle.update({
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
    await audit(prisma, req, 'PUBLICAR_CICLO_EBD', 'EbdCycle', id, {
      editionId: cycle.editionId,
      publishedAt: publishedAt.toISOString(),
      lessonCount: cycle.schedule.length,
    });

    const detail = await prisma.ebdCycle.findUnique({ where: { id }, include: cycleDetailInclude });
    return res.json({ cycle: detail ? cyclePayload(detail) : null });
  });

  router.post('/cycles/:id/unpublish', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const cycle = await prisma.ebdCycle.findUnique({ where: { id }, select: { id: true, editionId: true } });
    if (!cycle) return res.status(404).json({ error: 'Ciclo não encontrado.' });
    await prisma.ebdCycle.update({
      where: { id },
      data: { status: 'DRAFT', publishedAt: null, publishedBy: null },
    });
    await audit(prisma, req, 'DESPUBLICAR_CICLO_EBD', 'EbdCycle', id, { editionId: cycle.editionId });

    const detail = await prisma.ebdCycle.findUnique({ where: { id }, include: cycleDetailInclude });
    return res.json({ cycle: detail ? cyclePayload(detail) : null });
  });

  router.post('/cycles/:id/archive', async (req: AdminAuthenticatedRequest, res) => {
    const id = param(req.params.id);
    const cycle = await prisma.ebdCycle.findUnique({ where: { id }, select: { id: true, editionId: true } });
    if (!cycle) return res.status(404).json({ error: 'Ciclo não encontrado.' });
    await prisma.ebdCycle.update({
      where: { id },
      data: { status: 'ARCHIVED', publishedAt: null, publishedBy: null },
    });
    await audit(prisma, req, 'ARQUIVAR_CICLO_EBD', 'EbdCycle', id, { editionId: cycle.editionId });

    const detail = await prisma.ebdCycle.findUnique({ where: { id }, include: cycleDetailInclude });
    return res.json({ cycle: detail ? cyclePayload(detail) : null });
  });

  router.get('/cycles/:id/audit', async (req, res) => {
    const id = param(req.params.id);
    const rows = await prisma.curadoriaAuditoria.findMany({
      where: { entidade: { in: ['EbdCycle', 'EbdLesson', 'EbdCycleLesson'] } },
      orderBy: { criadoEm: 'desc' },
      take: 200,
    });
    const filtered = rows.filter((row) => {
      const data = row.dados as Record<string, unknown> | null;
      if (row.entidade === 'EbdCycle') return row.entidadeId === id;
      return data?.cycleId === id;
    });
    res.json({ audit: filtered.slice(0, 30) });
  });

  // ---------------------------------------------------------------- lições

  router.get('/lessons/:id', async (req, res) => {
    const id = param(req.params.id);
    const lesson = await prisma.ebdLesson.findUnique({
      where: { id },
      include: {
        edition: { select: editionRefSelect },
        cycleEntries: {
          include: {
            cycle: {
              include: {
                edition: { select: editionRefSelect },
                schedule: { select: scheduleRowSelect },
              },
            },
          },
        },
      },
    });
    if (!lesson) return res.status(404).json({ error: 'Lição não encontrada.' });

    const latestPdf = await prisma.ebdPdfAsset.findFirst({
      where: { editionId: lesson.editionId },
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
        cycles: lesson.cycleEntries.map((entry) => {
          const schedule = scheduleFor(entry.cycle, entry.cycle.schedule);
          const computed = schedule.entries.find((item) => item.lessonNumber === entry.lessonNumber);
          return {
            id: entry.cycle.id,
            slug: entry.cycle.slug,
            className: entry.cycle.className,
            startsOn: civilDateFromDb(entry.cycle.startsOn),
            weekday: entry.cycle.weekday,
            status: entry.cycle.status,
            periodLabel: schedule.periodLabel,
            lessonNumber: entry.lessonNumber,
            date: computed?.date ?? null,
            exceptionKind: entry.exceptionKind,
            divergesFromRule: computed?.divergesFromRule ?? false,
          };
        }),
        cycleEntries: undefined,
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
      editionId: existing.editionId,
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
      editionId: existing.editionId,
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
      editionId: existing.editionId,
      number: existing.number,
    });
    return res.json({ lesson: updated });
  });

  return router;
}
