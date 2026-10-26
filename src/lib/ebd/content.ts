import type {
  EbdDailyReading,
  EbdDay,
  EbdFigure,
  EbdLessonSummary,
  EbdQuestion,
  EbdSection,
} from '../../types/ebd.js';

export const EBD_DAYS: readonly EbdDay[] = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const cleanString = (value: unknown, maxLength = 12000): string | null => {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text || text.length > maxLength) return null;
  return text;
};

const positiveInteger = (value: unknown): number | null => {
  const number = typeof value === 'string' ? Number(value) : value;
  return typeof number === 'number' && Number.isInteger(number) && number > 0 ? number : null;
};

export function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanString(item))
    .filter((item): item is string => item !== null);
}

export function normalizeSections(value: unknown): EbdSection[] {
  if (!Array.isArray(value)) return [];
  const sections: EbdSection[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    const number = positiveInteger(raw.number);
    const title = cleanString(raw.title, 400);
    if (number === null || !title) continue;
    const paragraphs = normalizeStringArray(raw.paragraphs);
    if (paragraphs.length === 0) continue;
    const references = normalizeStringArray(raw.references);
    sections.push({
      number,
      title,
      paragraphs,
      ...(references.length > 0 ? { references } : {}),
    });
  }
  return sections.sort((a, b) => a.number - b.number);
}

export function normalizeQuestions(value: unknown): EbdQuestion[] {
  if (!Array.isArray(value)) return [];
  const questions: EbdQuestion[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    const number = positiveInteger(raw.number);
    const text = cleanString(raw.text, 4000);
    if (number === null || !text) continue;
    questions.push({ number, text });
  }
  return questions.sort((a, b) => a.number - b.number);
}

export function normalizeDailyReadings(value: unknown): EbdDailyReading[] {
  if (!Array.isArray(value)) return [];
  const readings: EbdDailyReading[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    const day = typeof raw.day === 'string' ? raw.day.trim().toUpperCase() : '';
    const reference = cleanString(raw.reference, 400);
    if (!EBD_DAYS.includes(day as EbdDay) || !reference) continue;
    readings.push({ day: day as EbdDay, reference });
  }
  return readings;
}

export function normalizeFigures(value: unknown): EbdFigure[] {
  if (!Array.isArray(value)) return [];
  const figures: EbdFigure[] = [];
  for (const raw of value) {
    if (!isRecord(raw)) continue;
    const page = positiveInteger(raw.page);
    if (page === null) continue;
    const caption = typeof raw.caption === 'string' ? raw.caption.trim() || null : null;
    const alt = typeof raw.alt === 'string' ? raw.alt.trim() || null : null;
    figures.push({ page, caption, alt });
  }
  return figures;
}

export function quarterLabel(year: number, quarter: number): string {
  return `${quarter}º trimestre de ${year}`;
}

export function formatPageRange(startPage: number, endPage: number): string {
  return startPage === endPage ? `p. ${startPage}` : `p. ${startPage}–${endPage}`;
}

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;
}

export function pdfDownloadPath(quarterId: string): string {
  return `/api/ebd/quarters/${encodeURIComponent(quarterId)}/pdf`;
}

export function buildLessonNavigation(
  lessons: ReadonlyArray<Pick<EbdLessonSummary, 'number' | 'slug' | 'title'>>,
  currentNumber: number,
) {
  const ordered = [...lessons].sort((a, b) => a.number - b.number);
  const position = ordered.findIndex((lesson) => lesson.number === currentNumber);
  if (position < 0) return { previous: null, next: null };
  const toItem = (lesson: Pick<EbdLessonSummary, 'number' | 'slug' | 'title'>) => ({
    number: lesson.number,
    slug: lesson.slug,
    title: lesson.title,
  });
  return {
    previous: position > 0 ? toItem(ordered[position - 1]) : null,
    next: position >= 0 && position < ordered.length - 1 ? toItem(ordered[position + 1]) : null,
  };
}
