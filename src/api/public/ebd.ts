import express, { type NextFunction, type Request, type Response } from 'express';
import type { Prisma, PrismaClient } from '@prisma/client';
import { ensureEbdSchema } from '../ebd-schema.js';
import { resolveStoredPdf } from '../../lib/ebd/storage.js';
import {
  buildLessonNavigation,
  normalizeDailyReadings,
  normalizeFigures,
  normalizeQuestions,
  normalizeSections,
  normalizeStringArray,
  pdfDownloadPath,
} from '../../lib/ebd/content.js';
import { civilDateFromDb, computeEbdSchedule, type EbdScheduleEntry } from '../../lib/ebd/schedule.js';
import { searchLessons, type EbdSearchableLesson } from '../../lib/ebd/search.js';
import type {
  EbdCycleRef,
  EbdCycleSummary,
  EbdEditionRef,
  EbdLessonDetail,
  EbdLessonSummary,
} from '../../types/ebd.js';

const MODULE_LABEL = '[EBD]';

const lessonSummarySelect = {
  id: true,
  number: true,
  slug: true,
  title: true,
  baseText: true,
  startPage: true,
  endPage: true,
  status: true,
} satisfies Prisma.EbdLessonSelect;

type LessonRow = Prisma.EbdLessonGetPayload<{ select: typeof lessonSummarySelect }>;

const scheduleEntrySelect = {
  lessonNumber: true,
  exceptionKind: true,
  scheduledOn: true,
  adjustedAtRevision: true,
  lesson: { select: lessonSummarySelect },
} satisfies Prisma.EbdCycleLessonSelect;

type ScheduleEntryRow = Prisma.EbdCycleLessonGetPayload<{ select: typeof scheduleEntrySelect }>;

const cycleInclude = {
  edition: true,
  schedule: {
    orderBy: { lessonNumber: 'asc' },
    select: scheduleEntrySelect,
  },
} satisfies Prisma.EbdCycleInclude;

type CycleRow = Prisma.EbdCycleGetPayload<{ include: typeof cycleInclude }>;

const editionSelect = {
  id: true,
  publisher: true,
  year: true,
  quarter: true,
  className: true,
  title: true,
  issue: true,
  volume: true,
} satisfies Prisma.EbdEditionSelect;

function toEditionRef(edition: Prisma.EbdEditionGetPayload<{ select: typeof editionSelect }>): EbdEditionRef {
  return {
    id: edition.id,
    publisher: edition.publisher,
    year: edition.year,
    quarter: edition.quarter,
    className: edition.className,
    title: edition.title,
    issue: edition.issue,
    volume: edition.volume,
  };
}

function scheduleOf(cycle: Pick<CycleRow, 'startsOn' | 'weekday' | 'anchorRevision' | 'schedule'>) {
  const startsOn = civilDateFromDb(cycle.startsOn);
  const lessonCount = cycle.schedule.reduce((max, row) => Math.max(max, row.lessonNumber), 0);
  return computeEbdSchedule({
    startsOn: startsOn ?? '',
    weekday: cycle.weekday,
    lessonCount,
    anchorRevision: cycle.anchorRevision,
    exceptions: cycle.schedule.map((row) => ({
      lessonNumber: row.lessonNumber,
      exceptionKind: row.exceptionKind,
      scheduledOn: civilDateFromDb(row.scheduledOn),
      adjustedAtRevision: row.adjustedAtRevision,
    })),
  });
}

function lessonFromRow(row: LessonRow, entry: EbdScheduleEntry | undefined): EbdLessonSummary {
  return {
    number: row.number,
    slug: row.slug,
    title: row.title,
    baseText: row.baseText,
    startPage: row.startPage,
    endPage: row.endPage,
    scheduledOn: entry?.date ?? null,
  };
}

function publishedEntries(cycle: CycleRow, schedule: ReturnType<typeof computeEbdSchedule>) {
  const byNumber = new Map(schedule.entries.map((entry) => [entry.lessonNumber, entry]));
  return cycle.schedule
    .filter((row) => row.lesson.status === 'PUBLISHED')
    .map((row) => ({ row, entry: byNumber.get(row.lessonNumber) }))
    .filter((item): item is { row: ScheduleEntryRow; entry: EbdScheduleEntry } => Boolean(item.entry));
}

function toCycleSummary(cycle: CycleRow): EbdCycleSummary {
  const schedule = scheduleOf(cycle);
  return {
    id: cycle.id,
    slug: cycle.slug,
    className: cycle.className,
    startsOn: civilDateFromDb(cycle.startsOn) ?? '',
    weekday: cycle.weekday,
    periodLabel: schedule.periodLabel,
    publishedAt: cycle.publishedAt ? cycle.publishedAt.toISOString() : null,
    edition: toEditionRef(cycle.edition),
    lessons: publishedEntries(cycle, schedule).map(({ row, entry }) => lessonFromRow(row.lesson, entry)),
  };
}

