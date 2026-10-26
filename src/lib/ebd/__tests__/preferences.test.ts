import { describe, expect, it } from 'vitest';
import {
  EBD_FONT_SCALE_DEFAULT,
  EBD_FONT_SCALE_MAX,
  EBD_FONT_SCALE_MIN,
  clampFontScale,
  isEbdThemePreference,
  resolveEbdTheme,
  stepFontScale,
} from '../preferences';

describe('preferências de leitura da EBD', () => {
  it('limita o tamanho da fonte à faixa e ao passo de 12,5%', () => {
    expect(clampFontScale(0.1)).toBe(EBD_FONT_SCALE_MIN);
    expect(clampFontScale(5)).toBe(EBD_FONT_SCALE_MAX);
    expect(clampFontScale(1.07)).toBe(1.125);
    expect(clampFontScale(Number.NaN)).toBe(EBD_FONT_SCALE_DEFAULT);
  });

  it('aumenta e diminui sem sair da faixa', () => {
    expect(stepFontScale(1, 'increase')).toBe(1.125);
    expect(stepFontScale(1, 'decrease')).toBe(0.875);
    expect(stepFontScale(EBD_FONT_SCALE_MAX, 'increase')).toBe(EBD_FONT_SCALE_MAX);
    expect(stepFontScale(EBD_FONT_SCALE_MIN, 'decrease')).toBe(EBD_FONT_SCALE_MIN);
  });

  it('resolve o tema salvo e o tema do sistema', () => {
    expect(resolveEbdTheme('system', true)).toBe('dark');
    expect(resolveEbdTheme('system', false)).toBe('light');
    expect(resolveEbdTheme('light', true)).toBe('light');
    expect(resolveEbdTheme('dark', false)).toBe('dark');
  });

  it('valida a preferência de tema', () => {
    expect(isEbdThemePreference('system')).toBe(true);
    expect(isEbdThemePreference('auto')).toBe(false);
    expect(isEbdThemePreference(null)).toBe(false);
  });
});
