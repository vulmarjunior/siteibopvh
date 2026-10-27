export type EbdThemePreference = 'light' | 'dark' | 'system';
export type EbdResolvedTheme = 'light' | 'dark';

export const EBD_FONT_SCALE_MIN = 0.875;
export const EBD_FONT_SCALE_MAX = 1.5;
export const EBD_FONT_SCALE_STEP = 0.125;
export const EBD_FONT_SCALE_DEFAULT = 1;

export function clampFontScale(value: number): number {
  if (!Number.isFinite(value)) return EBD_FONT_SCALE_DEFAULT;
  const clamped = Math.min(EBD_FONT_SCALE_MAX, Math.max(EBD_FONT_SCALE_MIN, value));
  return Math.round(clamped / EBD_FONT_SCALE_STEP) * EBD_FONT_SCALE_STEP;
}

export function stepFontScale(current: number, direction: 'increase' | 'decrease'): number {
  const delta = direction === 'increase' ? EBD_FONT_SCALE_STEP : -EBD_FONT_SCALE_STEP;
  return clampFontScale(clampFontScale(current) + delta);
}

export function resolveEbdTheme(
  preference: EbdThemePreference,
  systemPrefersDark: boolean,
): EbdResolvedTheme {
  if (preference === 'system') return systemPrefersDark ? 'dark' : 'light';
  return preference;
}

export function isEbdThemePreference(value: unknown): value is EbdThemePreference {
  return value === 'light' || value === 'dark' || value === 'system';
}
