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

export interface EbdLessonSummary {
  number: number;
  slug: string;
  title: string;
  baseText: string;
  startPage: number;
  endPage: number;
}

export interface EbdQuarterSummary {
  id: string;
  slug: string;
  year: number;
  quarter: number;
  className: string;
  publisher: string;
  title: string;
  issue: number | null;
  volume: number | null;
  lessonCount: number;
  publishedAt: string | null;
  lessons: EbdLessonSummary[];
}

export interface EbdQuarterRef {
  id: string;
  slug: string;
  year: number;
  quarter: number;
  className: string;
  title: string;
  publisher: string;
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
}

export interface EbdLessonDetail extends EbdLessonSummary {
  introduction: string[];
  sections: EbdSection[];
  questions: EbdQuestion[];
  dailyReadings: EbdDailyReading[];
  figures: EbdFigure[];
  quarter: EbdQuarterRef;
  index: EbdLessonSummary[];
  navigation: {
    previous: EbdLessonNavigationItem | null;
    next: EbdLessonNavigationItem | null;
  };
  pdf: EbdPdfInfo | null;
}

export interface EbdQuartersResponse {
  quarters: EbdQuarterSummary[];
}

export interface EbdLessonResponse {
  lesson: EbdLessonDetail;
}
