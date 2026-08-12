import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSermonStatus } from '../parousia-utils';
import { toParousiaSermon } from '../parousia-editorial-client';

const base = { order: 7, slug: 'teste', title: 'Mensagem', scheduledFor: '2026-08-09T13:30:00.000Z', biblicalText: 'Atos 8.1–8', summary: 'Resumo', description: null, customFields: { movimento: 'Dispersão', ato: '' }, materials: [], readingPlan: null };

describe('adaptador editorial da Parousia', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-08-12T12:00:00-04:00')); });
  afterEach(() => vi.useRealTimers());

  it('mantém mensagem futura como em breve', () => {
    const sermon = toParousiaSermon({ ...base, scheduledFor: '2026-08-16T13:30:00.000Z', status: 'SCHEDULED', media: [] });
    expect(sermon.numero).toBe('07'); expect(getSermonStatus(sermon)).toBe('em_breve');
  });
  it('muda automaticamente uma mensagem agendada passada para materiais em breve', () => {
    const sermon = toParousiaSermon({ ...base, status: 'SCHEDULED', media: [] });
    expect(getSermonStatus(sermon)).toBe('pregado_materiais_em_breve');
  });
  it('mantém mensagem passada incompleta visível, com materiais em breve', () => {
    const sermon = toParousiaSermon({ ...base, status: 'PUBLISHED', media: [] });
    expect(getSermonStatus(sermon)).toBe('pregado_materiais_em_breve');
  });
  it('normaliza vídeo, thumbnail, materiais e leituras', () => {
    const sermon = toParousiaSermon({ ...base, status: 'PUBLISHED', media: [{ type: 'VIDEO', url: 'https://youtu.be/dQw4w9WgXcQ', youtubeId: 'dQw4w9WgXcQ' }, { type: 'IMAGE', title: 'thumb', url: '/thumb.jpg' }], materials: [{ title: 'Esboço', type: 'PDF', url: '/esboco.pdf' }], readingPlan: { theme: 'Tema', days: [{ dayLabel: 'Segunda', biblicalText: 'João 1', description: 'Leia' }] } });
    expect(getSermonStatus(sermon)).toBe('disponivel'); expect(sermon.youtubeId).toBe('dQw4w9WgXcQ'); expect(sermon.artes?.thumb).toBe('/thumb.jpg'); expect(sermon.pdfUrl).toBe('/esboco.pdf'); expect(sermon.leituras?.dias).toHaveLength(1);
  });
  it('considera o texto completo um material disponível', () => {
    const sermon = toParousiaSermon({ ...base, status: 'PUBLISHED', contentHtml: '<p>Texto do sermão</p>', media: [] });
    expect(getSermonStatus(sermon)).toBe('disponivel');
  });
});