function toCycleRef(
  cycle: Pick<CycleRow, 'id' | 'slug' | 'className' | 'startsOn' | 'weekday' | 'anchorRevision'>,
  schedule: ReturnType<typeof computeEbdSchedule>,
  lessonCount: number,
): EbdCycleRef & { lessonCount: number } {
  return {
    id: cycle.id,
    slug: cycle.slug,
    className: cycle.className,
    startsOn: civilDateFromDb(cycle.startsOn) ?? '',
    weekday: cycle.weekday,
    periodLabel: schedule.periodLabel,
    lessonCount,
  };
}

const searchLessonSelect = {
  ...lessonSummarySelect,
  introduction: true,
  sections: true,
  questions: true,
  dailyReadings: true,
} satisfies Prisma.EbdLessonSelect;

type SearchLessonRow = Prisma.EbdLessonGetPayload<{ select: typeof searchLessonSelect }>;

function toSearchableLesson(row: SearchLessonRow, entry: EbdScheduleEntry): EbdSearchableLesson {
  return {
    ...lessonFromRow(row, entry),
    introduction: normalizeStringArray(row.introduction),
    sections: normalizeSections(row.sections),
    questions: normalizeQuestions(row.questions),
    dailyReadings: normalizeDailyReadings(row.dailyReadings),
  };
}

function setPublicCache(res: Response) {
  res.setHeader('Cache-Control', 'no-store');
}

function latestPdfAsset(prisma: PrismaClient, editionId: string) {
  return prisma.ebdPdfAsset.findFirst({
    where: { editionId },
    orderBy: { version: 'desc' },
  });
}

