import { useCallback, useEffect, useState } from 'react';
import { getSeriesLifecycle, seriesClient } from './client';
import type { PublicSeries, SeriesLoadState } from './types';

export function useSeries<TSeries extends PublicSeries = PublicSeries>(slug: string) {
  const [state, setState] = useState<SeriesLoadState<TSeries>>({ status: 'loading', series: null, error: null, lifecycle: null });
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: 'loading', series: null, error: null, lifecycle: null });
    seriesClient.get<TSeries>(slug, controller.signal)
      .then((series) => setState(series
        ? { status: 'ready', series, error: null, lifecycle: getSeriesLifecycle(series) }
        : { status: 'not-found', series: null, error: null, lifecycle: null }))
      .catch((error) => { if (error?.name !== 'AbortError') setState({ status: 'error', series: null, error: error instanceof Error ? error : new Error('Erro desconhecido'), lifecycle: null }); });
    return () => controller.abort();
  }, [slug, reloadKey]);

  return { ...state, reload };
}

