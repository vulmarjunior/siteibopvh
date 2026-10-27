export type EbdDay = 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SÁB' | 'DOM';

export interface EbdSection {
  number: number;
  title: string;
  paragraphs: string[];
  references?: string[];
}

export interface EbdQuestion {
  number: number;
  text: string;
}

export interface EbdDailyReading {
  day: EbdDay;
  reference: string;
}

export interface EbdFigure {
  page: number;
  caption?: string | null;
  alt?: string | null;
}

/** A edição é a revista: proveniência editorial, nunca o rótulo público. */
export interface EbdEditionRef {
  id: string;
  publisher: string;
  year: number;
  quarter: number;
  className: string;
  title: string;
  issue: number | null;
  volume: number | null;
}

export interface EbdLessonSummary {
  number: number;
  slug: string;
  title: string;
  baseText: string;
  startPage: number;
  endPage: number;
  /** Data calculada do encontro neste ciclo (YYYY-MM-DD). */
  scheduledOn: string | null;
}

/** O ciclo é o uso da edição: turma, datas e rótulo público por período. */
export interface EbdCycleSummary {
  id: string;
  slug: string;
  className: string;
  startsOn: string;
  weekday: number;
  periodLabel: string;
  publishedAt: string | null;
  edition: EbdEditionRef;
  lessons: EbdLessonSummary[];
}

export interface EbdCycleRef {
  id: string;
  slug: string;
  className: string;
  startsOn: string;
  weekday: number;
  periodLabel: string;
}

export interface EbdPdfInfo {
  fileName: string;
  sizeBytes: number;
  pageCount: number;
  downloadUrl: string;
  page: number;
}

export interface EbdLessonNavigationItem {
  number: number;
  slug: string;
  title: string;
  scheduledOn: string | null;
}

export interface EbdLessonDetail extends EbdLessonSummary {
  introduction: string[];
  sections: EbdSection[];
  questions: EbdQuestion[];
  dailyReadings: EbdDailyReading[];
  figures: EbdFigure[];
  cycle: EbdCycleRef;
  edition: EbdEditionRef;
  index: EbdLessonSummary[];
  navigation: {
    previous: EbdLessonNavigationItem | null;
    next: EbdLessonNavigationItem | null;
  };
  pdf: EbdPdfInfo | null;
}

export interface EbdCyclesResponse {
  cycles: EbdCycleSummary[];
}

export interface EbdCycleResponse {
  cycle: EbdCycleSummary;
}

export interface EbdLessonResponse {
  lesson: EbdLessonDetail;
}

export interface EbdSearchSnippet {
  before: string;
  match: string;
  after: string;
}

export interface EbdSearchResult {
  lesson: EbdLessonSummary;
  matches: number;
  snippets: EbdSearchSnippet[];
}

export interface EbdSearchResponse {
  query: string;
  cycle: EbdCycleRef & { lessonCount: number };
  results: EbdSearchResult[];
}

export interface EbdProgressEntry {
  read: boolean;
  scrollPercent: number;
  updatedAt: string;
}

export type EbdProgressStore = Record<string, EbdProgressEntry>;
