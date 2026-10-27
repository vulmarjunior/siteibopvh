import { useCallback, useEffect, useRef, useState } from 'react';
import { useEbdProgress } from './useEbdProgress.js';

export function useEbdLessonProgress(slug: string | undefined, ready: boolean) {
  const { progress, toggleRead, saveScroll, clearLesson } = useEbdProgress();
  const entry = slug ? progress[slug] : undefined;
  const [resumeUsed, setResumeUsed] = useState(false);
  const suppressSaveRef = useRef(false);

  useEffect(() => {
    setResumeUsed(false);
  }, [slug]);

  useEffect(() => {
    if (!slug || !ready) return;

    const currentPercent = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return 0;
      return Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    let lastSaved = currentPercent();

    const persist = () => {
      const percent = currentPercent();
      if (suppressSaveRef.current) {
        suppressSaveRef.current = false;
        lastSaved = percent;
        return;
      }
      if (Math.abs(percent - lastSaved) < 0.005) return;
      lastSaved = percent;
      saveScroll(slug, percent);
    };

    const interval = window.setInterval(persist, 1000);
    window.addEventListener('scroll', persist, { passive: true });

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('scroll', persist);
      persist();
    };
  }, [ready, saveScroll, slug]);

  const resumePercent = entry ? Math.round(entry.scrollPercent * 100) : 0;
  const canResume = Boolean(slug) && !resumeUsed && resumePercent >= 3 && resumePercent <= 97;

  const resumeReading = useCallback(() => {
    if (!slug || !entry) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const top = Math.min(maxScroll, Math.max(0, entry.scrollPercent * maxScroll));

    window.scrollTo({ top, behavior: 'auto' });
    document.getElementById('artigo')?.focus({ preventScroll: true });
    setResumeUsed(true);
  }, [entry, slug]);

  const handleToggleRead = useCallback(() => {
    if (slug) toggleRead(slug);
  }, [slug, toggleRead]);

  const handleClear = useCallback(() => {
    if (!slug) return;
    suppressSaveRef.current = true;
    clearLesson(slug);
    setResumeUsed(false);
  }, [clearLesson, slug]);

  return {
    isRead: entry?.read === true,
    hasEntry: Boolean(entry),
    resumePercent,
    canResume,
    resumeReading,
    toggleRead: handleToggleRead,
    clearProgress: handleClear,
  };
}
