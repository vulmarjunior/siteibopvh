import { useCallback, useEffect, useState } from 'react';
import {
  EBD_FONT_SCALE_DEFAULT,
  EBD_FONT_SCALE_MAX,
  EBD_FONT_SCALE_MIN,
  isEbdThemePreference,
  resolveEbdTheme,
  clampFontScale,
  stepFontScale,
  type EbdResolvedTheme,
  type EbdThemePreference,
} from './preferences.js';

const THEME_STORAGE_KEY = 'ebd:theme';
const FONT_STORAGE_KEY = 'ebd:font-scale';

function readThemePreference(): EbdThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isEbdThemePreference(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

function readFontScale(): number {
  if (typeof window === 'undefined') return EBD_FONT_SCALE_DEFAULT;
  try {
    const stored = Number(window.localStorage.getItem(FONT_STORAGE_KEY));
    return Number.isFinite(stored) && stored > 0 ? clampFontScale(stored) : EBD_FONT_SCALE_DEFAULT;
  } catch {
    return EBD_FONT_SCALE_DEFAULT;
  }
}

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useEbdReaderSettings() {
  const [themePreference, setThemePreference] = useState<EbdThemePreference>(readThemePreference);
  const [fontScale, setFontScale] = useState<number>(readFontScale);
  const [systemDark, setSystemDark] = useState<boolean>(systemPrefersDark);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    } catch {
      // Preferência é opcional; seguir sem persistência.
    }
  }, [themePreference]);

  useEffect(() => {
    try {
      window.localStorage.setItem(FONT_STORAGE_KEY, String(fontScale));
    } catch {
      // Preferência é opcional; seguir sem persistência.
    }
  }, [fontScale]);

  const increaseFont = useCallback(() => setFontScale((current) => stepFontScale(current, 'increase')), []);
  const decreaseFont = useCallback(() => setFontScale((current) => stepFontScale(current, 'decrease')), []);
  const resetFont = useCallback(() => setFontScale(EBD_FONT_SCALE_DEFAULT), []);

  const resolvedTheme: EbdResolvedTheme = resolveEbdTheme(themePreference, systemDark);

  return {
    themePreference,
    setThemePreference,
    resolvedTheme,
    fontScale,
    increaseFont,
    decreaseFont,
    resetFont,
    canIncrease: fontScale < EBD_FONT_SCALE_MAX,
    canDecrease: fontScale > EBD_FONT_SCALE_MIN,
  };
}
