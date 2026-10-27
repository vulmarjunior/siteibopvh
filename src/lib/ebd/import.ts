import type { EbdDailyReading, EbdDay } from '../../types/ebd.js';

export interface EbdImportSource {
  file_name: string;
  sha256: string;
  page_count: number;
  size_bytes: number;
}

export interface EbdImportEdition {
  publisher: string;
  title: string;
  year: number;
  quarter: number;
  issue?: number | null;
  volume?: number | null;
  class: string;
}

export interface EbdImportSection {
  number: number;
  title: string;
  paragraphs: string[];
  references?: string[];
}

export interface EbdImportQuestion {
  number: number;
  text: string;
}

export interface EbdImportFigure {
  page: number;
  caption?: string | null;
  alt?: string | null;
}

export interface EbdImportReview {
  status?: 'draft' | 'reviewed' | 'published';
  reviewer?: string | null;
  reviewed_at?: string | null;
  source_hash?: string;
}

export interface EbdImportLesson {
  number: number;
  title: string;
  base_text: string;
  start_page: number;
  end_page: number;
  introduction: string[];
  sections: EbdImportSection[];
  questions: EbdImportQuestion[];
  daily_readings: EbdDailyReading[];
  figures?: EbdImportFigure[];
  review?: EbdImportReview;
}

export interface EbdImportPayload {
  schema_version: '1.0.0';
  source: EbdImportSource;
  edition: EbdImportEdition;
  lessons: EbdImportLesson[];
}

export type EbdImportValidation =
  | { ok: true; data: EbdImportPayload }
  | { ok: false; errors: string[] };

const DAYS = new Set<EbdDay>(['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']);
const SHA256 = /^[a-f0-9]{64}$/;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const nonEmptyText = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  return text.length > 0 ? text : null;
};

const integer = (value: unknown): number | null => {
  const number = typeof value === 'string' ? Number(value) : value;
  return typeof number === 'number' && Number.isInteger(number) ? number : null;
};

function readStringArray(
  value: unknown,
  path: string,
  errors: string[],
  minItems = 0,
): string[] {
  if (!Array.isArray(value)) {
    errors.push(`${path}: deve ser uma lista.`);
    return [];
  }
  const result: string[] = [];
  value.forEach((item, index) => {
    const text = nonEmptyText(item);
    if (!text) errors.push(`${path}[${index}]: texto vazio.`);
    else result.push(text);
  });
  if (result.length < minItems) errors.push(`${path}: informe pelo menos ${minItems} item(ns).`);
  return result;
}

