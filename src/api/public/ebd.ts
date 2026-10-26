import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import type { Prisma, PrismaClient } from '@prisma/client';
import { ensureEbdSchema } from '../ebd-schema.js';
import {
  buildLessonNavigation,
  normalizeDailyReadings,
  normalizeFigures,
  normalizeQuestions,
  normalizeSections,
  normalizeStringArray,
  pdfDownloadPath,
} from '../../lib/ebd/content.js';
import { searchLessons, type EbdSearchableLesson } from '../../lib/ebd/search.js';
import type {
  EbdLessonDetail,
  EbdLessonSummary,
  EbdQuarterSummary,
} from '../../types/ebd.js';

const MODULE_LABEL = '[EBD]';

const lessonSummarySelect = {
  number: true,
  slug: true,
  title: true,
  baseText: true,
  startPage: true,
  endPage: true,
} satisfies Prisma.EbdLessonSelect;

type LessonSummaryRow = Prisma.EbdLessonGetPayload<{ select: typeof lessonSummarySelect }>;

const searchLessonSelect = {
  ...lessonSummarySelect,
  introduction: true,
  sections: true,
  questions: true,
  dailyReadings: true,
} satisfies Prisma.EbdLessonSelect;

type SearchLessonRow = Prisma.EbdLessonGetPayload<{ select: typeof searchLessonSelect }>;

function toSearchableLesson(lesson: SearchLessonRow): EbdSearchableLesson {
  return {
    ...toLessonSummary(lesson),
    introduction: normalizeStringArray(lesson.introduction),
    sections: normalizeSections(lesson.sections),
    questions: normalizeQuestions(lesson.questions),
    dailyReadings: normalizeDailyReadings(lesson.dailyReadings),
  };
}

function toLessonSummary(lesson: LessonSummaryRow): EbdLessonSummary {
  return {
    number: lesson.number,
    slug: lesson.slug,
    title: lesson.title,
    baseText: lesson.baseText,
    startPage: lesson.startPage,
    endPage: lesson.endPage,
  };
}

function toQuarterSummary(
  quarter: Prisma.EbdQuarterGetPayload<{ include: { lessons: { select: typeof lessonSummarySelect } } }>,
): EbdQuarterSummary {
  return {
    id: quarter.id,
    slug: quarter.slug,
    year: quarter.year,
    quarter: quarter.quarter,
    className: quarter.className,
    publisher: quarter.publisher,
    title: quarter.title,
    issue: quarter.issue,
    volume: quarter.volume,
    lessonCount: quarter.lessons.length,
    publishedAt: quarter.publishedAt ? quarter.publishedAt.toISOString() : null,
    lessons: quarter.lessons.map(toLessonSummary),
  };
}

