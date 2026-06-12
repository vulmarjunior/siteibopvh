import { describe, it, expect } from 'vitest';
import { interpolateColor } from '../interpolateColor';

describe('interpolateColor', () => {
  it('progress 0 retorna cor inicial', () => {
    const result = interpolateColor('#ff0000', '#0000ff', 0);
    expect(result).toBe('#ff0000');
  });

  it('progress 1 retorna cor final', () => {
    const result = interpolateColor('#ff0000', '#0000ff', 1);
    expect(result).toBe('#0000ff');
  });

  it('progress 0.5 retorna cor intermediária', () => {
    const result = interpolateColor('#000000', '#ffffff', 0.5);
    expect(result).toBe('#808080');
  });

  it('progress negativo é limitado a 0', () => {
    const result = interpolateColor('#ff0000', '#0000ff', -0.5);
    expect(result).toBe('#ff0000');
  });

  it('progress > 1 é limitado a 1', () => {
    const result = interpolateColor('#ff0000', '#0000ff', 1.5);
    expect(result).toBe('#0000ff');
  });

  it('interpolacao de cores liturgicas: roxo para azul', () => {
    const result = interpolateColor('#6f42c1', '#2563a6', 0.5);
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    expect(result).not.toBe('#6f42c1');
    expect(result).not.toBe('#2563a6');
  });

  it('interpolacao de cores liturgicas: verde para cinza', () => {
    const result = interpolateColor('#3f7d44', '#7a7a7a', 0.5);
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('interpolacao de cores liturgicas: dourado para verde', () => {
    const result = interpolateColor('#c89b24', '#3f7d44', 0.5);
    expect(result).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
