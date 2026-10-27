import type {
  EbdDailyReading,
  EbdFigure,
  EbdQuestion,
  EbdSection,
} from './ebd.js';

export type EbdAdminStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

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

export interface EbdAdminQuarterSummary {
  id: string;
  slug: string;
  year: number;
  quarter: number;
  className: string;
  publisher: string;
  title: string;
  issue: number | null;
  volume: number | null;
  status: EbdAdminStatus;
  publishedAt: string | null;
  publishedBy: string | null;
  createdAt: string;
  updatedAt: string;
  lessonCount: number;
  publishedLessonCount: number;
  pdfAssetCount: number;
  latestPdfVersion: number;
}

export interface EbdAdminQuarterDetail {
  id: string;
  slug: string;
  year: number;
  quarter: number;
  className: string;
  publisher: string;
  title: string;
  issue: number | null;
  volume: number | null;
  status: EbdAdminStatus;
  publishedAt: string | null;
  publishedBy: string | null;
  sourceFileName: string | null;
  sourceSha256: string | null;
  sourcePageCount: number | null;
  sourceSizeBytes: number | null;
  createdAt: string;
  updatedAt: string;
  lessons: EbdAdminLessonSummary[];
  pdfAssets: EbdAdminPdfAsset[];
}

export interface EbdAdminLessonDetail {
  id: string;
  quarterId: string;
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
  quarter: {
    id: string;
    slug: string;
    year: number;
    quarter: number;
    className: string;
    title: string;
    status: EbdAdminStatus;
  };
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
  quarter: EbdAdminQuarterDetail;
  imported: number;
  warnings: string[];
  assetId: string;
  sha256: string;
}