function parseInteger(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

function setPublicCache(res: Response) {
  res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=120');
}

function latestPdfAsset(prisma: PrismaClient, quarterId: string) {
  return prisma.ebdPdfAsset.findFirst({
    where: { quarterId },
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

  router.get('/quarters', async (_req, res) => {
    const quarters = await prisma.ebdQuarter.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ year: 'desc' }, { quarter: 'desc' }],
      include: {
        lessons: {
          where: { status: 'PUBLISHED' },
          orderBy: { number: 'asc' },
          select: lessonSummarySelect,
        },
      },
    });

    setPublicCache(res);
    res.json({
      quarters: quarters.filter((quarter) => quarter.lessons.length > 0).map(toQuarterSummary),
    });
  });

  router.get('/search', async (req, res) => {
    const query = String(req.query.q ?? '').trim();
    if (query.length < 2 || query.length > 80) {
      res.status(400).json({ error: 'Digite uma busca entre 2 e 80 caracteres.' });
      return;
    }

    const yearParam = typeof req.query.year === 'string' ? req.query.year : undefined;
    const quarterParam = typeof req.query.quarter === 'string' ? req.query.quarter : undefined;
    const className = typeof req.query.class === 'string' ? req.query.class.trim() : '';

    if ((yearParam && !quarterParam) || (!yearParam && quarterParam)) {
      res.status(400).json({ error: 'Informe ano e trimestre juntos.' });
      return;
    }

    type SearchQuarterRow = Prisma.EbdQuarterGetPayload<{
      include: { lessons: { select: typeof searchLessonSelect } };
    }>;
    let record: SearchQuarterRow | null = null;

    if (yearParam && quarterParam) {
      const year = parseInteger(yearParam);
      const quarter = parseInteger(quarterParam);
      if (
        year === null ||
        year < 1900 ||
        year > 2100 ||
        quarter === null ||
        quarter < 1 ||
        quarter > 4
      ) {
        res.status(400).json({ error: 'Trimestre inválido.' });
        return;
      }

      record = await prisma.ebdQuarter.findFirst({
        where: {
          year,
          quarter,
          status: 'PUBLISHED',
          ...(className ? { className } : {}),
        },
        orderBy: { className: 'asc' },
        include: {
          lessons: {
            where: { status: 'PUBLISHED' },
            orderBy: { number: 'asc' },
            select: searchLessonSelect,
          },
        },
      });
    } else {
      record = await prisma.ebdQuarter.findFirst({
        where: {
          status: 'PUBLISHED',
          lessons: { some: { status: 'PUBLISHED' } },
        },
        orderBy: [{ year: 'desc' }, { quarter: 'desc' }, { className: 'asc' }],
        include: {
          lessons: {
            where: { status: 'PUBLISHED' },
            orderBy: { number: 'asc' },
            select: searchLessonSelect,
          },
        },
      });
    }

    if (!record || record.lessons.length === 0) {
      res.status(404).json({ error: 'Nenhum trimestre publicado para busca.' });
      return;
    }

    const results = searchLessons(record.lessons.map(toSearchableLesson), query);

    setPublicCache(res);
    res.json({
      query,
      quarter: {
        id: record.id,
        slug: record.slug,
        year: record.year,
        quarter: record.quarter,
        className: record.className,
        title: record.title,
        publisher: record.publisher,
        lessonCount: record.lessons.length,
      },
      results,
    });
  });

  router.get('/quarters/:id/pdf', async (req, res) => {
    const id = String(req.params.id ?? '').trim();
    if (!id || id.length > 80) {
      res.status(400).json({ error: 'Trimestre inválido.' });
      return;
    }

    const quarter = await prisma.ebdQuarter.findFirst({
      where: { id, status: 'PUBLISHED' },
      select: { id: true },
    });
    if (!quarter) {
      res.status(404).json({ error: 'PDF não disponível.' });
      return;
    }

    const asset = await latestPdfAsset(prisma, quarter.id);
    if (!asset) {
      res.status(404).json({ error: 'PDF não disponível.' });
      return;
    }

    if (asset.url) {
      try {
        const target = new URL(asset.url);
        if (target.protocol === 'https:' || target.protocol === 'http:') {
          res.setHeader('Cache-Control', 'public, max-age=300');
          res.redirect(302, target.toString());
          return;
        }
      } catch (error) {
        console.error(`${MODULE_LABEL} PDF URL inválida:`, error instanceof Error ? error.message : error);
      }
    }

    const localDirectory = process.env.EBD_LOCAL_PDF_DIR;
    if (process.env.NODE_ENV !== 'production' && localDirectory) {
      const baseDirectory = path.resolve(localDirectory);
      const fileName = path.basename(asset.fileName);
      const localFile = path.resolve(baseDirectory, fileName);
      const insideBase = localFile === path.join(baseDirectory, fileName)
        && localFile.startsWith(baseDirectory + path.sep);
      if (insideBase && fs.existsSync(localFile)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName.replace(/"/g, '')}"`);
        res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate');
        res.sendFile(localFile);
        return;
      }
    }

    res.status(404).json({ error: 'PDF não disponível.' });
  });

  router.get('/quarters/:year/:quarter', async (req, res) => {
    const year = parseInteger(req.params.year);
    const quarter = parseInteger(req.params.quarter);
    if (year === null || year < 1900 || year > 2100 || quarter === null || quarter < 1 || quarter > 4) {
      res.status(400).json({ error: 'Trimestre inválido.' });
      return;
    }

    const className = typeof req.query.class === 'string' ? req.query.class.trim() : '';
    const record = await prisma.ebdQuarter.findFirst({
      where: {
        year,
        quarter,
        status: 'PUBLISHED',
        ...(className ? { className } : {}),
      },
      orderBy: { className: 'asc' },
      include: {
        lessons: {
          where: { status: 'PUBLISHED' },
          orderBy: { number: 'asc' },
          select: lessonSummarySelect,
        },
      },
    });

    if (!record || record.lessons.length === 0) {
      res.status(404).json({ error: 'Trimestre não encontrado.' });
      return;
    }

    setPublicCache(res);
    res.json({ quarter: toQuarterSummary(record) });
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
        quarter: {
          select: {
            id: true,
            slug: true,
            year: true,
            quarter: true,
            className: true,
            title: true,
            publisher: true,
            status: true,
          },
        },
      },
    });

    if (!record || record.quarter.status !== 'PUBLISHED') {
      res.status(404).json({ error: 'Lição não encontrada ou ainda não publicada.' });
      return;
    }

    const quarterLessons = await prisma.ebdLesson.findMany({
      where: { quarterId: record.quarterId, status: 'PUBLISHED' },
      orderBy: { number: 'asc' },
      select: lessonSummarySelect,
    });

    const asset = await latestPdfAsset(prisma, record.quarterId);
    const lesson: EbdLessonDetail = {
      number: record.number,
      slug: record.slug,
      title: record.title,
      baseText: record.baseText,
      startPage: record.startPage,
      endPage: record.endPage,
      introduction: normalizeStringArray(record.introduction),
      sections: normalizeSections(record.sections),
      questions: normalizeQuestions(record.questions),
      dailyReadings: normalizeDailyReadings(record.dailyReadings),
      figures: normalizeFigures(record.figures),
      quarter: {
        id: record.quarter.id,
        slug: record.quarter.slug,
        year: record.quarter.year,
        quarter: record.quarter.quarter,
        className: record.quarter.className,
        title: record.quarter.title,
        publisher: record.quarter.publisher,
      },
      index: quarterLessons.map(toLessonSummary),
      navigation: buildLessonNavigation(quarterLessons, record.number),
      pdf: asset
        ? {
            fileName: asset.fileName,
            sizeBytes: asset.sizeBytes,
            pageCount: asset.pageCount,
            downloadUrl: pdfDownloadPath(record.quarter.id),
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
