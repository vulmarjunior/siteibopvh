import { useCallback, useEffect, useRef, useState } from 'react';
import type { EbdProgressStore } from '../../types/ebd.js';
import {
  EBD_PROGRESS_STORAGE_KEY,
  clearAllProgress,
  clearLessonProgress,
  readProgressStore,
  setLessonRead,
  setLessonScroll,
  writeProgressStore,
} from './progress.js';

const PROGRESS_EVENT = 'ebd:progress-changed';

function readFromWindow(): EbdProgressStore {
  if (typeof window === 'undefined') return {};
  return readProgressStore(window.localStorage);
}

export function useEbdProgress() {
  const [progress, setProgress] = useState<EbdProgressStore>(readFromWindow);
  const storeRef = useRef<EbdProgressStore>(progress);
  useEffect(() => {
    storeRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const sync = () => {
      const next = readFromWindow();
      storeRef.current = next;
      setProgress(next);
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === EBD_PROGRESS_STORAGE_KEY) sync();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener(PROGRESS_EVENT, sync);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(PROGRESS_EVENT, sync);
    };
  }, []);

  const commit = useCallback((next: EbdProgressStore) => {
    storeRef.current = next;
    writeProgressStore(next, window.localStorage);
    setProgress(next);
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  }, []);

  const toggleRead = useCallback((slug: string) => {
    const current = storeRef.current;
    const read = current[slug]?.read === true;
    commit(setLessonRead(current, slug, !read));
  }, [commit]);

  /**
   * A posição de rolagem é gravada com frequência; não atualiza o estado React
   * para evitar renderizações a cada rolagem. O estado é relido ao navegar.
   */
  const saveScroll = useCallback((slug: string, scrollPercent: number) => {
    const next = setLessonScroll(storeRef.current, slug, scrollPercent);
    storeRef.current = next;
    writeProgressStore(next, window.localStorage);
  }, []);

  const clearLesson = useCallback((slug: string) => {
    commit(clearLessonProgress(storeRef.current, slug));
  }, [commit]);

  const clearAll = useCallback(() => {
    commit(clearAllProgress());
  }, [commit]);

  return {
    progress,
    hasProgress: Object.keys(progress).length > 0,
    toggleRead,
    saveScroll,
    clearLesson,
    clearAll,
  };
}