export function validateEbdImport(value: unknown): EbdImportValidation {
  if (!isRecord(value)) return { ok: false, errors: ['O JSON precisa ser um objeto.'] };

  const errors: string[] = [];
  if (value.schema_version !== '1.0.0') {
    errors.push('schema_version deve ser "1.0.0".');
  }

  const source = isRecord(value.source) ? value.source : null;
  if (!source) errors.push('source: campo obrigatório.');
  const fileName = source ? nonEmptyText(source.file_name) : null;
  const sha256 = source && typeof source.sha256 === 'string' ? source.sha256.trim().toLowerCase() : '';
  const pageCount = source ? integer(source.page_count) : null;
  const sizeBytes = source ? integer(source.size_bytes) : null;
  if (source) {
    if (!fileName) errors.push('source.file_name: informe o nome do PDF.');
    if (!SHA256.test(sha256)) errors.push('source.sha256: use um SHA-256 em hexadecimal (64 caracteres).');
    if (pageCount === null || pageCount < 1) errors.push('source.page_count: informe um inteiro positivo.');
    if (sizeBytes === null || sizeBytes < 1) errors.push('source.size_bytes: informe um inteiro positivo.');
  }

  const edition = isRecord(value.edition) ? value.edition : null;
  if (!edition) errors.push('edition: campo obrigatório.');
  const publisher = edition ? nonEmptyText(edition.publisher) : null;
  const editionTitle = edition ? nonEmptyText(edition.title) : null;
  const year = edition ? integer(edition.year) : null;
  const quarter = edition ? integer(edition.quarter) : null;
  const className = edition ? nonEmptyText(edition.class) : null;
  const issue = edition && edition.issue != null ? integer(edition.issue) : null;
  const volume = edition && edition.volume != null ? integer(edition.volume) : null;
  if (edition) {
    if (!publisher) errors.push('edition.publisher: campo obrigatório.');
    if (!editionTitle) errors.push('edition.title: campo obrigatório.');
    if (!className) errors.push('edition.class: campo obrigatório.');
    if (year === null || year < 1900) errors.push('edition.year: informe um ano válido.');
    if (quarter === null || quarter < 1 || quarter > 4) errors.push('edition.quarter: informe 1 a 4.');
    if (issue !== null && issue < 1) errors.push('edition.issue: informe um inteiro positivo ou nulo.');
    if (volume !== null && volume < 1) errors.push('edition.volume: informe um inteiro positivo ou nulo.');
  }

  if (!Array.isArray(value.lessons) || value.lessons.length === 0) {
    errors.push('lessons: informe pelo menos uma lição.');
  }

  const lessons: EbdImportLesson[] = [];
  const numbers = new Set<number>();
  if (Array.isArray(value.lessons)) {
    value.lessons.forEach((raw, index) => {
      const lessonPath = `lessons[${index}]`;
      if (!isRecord(raw)) {
        errors.push(`${lessonPath}: deve ser um objeto.`);
        return;
      }

      const number = integer(raw.number);
      const title = nonEmptyText(raw.title);
      const baseText = nonEmptyText(raw.base_text);
      const startPage = integer(raw.start_page);
      const endPage = integer(raw.end_page);
      if (number === null || number < 1) errors.push(`${lessonPath}.number: inteiro positivo.`);
      else if (numbers.has(number)) errors.push(`${lessonPath}.number: número ${number} duplicado.`);
      else numbers.add(number);
      if (!title) errors.push(`${lessonPath}.title: campo obrigatório.`);
      if (!baseText) errors.push(`${lessonPath}.base_text: campo obrigatório.`);
      if (startPage === null || startPage < 1) errors.push(`${lessonPath}.start_page: inteiro positivo.`);
      if (endPage === null || endPage < 1) errors.push(`${lessonPath}.end_page: inteiro positivo.`);
      if (startPage !== null && endPage !== null && endPage < startPage) {
        errors.push(`${lessonPath}.end_page: não pode ser menor que start_page.`);
      }

      const introduction = readStringArray(raw.introduction, `${lessonPath}.introduction`, errors);

      const sections: EbdImportSection[] = [];
      if (!Array.isArray(raw.sections) || raw.sections.length === 0) {
        errors.push(`${lessonPath}.sections: informe pelo menos uma seção.`);
      } else {
        raw.sections.forEach((section, sectionIndex) => {
          const sectionPath = `${lessonPath}.sections[${sectionIndex}]`;
          if (!isRecord(section)) {
            errors.push(`${sectionPath}: deve ser um objeto.`);
            return;
          }
          const sectionNumber = integer(section.number);
          const sectionTitle = nonEmptyText(section.title);
          if (sectionNumber === null || sectionNumber < 1) errors.push(`${sectionPath}.number: inteiro positivo.`);
          if (!sectionTitle) errors.push(`${sectionPath}.title: campo obrigatório.`);
          const paragraphs = readStringArray(section.paragraphs, `${sectionPath}.paragraphs`, errors, 1);
          const references = section.references === undefined
            ? undefined
            : readStringArray(section.references, `${sectionPath}.references`, errors);
          if (sectionNumber !== null && sectionTitle) {
            sections.push({
              number: sectionNumber,
              title: sectionTitle,
              paragraphs,
              ...(references && references.length > 0 ? { references } : {}),
            });
          }
        });
      }

      const questions: EbdImportQuestion[] = [];
      if (!Array.isArray(raw.questions)) {
        errors.push(`${lessonPath}.questions: deve ser uma lista.`);
      } else {
        raw.questions.forEach((question, questionIndex) => {
          const questionPath = `${lessonPath}.questions[${questionIndex}]`;
          if (!isRecord(question)) {
            errors.push(`${questionPath}: deve ser um objeto.`);
            return;
          }
          const questionNumber = integer(question.number);
          const questionText = nonEmptyText(question.text);
          if (questionNumber === null || questionNumber < 1) errors.push(`${questionPath}.number: inteiro positivo.`);
          if (!questionText) errors.push(`${questionPath}.text: campo obrigatório.`);
          if (questionNumber !== null && questionText) {
            questions.push({ number: questionNumber, text: questionText });
          }
        });
      }

      const dailyReadings: EbdDailyReading[] = [];
      if (!Array.isArray(raw.daily_readings)) {
        errors.push(`${lessonPath}.daily_readings: deve ser uma lista.`);
      } else {
        raw.daily_readings.forEach((reading, readingIndex) => {
          const readingPath = `${lessonPath}.daily_readings[${readingIndex}]`;
          if (!isRecord(reading)) {
            errors.push(`${readingPath}: deve ser um objeto.`);
            return;
          }
          const day = typeof reading.day === 'string' ? reading.day.trim().toUpperCase() : '';
          const reference = nonEmptyText(reading.reference);
          if (!DAYS.has(day as EbdDay)) errors.push(`${readingPath}.day: dia inválido.`);
          if (!reference) errors.push(`${readingPath}.reference: campo obrigatório.`);
          if (DAYS.has(day as EbdDay) && reference) {
            dailyReadings.push({ day: day as EbdDay, reference });
          }
        });
      }

      const figures: EbdImportFigure[] = [];
      if (raw.figures !== undefined) {
        if (!Array.isArray(raw.figures)) {
          errors.push(`${lessonPath}.figures: deve ser uma lista.`);
        } else {
          raw.figures.forEach((figure, figureIndex) => {
            const figurePath = `${lessonPath}.figures[${figureIndex}]`;
            if (!isRecord(figure)) {
              errors.push(`${figurePath}: deve ser um objeto.`);
              return;
            }
            const figurePage = integer(figure.page);
            if (figurePage === null || figurePage < 1) errors.push(`${figurePath}.page: inteiro positivo.`);
            else {
              figures.push({
                page: figurePage,
                caption: typeof figure.caption === 'string' ? figure.caption : null,
                alt: typeof figure.alt === 'string' ? figure.alt : null,
              });
            }
          });
        }
      }

      let review: EbdImportReview | undefined;
      if (raw.review !== undefined) {
        if (!isRecord(raw.review)) {
          errors.push(`${lessonPath}.review: deve ser um objeto.`);
        } else {
          const status = raw.review.status;
          const sourceHash = typeof raw.review.source_hash === 'string' ? raw.review.source_hash.trim().toLowerCase() : '';
          if (status !== undefined && status !== 'draft' && status !== 'reviewed' && status !== 'published') {
            errors.push(`${lessonPath}.review.status: valor inválido.`);
          }
          if (sourceHash && !SHA256.test(sourceHash)) {
            errors.push(`${lessonPath}.review.source_hash: SHA-256 inválido.`);
          }
          review = {
            status: status as EbdImportReview['status'],
            reviewer: typeof raw.review.reviewer === 'string' ? raw.review.reviewer : null,
            reviewed_at: typeof raw.review.reviewed_at === 'string' ? raw.review.reviewed_at : null,
            source_hash: sourceHash || undefined,
          };
        }
      }

      if (number !== null && title && baseText && startPage !== null && endPage !== null) {
        lessons.push({
          number,
          title,
          base_text: baseText,
          start_page: startPage,
          end_page: endPage,
          introduction,
          sections: sections.sort((a, b) => a.number - b.number),
          questions: questions.sort((a, b) => a.number - b.number),
          daily_readings: dailyReadings,
          figures,
          ...(review ? { review } : {}),
        });
      }
    });
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      schema_version: '1.0.0',
      source: {
        file_name: fileName!,
        sha256,
        page_count: pageCount!,
        size_bytes: sizeBytes!,
      },
      edition: {
        publisher: publisher!,
        title: editionTitle!,
        year: year!,
        quarter: quarter!,
        issue,
        volume,
        class: className!,
      },
      lessons,
    },
  };
}

export function assertImportHash(payload: EbdImportPayload, assetSha256: string): string | null {
  if (payload.source.sha256 !== assetSha256.toLowerCase()) {
    return 'O hash SHA-256 do PDF não confere com o hash do JSON importado. Reenvie o PDF ou corrija o JSON.';
  }
  return null;
}

export function quarterSlugFor(year: number, quarter: number, className: string): string {
  const classSlug = className
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${year}-${quarter}t-${classSlug || 'turma'}`;
}

export function lessonSlugFor(quarterSlug: string, lessonNumber: number): string {
  return `${quarterSlug}-licao-${String(lessonNumber).padStart(2, '0')}`;
}
