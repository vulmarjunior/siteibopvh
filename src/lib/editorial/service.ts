import type { EditorialMediaRecord, EditorialMessageRecord, EditorialSeriesRecord, EditorialSeriesRepository } from './types.js';

function objectOrEmpty(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function extractYoutubeId(urlOrId?: string | null): string | null {
  if (!urlOrId) return null;
  if (/^[\w-]{11}$/.test(urlOrId)) return urlOrId;
  try {
    const url = new URL(urlOrId);
    if (url.hostname === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] ?? null;
    if (url.hostname.endsWith('youtube.com')) {
      return url.searchParams.get('v') || url.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/)?.[1] || null;
    }
  } catch { return null; }
  return null;
}

function normalizeMedia(media: EditorialMediaRecord) {
  const youtubeId = media.provider?.toLowerCase() === 'youtube' || media.url.includes('youtu')
    ? extractYoutubeId(media.externalId || media.url) : null;
  return { ...media, youtubeId, embedUrl: youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null };
}

export function normalizeMessage(message: EditorialMessageRecord, series: EditorialSeriesRecord) {
  const media = message.media.sort((a, b) => a.order - b.order).map(normalizeMedia);
  const video = media.find(item => item.type === 'VIDEO');
  const thumbnailUrl = video?.thumbnailUrl || (video?.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` : null) || series.defaultThumbnailUrl;
  return {
    id: message.id, slug: message.slug, order: message.order, title: message.title,
    subtitle: message.subtitle, scheduledFor: message.scheduledFor.toISOString(), biblicalText: message.biblicalText,
    speaker: message.speaker, summary: message.summary || message.description || '', description: message.description,
    contentHtml: message.contentHtml, sourceSystem: message.sourceSystem, externalId: message.externalId,
    lastSyncedAt: message.lastSyncedAt?.toISOString() ?? null,
    status: message.status, publishedAt: message.publishedAt?.toISOString() ?? null,
    section: message.section, media, materials: [...message.materials].sort((a, b) => a.order - b.order),
    readingPlan: message.readingPlan ? { ...message.readingPlan, days: [...message.readingPlan.days].sort((a, b) => a.order - b.order) } : null,
    thumbnailUrl, customFields: objectOrEmpty(message.customFields),
  };
}

export class EditorialSeriesService {
  constructor(private readonly repository: EditorialSeriesRepository, private readonly now = () => new Date()) {}

  async list() {
    const now = this.now();
    const series = await this.repository.listPublished(now);
    return series.map(item => ({
      id: item.id, slug: item.slug, title: item.title, subtitle: item.subtitle,
      description: item.description, status: item.status, startsAt: item.startsAt?.toISOString() ?? null,
      endsAt: item.endsAt?.toISOString() ?? null, capabilities: objectOrEmpty(item.capabilities),
      messageCount: item.messages.filter(message => message.status === 'PUBLISHED' && message.scheduledFor <= now).length,
    }));
  }

  async getBySlug(slug: string) {
    const now = this.now();
    const series = await this.repository.findPublishedBySlug(slug, now);
    if (!series) return null;
    const ordered = [...series.messages].sort((a, b) => a.scheduledFor.getTime() - b.scheduledFor.getTime());
    const available = ordered.filter(message => message.status === 'PUBLISHED' && message.scheduledFor <= now);
    const publicSchedule = ordered.filter(message => ['SCHEDULED', 'PUBLISHED'].includes(message.status));
    const next = ordered.find(message => ['SCHEDULED', 'PUBLISHED'].includes(message.status) && message.scheduledFor > now) ?? null;
    const current = available.length > 0 ? available[available.length - 1] : null;
    return {
      id: series.id, slug: series.slug, title: series.title, subtitle: series.subtitle,
      description: series.description, status: series.status, startsAt: series.startsAt?.toISOString() ?? null,
      endsAt: series.endsAt?.toISOString() ?? null, defaultThumbnailUrl: series.defaultThumbnailUrl,
      capabilities: objectOrEmpty(series.capabilities), customFields: objectOrEmpty(series.customFields),
      sections: [...series.sections].sort((a, b) => a.order - b.order),
      currentMessage: current ? normalizeMessage(current, series) : null,
      nextMessage: next ? normalizeMessage(next, series) : null,
      availableMessages: available.map(message => normalizeMessage(message, series)),
      messages: publicSchedule.map(message => normalizeMessage(message, series)),
    };
  }
}
