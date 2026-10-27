import type {
  EbdDailyReading,
  EbdLessonSummary,
  EbdQuestion,
  EbdSearchResult,
  EbdSearchSnippet,
  EbdSection,
} from '../../types/ebd.js';

export interface EbdSearchableLesson extends EbdLessonSummary {
  introduction: string[];
  sections: EbdSection[];
  questions: EbdQuestion[];
  dailyReadings: EbdDailyReading[];
}

const DIACRITIC_GROUPS: Record<string, string> = {
  a: 'aáàâãä',
  e: 'eéèêë',
  i: 'iíìîï',
  o: 'oóòôõö',
  u: 'uúùûü',
  c: 'cç',
  n: 'nñ',
  y: 'yýÿ',
};

const REGEX_SPECIAL = /[.*+?^${}()|[\]\\]/g;

function escapeRegex(character: string): string {
  return character.replace(REGEX_SPECIAL, '\\$&');
}

/**
 * Normaliza texto para busca: caixa baixa, sem acentos e com espaços simples.
 */
export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Constrói uma expressão que encontra a busca mesmo quando o texto original
 * usa acentos ou caixa diferente (ex.: "criacao" encontra "criação").
 */
export function buildAccentInsensitivePattern(query: string): RegExp | null {
  const normalized = normalizeForSearch(query);
  if (normalized.length < 2) return null;

  let pattern = '';
  for (const character of normalized) {
    if (/\s/.test(character)) {
      pattern += '\\s+';
      continue;
    }
    const group = DIACRITIC_GROUPS[character];
    pattern += group ? `[${group}]` : escapeRegex(character);
  }
  return new RegExp(pattern, 'gi');
}

export function buildLessonSearchText(lesson: Omit<EbdSearchableLesson, keyof EbdLessonSummary>): string {
  const parts: string[] = [];

  for (const paragraph of lesson.introduction) parts.push(paragraph);

  for (const section of lesson.sections) {
    parts.push(`${section.number}. ${section.title}`);
    parts.push(...section.paragraphs);
    if (section.references && section.references.length > 0) {
      parts.push(`Referências: ${section.references.join('; ')}`);
    }
  }

  if (lesson.questions.length > 0) {
    parts.push('Para pensar e agir');
    parts.push(...lesson.questions.map((question) => question.text));
  }

  if (lesson.dailyReadings.length > 0) {
    parts.push('Leitura diária');
    parts.push(...lesson.dailyReadings.map((reading) => `${reading.day}: ${reading.reference}`));
  }

  return parts.filter((part) => part.trim().length > 0).join('\n\n');
}

export function findLessonMatches(
  text: string,
  query: string,
  maxSnippets = 2,
  contextCharacters = 90,
): { matches: number; snippets: EbdSearchSnippet[] } {
  const expression = buildAccentInsensitivePattern(query);
  if (!expression) return { matches: 0, snippets: [] };

  const snippets: EbdSearchSnippet[] = [];
  let matches = 0;
  let match: RegExpExecArray | null;

  while ((match = expression.exec(text)) !== null) {
    matches += 1;

    if (snippets.length < maxSnippets) {
      const start = Math.max(0, match.index - contextCharacters);
      const end = Math.min(text.length, match.index + match[0].length + contextCharacters);
      const before = text.slice(start, match.index).replace(/\s+/g, ' ');
      const after = text.slice(match.index + match[0].length, end).replace(/\s+/g, ' ');
      snippets.push({
        before: `${start > 0 ? '… ' : ''}${before}`,
        match: match[0].replace(/\s+/g, ' '),
        after: `${after}${end < text.length ? ' …' : ''}`,
      });
    }

    if (matches >= 500) break;
  }

  return { matches, snippets };
}

export function searchLessons(lessons: EbdSearchableLesson[], query: string): EbdSearchResult[] {
  const normalizedQuery = normalizeForSearch(query);
  if (normalizedQuery.length < 2) return [];

  const ordered = [...lessons].sort((a, b) => a.number - b.number);
  const results: EbdSearchResult[] = [];

  for (const lesson of ordered) {
    const text = [
      lesson.title,
      `Texto base: ${lesson.baseText}`,
      buildLessonSearchText(lesson),
    ]
      .filter((part) => part.trim().length > 0)
      .join('\n\n');

    const { matches, snippets } = findLessonMatches(text, query);
    if (matches === 0) continue;

    results.push({
      lesson: {
        number: lesson.number,
        slug: lesson.slug,
        title: lesson.title,
        baseText: lesson.baseText,
        startPage: lesson.startPage,
        endPage: lesson.endPage,
        scheduledOn: lesson.scheduledOn,
      },
      matches,
      snippets,
    });
  }

  return results;
}