export function createPublicEbdRouter(prisma: PrismaClient) {
  const router = express.Router();

  router.use((_req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    next();
  });

  router.use(async (_req, _res, next) => {
    await ensureEbdSchema(prisma);
    next();
  });

  router.get('/cycles', async (_req, res) => {
    const cycles = await prisma.ebdCycle.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ startsOn: 'desc' }, { className: 'asc' }],
      include: cycleInclude,
    });

    setPublicCache(res);
    res.json({
      cycles: cycles.map(toCycleSummary).filter((cycle) => cycle.lessons.length > 0),
    });
  });

  router.get('/cycles/:slug', async (req, res) => {
    const slug = String(req.params.slug ?? '').trim();
    if (!slug || slug.length > 160) {
      res.status(400).json({ error: 'Ciclo inválido.' });
      return;
    }

    const cycle = await prisma.ebdCycle.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: cycleInclude,
    });
    if (!cycle) {
      res.status(404).json({ error: 'Ciclo não encontrado ou ainda não publicado.' });
      return;
    }

    const summary = toCycleSummary(cycle);
    if (summary.lessons.length === 0) {
      res.status(404).json({ error: 'Ciclo sem lições publicadas.' });
      return;
    }

    setPublicCache(res);
    res.json({ cycle: summary });
  });

  router.get('/editions/:id/pdf', async (req, res) => {
    const id = String(req.params.id ?? '').trim();
    if (!id || id.length > 80) {
      res.status(400).json({ error: 'Edição inválida.' });
      return;
    }

    const published = await prisma.ebdCycle.findFirst({
      where: { editionId: id, status: 'PUBLISHED' },
      select: { id: true },
    });
    if (!published) {
      res.status(404).json({ error: 'PDF não disponível.' });
      return;
    }

    const asset = await latestPdfAsset(prisma, id);
    if (!asset) {
      res.status(404).json({ error: 'PDF não disponível.' });
      return;
    }

    const resolved = await resolveStoredPdf(asset);
    if (!resolved) {
      res.status(404).json({ error: 'PDF não disponível.' });
      return;
    }

    if (resolved.kind === 'file') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${asset.fileName.replace(/"/g, '')}"`);
      res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
      res.sendFile(resolved.path);
      return;
    }

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.redirect(302, resolved.url);
  });

  router.get('/search', async (req, res) => {
    const query = String(req.query.q ?? '').trim();
    if (query.length < 2 || query.length > 80) {
      res.status(400).json({ error: 'Digite uma busca entre 2 e 80 caracteres.' });
      return;
    }

    const cycleSlug = typeof req.query.cycle === 'string' ? req.query.cycle.trim() : '';
    const cycle = await prisma.ebdCycle.findFirst({
      where: {
        status: 'PUBLISHED',
        ...(cycleSlug ? { slug: cycleSlug } : {}),
        schedule: { some: { lesson: { status: 'PUBLISHED' } } },
      },
      orderBy: [{ startsOn: 'desc' }, { className: 'asc' }],
      include: {
        edition: { select: editionSelect },
        schedule: {
          where: { lesson: { status: 'PUBLISHED' } },
          orderBy: { lessonNumber: 'asc' },
          select: {
            lessonNumber: true,
            exceptionKind: true,
            scheduledOn: true,
            adjustedAtRevision: true,
            lesson: { select: searchLessonSelect },
          },
        },
      },
    });

    if (!cycle || cycle.schedule.length === 0) {
      res.status(404).json({ error: 'Nenhum ciclo publicado para busca.' });
      return;
    }

    const schedule = computeEbdSchedule({
      startsOn: civilDateFromDb(cycle.startsOn) ?? '',
      weekday: cycle.weekday,
      lessonCount: Math.max(...cycle.schedule.map((row) => row.lessonNumber)),
      anchorRevision: cycle.anchorRevision,
      exceptions: cycle.schedule.map((row) => ({
        lessonNumber: row.lessonNumber,
        exceptionKind: row.exceptionKind,
        scheduledOn: civilDateFromDb(row.scheduledOn),
        adjustedAtRevision: row.adjustedAtRevision,
      })),
    });
    const entryByNumber = new Map(schedule.entries.map((entry) => [entry.lessonNumber, entry]));

    const searchable = cycle.schedule
      .map((row) => {
        const entry = entryByNumber.get(row.lessonNumber);
        return entry ? toSearchableLesson(row.lesson, entry) : null;
      })
      .filter((lesson): lesson is EbdSearchableLesson => lesson !== null);

    const results = searchLessons(searchable, query);

    setPublicCache(res);
    res.json({
      query,
      cycle: toCycleRef(cycle, schedule, searchable.length),
      results,
    });
  });

  router.get('/lessons/:slug', async (req, res) => {
    const slug = String(req.params.slug ?? '').trim();
    if (!slug || slug.length > 160) {
      res.status(400).json({ error: 'Lição inválida.' });
      return;
    }

    const record = await prisma.ebdLesson.findFirst({
      where: { slug, status: 'PUBLISHED' },
      include: {
        edition: { select: editionSelect },
        cycleEntries: {
          include: {
            cycle: {
              select: {
                id: true,
                slug: true,
                className: true,
                startsOn: true,
                weekday: true,
                anchorRevision: true,
                status: true,
                publishedAt: true,
              },
            },
          },
          orderBy: { cycle: { startsOn: 'desc' } },
        },
      },
    });

    if (!record) {
      res.status(404).json({ error: 'Lição não encontrada ou ainda não publicada.' });
      return;
    }

    const publishedCycle = record.cycleEntries
      .map((entry) => entry.cycle)
      .find((cycle) => cycle.status === 'PUBLISHED');
    if (!publishedCycle) {
      res.status(404).json({ error: 'Lição não encontrada ou ainda não publicada.' });
      return;
    }

    const cycle = await prisma.ebdCycle.findUnique({
      where: { id: publishedCycle.id },
      include: cycleInclude,
    });
    if (!cycle) {
      res.status(404).json({ error: 'Ciclo não encontrado.' });
      return;
    }

    const schedule = scheduleOf(cycle);
    const entries = publishedEntries(cycle, schedule);
    const current = entries.find(({ row }) => row.lesson.id === record.id);
    if (!current) {
      res.status(404).json({ error: 'Lição não encontrada ou ainda não publicada.' });
      return;
    }

    const asset = await latestPdfAsset(prisma, cycle.editionId);
    const index = entries.map(({ row, entry }) => lessonFromRow(row.lesson, entry));
    const lesson: EbdLessonDetail = {
      ...lessonFromRow(record, current.entry),
      introduction: normalizeStringArray(record.introduction),
      sections: normalizeSections(record.sections),
      questions: normalizeQuestions(record.questions),
      dailyReadings: normalizeDailyReadings(record.dailyReadings),
      figures: normalizeFigures(record.figures),
      cycle: toCycleRef(cycle, schedule, entries.length),
      edition: toEditionRef(cycle.edition),
      index,
      navigation: buildLessonNavigation(index, record.number),
      pdf: asset
        ? {
            fileName: asset.fileName,
            sizeBytes: asset.sizeBytes,
            pageCount: asset.pageCount,
            downloadUrl: pdfDownloadPath(cycle.editionId),
            page: record.startPage,
          }
        : null,
    };

    setPublicCache(res);
    res.json({ lesson });
  });

  router.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(`${MODULE_LABEL} public error:`, error instanceof Error ? error.message : error);
    if (res.headersSent) return;
    res.status(500).json({ error: 'Não foi possível carregar o conteúdo da EBD.' });
  });

  return router;
}
