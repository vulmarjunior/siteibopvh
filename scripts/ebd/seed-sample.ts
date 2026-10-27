import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { ensureEbdSchema } from '../../src/api/ebd-schema.js';
import {
  normalizeDailyReadings,
  normalizeFigures,
  normalizeQuestions,
  normalizeSections,
  normalizeStringArray,
} from '../../src/lib/ebd/content.js';

const DEFAULT_SAMPLE = path.join('materiais', 'ebd', '2022', '1T', 'adultos', 'importacao-1t2022.json');
const QUARTER_SLUG = '2022-1t-adultos';

interface ImportSchema {
  schema_version: string;
  source: {
    file_name: string;
    sha256: string;
    page_count: number;
    size_bytes: number;
  };
  edition: {
    publisher: string;
    title: string;
    year: number;
    quarter: number;
    issue?: number | null;
    volume?: number | null;
    class: string;
  };
  lessons: Array<{
    number: number;
    title: string;
    base_text: string;
    start_page: number;
    end_page: number;
    introduction: unknown;
    sections: unknown;
    questions: unknown;
    daily_readings: unknown;
    figures?: unknown;
    review?: {
      status?: string;
      reviewer?: string | null;
      reviewed_at?: string | null;
      source_hash?: string;
    };
  }>;
}

function fail(message: string): never {
  console.error(`[EBD seed] ${message}`);
  process.exit(1);
}

function assertLocalDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) fail('DATABASE_URL não definida. Use um arquivo de ambiente local.');
  let host = '';
  try {
    host = new URL(databaseUrl).hostname;
  } catch {
    fail('DATABASE_URL inválida.');
  }
  const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
  if (!localHosts.has(host)) {
    fail(
      `DATABASE_URL aponta para "${host}", que não é local. ` +
        'Este seed é apenas para validação local e se recusa a gravar em banco remoto.',
    );
  }
}

function parseArgs() {
  const args = new Set(process.argv.slice(2));
  const fileArg = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
  return {
    file: fileArg ? path.resolve(fileArg) : path.resolve(DEFAULT_SAMPLE),
    publish: args.has('--publish'),
  };
}

function lessonSlug(number: number): string {
  return `${QUARTER_SLUG}-licao-${String(number).padStart(2, '0')}`;
}

async function main() {
  assertLocalDatabase();
  const { file, publish } = parseArgs();
  if (!fs.existsSync(file)) {
    fail(`JSON de amostra não encontrado em ${file}. Gere-o localmente a partir do PDF (não versionado).`);
  }

  const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as ImportSchema;
  if (raw.schema_version !== '1.0.0') fail(`schema_version inesperado: ${raw.schema_version}`);
  if (!Array.isArray(raw.lessons) || raw.lessons.length === 0) fail('O JSON não contém lições.');
  if (!raw.edition?.year || !raw.edition?.quarter || !raw.edition?.class) {
    fail('Metadados da edição incompletos.');
  }
  if (!raw.source?.sha256 || !raw.source?.file_name) fail('Metadados do PDF incompletos.');

  const prisma = new PrismaClient();
  try {
    await ensureEbdSchema(prisma);

    const reviewedAt = raw.lessons[0]?.review?.reviewed_at
      ? new Date(raw.lessons[0].review.reviewed_at)
      : null;
    const status = publish ? 'PUBLISHED' : 'DRAFT';
    const publishedAt = publish ? new Date() : null;

    const quarter = await prisma.ebdQuarter.upsert({
      where: {
        year_quarter_className: {
          year: raw.edition.year,
          quarter: raw.edition.quarter,
          className: raw.edition.class,
        },
      },
      update: {
        slug: QUARTER_SLUG,
        publisher: raw.edition.publisher,
        title: raw.edition.title,
        issue: raw.edition.issue ?? null,
        volume: raw.edition.volume ?? null,
        sourceFileName: raw.source.file_name,
        sourceSha256: raw.source.sha256,
        sourcePageCount: raw.source.page_count,
        sourceSizeBytes: raw.source.size_bytes,
        status,
        publishedAt,
      },
      create: {
        slug: QUARTER_SLUG,
        year: raw.edition.year,
        quarter: raw.edition.quarter,
        className: raw.edition.class,
        publisher: raw.edition.publisher,
        title: raw.edition.title,
        issue: raw.edition.issue ?? null,
        volume: raw.edition.volume ?? null,
        sourceFileName: raw.source.file_name,
        sourceSha256: raw.source.sha256,
        sourcePageCount: raw.source.page_count,
        sourceSizeBytes: raw.source.size_bytes,
        status,
        publishedAt,
      },
    });

    for (const lesson of raw.lessons) {
      const introduction = normalizeStringArray(lesson.introduction);
      const sections = normalizeSections(lesson.sections);
      const questions = normalizeQuestions(lesson.questions);
      const dailyReadings = normalizeDailyReadings(lesson.daily_readings);
      const figures = normalizeFigures(lesson.figures);
      if (sections.length === 0) fail(`Lição ${lesson.number} sem seções válidas.`);

      const data = {
        slug: lessonSlug(lesson.number),
        title: lesson.title,
        baseText: lesson.base_text,
        startPage: lesson.start_page,
        endPage: lesson.end_page,
        introduction,
        sections,
        questions,
        dailyReadings,
        figures,
        status,
        sourceHash: lesson.review?.source_hash ?? raw.source.sha256,
        reviewedBy: lesson.review?.reviewer ?? null,
        reviewedAt,
        publishedAt,
      };

      await prisma.ebdLesson.upsert({
        where: { quarterId_number: { quarterId: quarter.id, number: lesson.number } },
        update: data,
        create: { ...data, quarterId: quarter.id, number: lesson.number },
      });
    }

    await prisma.ebdPdfAsset.upsert({
      where: { quarterId_version: { quarterId: quarter.id, version: 1 } },
      update: {
        fileName: raw.source.file_name,
        sha256: raw.source.sha256,
        sizeBytes: raw.source.size_bytes,
        pageCount: raw.source.page_count,
      },
      create: {
        quarterId: quarter.id,
        version: 1,
        fileName: raw.source.file_name,
        sha256: raw.source.sha256,
        sizeBytes: raw.source.size_bytes,
        pageCount: raw.source.page_count,
      },
    });

    console.log(
      `[EBD seed] ${raw.lessons.length} lição(ões) ${publish ? 'publicada(s)' : 'em rascunho'} ` +
        `no trimestre ${QUARTER_SLUG} (banco local).`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('[EBD seed] Falha:', error instanceof Error ? error.message : error);
  process.exit(1);
});
