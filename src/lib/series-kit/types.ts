export type PublicSeriesStatus = 'PUBLISHED' | 'ENDED';
export type PublicMessageStatus = 'SCHEDULED' | 'PUBLISHED';
export type PublicMediaType = 'VIDEO' | 'AUDIO' | 'IMAGE';
export type SeriesLifecycle = 'prelaunch' | 'active' | 'ended';

export interface PublicSeriesSection { id: string; slug: string; title: string; order: number }
export interface PublicSeriesMedia { id: string; type: PublicMediaType; title: string | null; url: string; provider: string | null; externalId: string | null; thumbnailUrl: string | null; order: number; youtubeId: string | null; embedUrl: string | null }
export interface PublicSeriesMaterial { id: string; title: string; type: string; url: string; order: number }
export interface PublicSeriesReadingDay { id: string; order: number; dayLabel: string; biblicalText: string; description: string | null }

export interface PublicSeriesMessage<TCustomFields extends Record<string, unknown> = Record<string, unknown>> {
  id: string; slug: string; order: number; title: string; subtitle: string | null; scheduledFor: string;
  biblicalText: string; speaker: string | null; summary: string; description: string | null; contentHtml: string | null;
  status: PublicMessageStatus; publishedAt: string | null; section: PublicSeriesSection | null;
  media: PublicSeriesMedia[]; materials: PublicSeriesMaterial[];
  readingPlan: { id: string; theme: string; days: PublicSeriesReadingDay[] } | null;
  thumbnailUrl: string | null; customFields: TCustomFields;
}

export interface PublicSeries<TSeriesFields extends Record<string, unknown> = Record<string, unknown>, TMessageFields extends Record<string, unknown> = Record<string, unknown>> {
  id: string; slug: string; title: string; subtitle: string | null; description: string | null;
  status: PublicSeriesStatus; startsAt: string | null; endsAt: string | null; defaultThumbnailUrl: string | null;
  capabilities: Record<string, boolean>; customFields: TSeriesFields; sections: PublicSeriesSection[];
  currentMessage: PublicSeriesMessage<TMessageFields> | null; nextMessage: PublicSeriesMessage<TMessageFields> | null;
  availableMessages: PublicSeriesMessage<TMessageFields>[]; messages: PublicSeriesMessage<TMessageFields>[];
}

export type SeriesLoadState<TSeries extends PublicSeries = PublicSeries> =
  | { status: 'loading'; series: null; error: null; lifecycle: null }
  | { status: 'ready'; series: TSeries; error: null; lifecycle: SeriesLifecycle }
  | { status: 'not-found'; series: null; error: null; lifecycle: null }
  | { status: 'error'; series: null; error: Error; lifecycle: null };

