import { describe, it, expect } from 'vitest';
import { generateSlug } from '../slug';

describe('generateSlug', () => {
  it('should convert accented text into clean URL slug', () => {
    const res = generateSlug('O Conhecimento de Deus & Teologia Prática');
    expect(res).toBe('o-conhecimento-de-deus-teologia-pratica');
  });

  it('should trim leading and trailing hyphens', () => {
    const res = generateSlug('  --Bíblia Sagrada--  ');
    expect(res).toBe('biblia-sagrada');
  });
});
