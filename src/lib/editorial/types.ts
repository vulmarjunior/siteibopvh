export type SeriesStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ENDED' | 'ARCHIVED';
export type MessageStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type MediaType = 'VIDEO' | 'AUDIO' | 'IMAGE';

export interface EditorialMediaRecord { id: string; type: MediaType; title: string | null; url: string; provider: string | null; externalId: string | null; thumbnailUrl: string | null; order: number }
export interface EditorialMaterialRecord { id: string; title: string; type: string; url: string; order: number }
export interface EditorialReadingDayRecord { id: string; order: number; dayLabel: string; biblicalText: string; description: string | null }
export interface EditorialReadingPlanRecord { id: string; theme: string; days: EditorialReadingDayRecord[] }
export interface EditorialSectionRecord { id: string; slug: string; title: string; order: number }
export interface EditorialMessageRecord {
  id: string; slug: string; order: number; title: string; subtitle: string | null;
  scheduledFor: Date; biblicalText: string; speaker: string | null; summary: string | null;
  description: string | null; contentHtml?: string | null; sourceSystem?: string | null;
  externalId?: string | null; lastSyncedAt?: Date | null; status: MessageStatus;
  publishedAt: Date | null; customFields: unknown;
  section: EditorialSectionRecord | null; media: EditorialMediaRecord[]; materials: EditorialMaterialRecord[];
  readingPlan: EditorialReadingPlanRecord | null;
}
export interface EditorialSeriesRecord {
  id: string; slug: string; title: string; subtitle: string | null; description: string | null;
  status: SeriesStatus; startsAt: Date | null; endsAt: Date | null; publishedAt: Date | null;
  defaultThumbnailUrl: string | null; capabilities: unknown; customFields: unknown;
  sections: EditorialSectionRecord[]; messages: EditorialMessageRecord[];
}

export interface EditorialSeriesRepository {
  listPublished(now: Date): Promise<EditorialSeriesRecord[]>;
  findPublishedBySlug(slug: string, now: Date): Promise<EditorialSeriesRecord | null>;
}
