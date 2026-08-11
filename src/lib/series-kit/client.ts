import type { PublicSeries, SeriesLifecycle } from './types';

export class SeriesApiError extends Error {
  constructor(message: string, public readonly status: number) { super(message); this.name = 'SeriesApiError'; }
}

export interface SeriesClientOptions { baseUrl?: string; fetcher?: typeof fetch }

export function getSeriesLifecycle(series: Pick<PublicSeries, 'status' | 'startsAt' | 'endsAt'>, now = new Date()): SeriesLifecycle {
  if (series.status === 'ENDED' || (series.endsAt && new Date(series.endsAt) <= now)) return 'ended';
  if (series.startsAt && new Date(series.startsAt) > now) return 'prelaunch';
  return 'active';
}

export function createSeriesClient(options: SeriesClientOptions = {}) {
  const baseUrl = (options.baseUrl || '/api/series').replace(/\/$/, '');
  const fetcher = options.fetcher || fetch;
  return {
    async get<TSeries extends PublicSeries = PublicSeries>(slug: string, signal?: AbortSignal): Promise<TSeries | null> {
      if (!slug.trim()) throw new SeriesApiError('O slug da série é obrigatório.', 400);
      const response = await fetcher(`${baseUrl}/${encodeURIComponent(slug)}`, { signal, headers: { Accept: 'application/json' } });
      if (response.status === 404) return null;
      if (!response.ok) {
        const payload = await response.json().catch(() => ({})) as { error?: string };
        throw new SeriesApiError(payload.error || 'Série indisponível neste momento.', response.status);
      }
      return response.json() as Promise<TSeries>;
    },
  };
}

export const seriesClient = createSeriesClient();

