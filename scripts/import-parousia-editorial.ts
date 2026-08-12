import { PrismaClient, type EditorialMessageStatus, type EditorialMediaType } from '@prisma/client';
import { readFile } from 'node:fs/promises';
import type { Sermon } from '../src/types/parousia.js';

const prisma = new PrismaClient();
const SERIES_SLUG = 'da-ascensao-a-parousia';
const source = JSON.parse(await readFile(new URL('../src/data/sermoes.json', import.meta.url), 'utf8')) as Sermon[];

const slugify = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const clean = (value?: string) => value?.trim() || null;
const sermonDate = (date: string) => new Date(`${date}T13:30:00.000Z`);
const statusFor = (sermon: Sermon, now: Date): EditorialMessageStatus => sermonDate(sermon.data) <= now ? 'PUBLISHED' : 'SCHEDULED';

async function run() {
  const now = new Date();
  const series = await prisma.editorialSeries.upsert({
    where: { slug: SERIES_SLUG },
    create: {
      slug: SERIES_SLUG, title: 'Da Ascensão à Parousia', subtitle: 'O Livro da Longa Peregrinação',
      description: 'A caminhada da Igreja desde a ascensão de Cristo até a esperança final da Nova Jerusalém.',
      status: 'PUBLISHED', startsAt: sermonDate(source[0].data), endsAt: sermonDate(source[source.length - 1].data), publishedAt: now,
      defaultThumbnailUrl: '/images/serie-da-ascensao-a-parousia/thumb-padrao.jpg',
      capabilities: { video: true, audio: true, materials: true, readingPlan: true, sections: true },
      customFields: { source: 'sermoes.json', version: 1 },
    },
    update: {
      title: 'Da Ascensão à Parousia', subtitle: 'O Livro da Longa Peregrinação',
      description: 'A caminhada da Igreja desde a ascensão de Cristo até a esperança final da Nova Jerusalém.',
      startsAt: sermonDate(source[0].data), endsAt: sermonDate(source[source.length - 1].data),
      defaultThumbnailUrl: '/images/serie-da-ascensao-a-parousia/thumb-padrao.jpg',
      capabilities: { video: true, audio: true, materials: true, readingPlan: true, sections: true },
      customFields: { source: 'sermoes.json', version: 1 },
    },
  });

  for (const sermon of source) {
    const order = Number(sermon.numero);
    const status = statusFor(sermon, now);
    const message = await prisma.editorialMessage.upsert({
      where: { seriesId_slug: { seriesId: series.id, slug: sermon.slug } },
      create: {
        seriesId: series.id, slug: sermon.slug || slugify(sermon.titulo), order, title: sermon.titulo,
        scheduledFor: sermonDate(sermon.data), biblicalText: sermon.textoBiblico, summary: clean(sermon.descricao),
        description: clean(sermon.descricao), status, publishedAt: status === 'PUBLISHED' ? sermonDate(sermon.data) : null,
        customFields: { ato: sermon.ato || '', movimento: sermon.movimento || '', artes: sermon.artes || {}, statusManual: sermon.statusManual || '' },
      },
      update: {
        order, title: sermon.titulo, scheduledFor: sermonDate(sermon.data), biblicalText: sermon.textoBiblico,
        summary: clean(sermon.descricao), description: clean(sermon.descricao), status,
        publishedAt: status === 'PUBLISHED' ? sermonDate(sermon.data) : null,
        customFields: { ato: sermon.ato || '', movimento: sermon.movimento || '', artes: sermon.artes || {}, statusManual: sermon.statusManual || '' },
      },
    });

    await prisma.$transaction(async tx => {
      await tx.editorialMedia.deleteMany({ where: { messageId: message.id } });
      await tx.editorialMaterial.deleteMany({ where: { messageId: message.id } });
      await tx.editorialReadingPlan.deleteMany({ where: { messageId: message.id } });
      const media: { type: EditorialMediaType; title: string; url: string; provider?: string; externalId?: string; order: number }[] = [];
      if (clean(sermon.youtubeUrl) || clean(sermon.youtubeId)) media.push({ type: 'VIDEO', title: 'Mensagem completa', url: clean(sermon.youtubeUrl) || `https://www.youtube.com/watch?v=${sermon.youtubeId}`, provider: 'youtube', externalId: clean(sermon.youtubeId) || undefined, order: 1 });
      if (clean(sermon.audioUrl)) media.push({ type: 'AUDIO', title: 'Áudio da mensagem', url: sermon.audioUrl!, order: 2 });
      for (const [key, url] of Object.entries(sermon.artes || {}).filter((entry): entry is [string, string] => Boolean(clean(entry[1])))) media.push({ type: 'IMAGE', title: key, url, order: media.length + 1 });
      if (media.length) await tx.editorialMedia.createMany({ data: media.map(item => ({ ...item, messageId: message.id })) });
      const materials = [...(sermon.materiais || []).map((item, index) => ({ messageId: message.id, title: item.titulo, type: item.tipo || 'LINK', url: item.url, order: index + 1 }))];
      if (clean(sermon.pdfUrl)) materials.push({ messageId: message.id, title: 'Esboço da mensagem', type: 'PDF', url: sermon.pdfUrl!, order: materials.length + 1 });
      if (materials.length) await tx.editorialMaterial.createMany({ data: materials });
      if (sermon.leituras?.tema && sermon.leituras.dias.length) await tx.editorialReadingPlan.create({ data: { messageId: message.id, theme: sermon.leituras.tema, days: { create: sermon.leituras.dias.map((day, index) => ({ order: index + 1, dayLabel: day.dia, biblicalText: day.texto, description: clean(day.descricao) })) } } });
    });
  }

  const imported = await prisma.editorialMessage.findMany({ where: { seriesId: series.id }, include: { media: true, materials: true, readingPlan: { include: { days: true } } }, orderBy: { order: 'asc' } });
  const sourceBySlug = new Map(source.map(item => [item.slug, item]));
  const importedBySlug = new Map(imported.map(item => [item.slug, item]));
  const missing = source.filter(item => !importedBySlug.has(item.slug)).map(item => item.slug);
  const extra = imported.filter(item => !sourceBySlug.has(item.slug)).map(item => item.slug);
  const divergences = imported.flatMap(item => {
    const original = sourceBySlug.get(item.slug); if (!original) return [];
    const expectedMedia = Number(Boolean(clean(original.youtubeUrl) || clean(original.youtubeId))) + Number(Boolean(clean(original.audioUrl))) + Object.values(original.artes || {}).filter(Boolean).length;
    const expectedMaterials = (original.materiais || []).length + Number(Boolean(clean(original.pdfUrl)));
    const expectedReadings = original.leituras?.dias.length || 0;
    const fields = [item.order !== Number(original.numero) && 'order', item.title !== original.titulo && 'title', item.biblicalText !== original.textoBiblico && 'biblicalText', item.media.length !== expectedMedia && 'media', item.materials.length !== expectedMaterials && 'materials', (item.readingPlan?.days.length || 0) !== expectedReadings && 'readingDays'].filter(Boolean);
    return fields.length ? [{ slug: item.slug, fields }] : [];
  });
  console.log(JSON.stringify({ seriesId: series.id, sourceCount: source.length, importedCount: imported.length, missing, extra, divergences }, null, 2));
}

run().finally(() => prisma.$disconnect());
