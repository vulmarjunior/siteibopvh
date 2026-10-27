import type {
  EbdDailyReading,
  EbdFigure,
  EbdQuestion,
  EbdSection,
} from './ebd.js';

export type EbdAdminStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type EbdScheduleKind = 'RULE' | 'RESCHEDULED' | 'NO_MEETING';

export interface EbdAdminEditionRef {
  id: string;
  publisher: string;
  year: number;
  quarter: number;
  className: string;
  title: string;
  issue: number | null;
  volume: number | null;
}

export interface EbdAdminPdfAsset {
  id: string;
  version: number;
  fileName: string;
  storagePath: string | null;
  sha256: string;
  sizeBytes: number;
  pageCount: number;
  uploadedBy: string | null;
  createdAt: string;
}

export interface EbdAdminLessonSummary {
  id: string;
  number: number;
  slug: string;
  title: string;
  baseText: string;
  startPage: number;
  endPage: number;
  status: EbdAdminStatus;
  publishedAt: string | null;
  publishedBy: string | null;
  reviewedAt: string | null;
  updatedAt: string;
}

export interface EbdAdminEditionSummary extends EbdAdminEditionRef {
  sourceFileName: string | null;
  sourceSha256: string | null;
  sourcePageCount: number | null;
  sourceSizeBytes: number | null;
  createdAt: string;
  updatedAt: string;
  lessonCount: number;
  publishedLessonCount: number;
  pdfAssetCount: number;
  latestPdfVersion: number;
  cycleCount: number;
  publishedCycleCount: number;
}

export interface EbdAdminCycleSummary {
  id: string;
  editionId: string;
  slug: string;
  className: string;
  startsOn: string;
  weekday: number;
  anchorRevision: number;
  status: EbdAdminStatus;
  publishedAt: string | null;
  periodLabel: string;
  firstDate: string;
  lastDate: string;
  lessonCount: number;
  publishedLessonCount: number;
  edition: EbdAdminEditionRef;
}

/** Resumo do ciclo exibido dentro da edição (sem agenda completa). */
export interface EbdAdminEditionCycleSummary {
  id: string;
  slug: string;
  className: string;
  startsOn: string;
  weekday: number;
  anchorRevision: number;
  status: EbdAdminStatus;
  publishedAt: string | null;
  periodLabel: string;
  lessonCount: number;
}

export interface EbdAdminEditionDetail extends EbdAdminEditionRef {
  sourceFileName: string | null;
  sourceSha256: string | null;
  sourcePageCount: number | null;
  sourceSizeBytes: number | null;
  createdAt: string;
  updatedAt: string;
  lessons: EbdAdminLessonSummary[];
  pdfAssets: EbdAdminPdfAsset[];
  cycles: EbdAdminEditionCycleSummary[];
}

/** Linha da agenda: conteúdo da lição + data calculada no ciclo. */
export interface EbdAdminScheduleLesson extends EbdAdminLessonSummary {
  lessonNumber: number;
  date: string | null;
  ruleDate: string | null;
  exceptionKind: EbdScheduleKind;
  scheduledOn: string | null;
  divergesFromRule: boolean;
  sharesDateWith: number[];
}

export interface EbdAdminCycleDetail {
  id: string;
  editionId: string;
  slug: string;
  className: string;
  startsOn: string;
  weekday: number;
  anchorRevision: number;
  status: EbdAdminStatus;
  publishedAt: string | null;
  publishedBy: string | null;
  createdAt: string;
  updatedAt: string;
  edition: EbdAdminEditionRef;
  periodLabel: string;
  firstDate: string;
  lastDate: string;
  lessons: EbdAdminScheduleLesson[];
}

export interface EbdSchedulePreviewEntry {
  lessonNumber: number;
  date: string;
  ruleDate: string;
  exceptionKind: EbdScheduleKind;
  scheduledOn: string | null;
  divergesFromRule: boolean;
  sharesDateWith: number[];
}

export interface EbdSchedulePreview {
  startsOn: string;
  weekday: number;
  anchorRevision: number;
  entries: EbdSchedulePreviewEntry[];
  firstDate: string;
  lastDate: string;
  periodLabel: string;
}

export interface EbdAdminLessonCycleInfo {
  id: string;
  slug: string;
  className: string;
  startsOn: string;
  weekday: number;
  status: EbdAdminStatus;
  periodLabel: string;
  lessonNumber: number;
  date: string | null;
  exceptionKind: EbdScheduleKind;
  divergesFromRule: boolean;
}

export interface EbdAdminLessonDetail {
  id: string;
  editionId: string;
  number: number;
  slug: string;
  title: string;
  baseText: string;
  startPage: number;
  endPage: number;
  introduction: string[];
  sections: EbdSection[];
  questions: EbdQuestion[];
  dailyReadings: EbdDailyReading[];
  figures: EbdFigure[];
  status: EbdAdminStatus;
  sourceHash: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  publishedBy: string | null;
  createdAt: string;
  updatedAt: string;
  edition: EbdAdminEditionRef;
  cycles: EbdAdminLessonCycleInfo[];
}

export interface EbdAdminAuditEntry {
  id: number;
  usuarioEmail: string | null;
  acao: string;
  entidade: string;
  entidadeId: string;
  dados: Record<string, unknown> | null;
  criadoEm: string;
}

export type EbdAdminUploadTarget =
  | {
      mode: 'local';
      uploadUrl: string;
      token: string;
      path: string;
      version: number;
      maxBytes: number;
    }
  | {
      mode: 'supabase';
      bucket: string;
      path: string;
      token: string;
      signedUrl: string;
      version: number;
      maxBytes: number;
    };

export interface EbdAdminImportResponse {
  edition: EbdAdminEditionDetail;
  imported: number;
  warnings: string[];
  assetId: string;
  sha256: string;
}
