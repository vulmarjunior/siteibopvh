import { describe, expect, it } from 'vitest';
import { EditorialSeriesService, extractYoutubeId } from '../service';
import type { EditorialSeriesRecord, EditorialSeriesRepository } from '../types';

const series: EditorialSeriesRecord = {
  id: 'series-1', slug: 'serie-teste', title: 'Série teste', subtitle: null, description: null,
  status: 'PUBLISHED', startsAt: new Date('2026-08-01T00:00:00Z'), endsAt: null,
  publishedAt: new Date('2026-08-01T00:00:00Z'), defaultThumbnailUrl: '/fallback.jpg', capabilities: {}, customFields: {},
  sections: [], messages: [
    { id: 'm1', slug: 'passada', order: 1, title: 'Passada', subtitle: null, scheduledFor: new Date('2026-08-02T00:00:00Z'), biblicalText: 'João 1', speaker: null, summary: null, description: null, status: 'PUBLISHED', publishedAt: new Date('2026-08-02T00:00:00Z'), customFields: {}, section: null, media: [{ id: 'v1', type: 'VIDEO', title: null, url: 'https://youtu.be/dQw4w9WgXcQ', provider: 'youtube', externalId: null, thumbnailUrl: null, order: 1 }], materials: [], readingPlan: null },
    { id: 'm2', slug: 'futura', order: 2, title: 'Futura', subtitle: null, scheduledFor: new Date('2026-08-10T00:00:00Z'), biblicalText: 'João 2', speaker: null, summary: null, description: null, status: 'SCHEDULED', publishedAt: null, customFields: {}, section: null, media: [], materials: [], readingPlan: null },
  ],
};

const repository: EditorialSeriesRepository = {
  async listPublished() { return [series]; },
  async findPublishedBySlug(slug) { return slug === series.slug ? series : null; },
};

describe('EditorialSeriesService', () => {
  const service = new EditorialSeriesService(repository, () => new Date('2026-08-08T00:00:00Z'));
  it('identifica mensagem atual, próxima e disponíveis pela data e status', async () => {
    const result = await service.getBySlug('serie-teste');
    expect(result?.currentMessage?.slug).toBe('passada');
    expect(result?.nextMessage?.slug).toBe('futura');
    expect(result?.availableMessages.map(message => message.slug)).toEqual(['passada']);
  });
  it('aplica thumbnail automática do YouTube e fallbacks previsíveis', async () => {
    const result = await service.getBySlug('serie-teste');
    expect(result?.currentMessage?.thumbnailUrl).toContain('dQw4w9WgXcQ');
    expect(result?.currentMessage?.summary).toBe('');
    expect(result?.currentMessage?.materials).toEqual([]);
  });
  it('não expõe série inexistente', async () => { expect(await service.getBySlug('outra')).toBeNull(); });
});

describe('extractYoutubeId', () => {
  it.each([
    ['dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/embed/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
  ])('normaliza %s', (input, expected) => expect(extractYoutubeId(input)).toBe(expected));
});
