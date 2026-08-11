import type { PrismaClient } from '@prisma/client';
import type { EditorialSeriesRecord, EditorialSeriesRepository } from './types.js';

const include = {
  sections: { orderBy: { order: 'asc' as const } },
  messages: {
    include: { section: true, media: { orderBy: { order: 'asc' as const } }, materials: { orderBy: { order: 'asc' as const } }, readingPlan: { include: { days: { orderBy: { order: 'asc' as const } } } } },
    orderBy: { scheduledFor: 'asc' as const },
  },
};

export class PrismaEditorialSeriesRepository implements EditorialSeriesRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async listPublished(now: Date) {
    return this.prisma.editorialSeries.findMany({ where: { status: { in: ['PUBLISHED', 'ENDED'] }, publishedAt: { lte: now } }, include, orderBy: { startsAt: 'desc' } }) as unknown as EditorialSeriesRecord[];
  }
  async findPublishedBySlug(slug: string, now: Date) {
    return this.prisma.editorialSeries.findFirst({ where: { slug, status: { in: ['PUBLISHED', 'ENDED'] }, publishedAt: { lte: now } }, include }) as unknown as EditorialSeriesRecord | null;
  }
}
