import { describe, expect, it, vi } from 'vitest';
import { createSeriesClient, getSeriesLifecycle, SeriesApiError } from '../client';

const base = { status: 'PUBLISHED' as const, startsAt: null, endsAt: null };
describe('series kit', () => {
  it('identifica pré-estreia, atividade e encerramento', () => {
    const now = new Date('2026-08-10T12:00:00Z');
    expect(getSeriesLifecycle({ ...base, startsAt: '2026-08-11T00:00:00Z' }, now)).toBe('prelaunch');
    expect(getSeriesLifecycle(base, now)).toBe('active');
    expect(getSeriesLifecycle({ ...base, status: 'ENDED' }, now)).toBe('ended');
  });
  it('retorna null para série inexistente', async () => {
    const fetcher = vi.fn(async () => new Response('{}', { status: 404 }));
    expect(await createSeriesClient({ fetcher }).get('inexistente')).toBeNull();
  });
  it('preserva mensagem e status dos erros da API', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ error: 'Indisponível' }), { status: 503, headers: { 'Content-Type': 'application/json' } }));
    await expect(createSeriesClient({ fetcher }).get('teste')).rejects.toEqual(new SeriesApiError('Indisponível', 503));
  });
  it('codifica o slug e entrega o contrato sem conhecer Prisma', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ id: '1', slug: 'serie teste' }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const result = await createSeriesClient({ baseUrl: '/api/series/', fetcher }).get('serie teste');
    expect(fetcher).toHaveBeenCalledWith('/api/series/serie%20teste', expect.any(Object));
    expect(result?.slug).toBe('serie teste');
  });
});

