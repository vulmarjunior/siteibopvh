import { describe, expect, it } from 'vitest';
import {
  EBD_PROGRESS_STORAGE_KEY,
  clearAllProgress,
  clearLessonProgress,
  hasProgressEntries,
  readProgressStore,
  setLessonRead,
  setLessonScroll,
  writeProgressStore,
  type EbdStorageLike,
} from '../progress';

function memoryStorage(initial?: string): EbdStorageLike {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set(EBD_PROGRESS_STORAGE_KEY, initial);
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}

describe('progresso de leitura da EBD', () => {
  it('lê um armazenamento vazio ou inválido como vazio', () => {
    expect(readProgressStore(memoryStorage())).toEqual({});
    expect(readProgressStore(memoryStorage('não é json'))).toEqual({});
    expect(readProgressStore(memoryStorage('[]'))).toEqual({});
  });

  it('grava e relê o progresso', () => {
    const storage = memoryStorage();
    let store = setLessonRead({}, 'licao-01', true);
    store = setLessonScroll(store, 'licao-01', 0.42);
    writeProgressStore(store, storage);

    const read = readProgressStore(storage);
    expect(read['licao-01'].read).toBe(true);
    expect(read['licao-01'].scrollPercent).toBe(0.42);
    expect(hasProgressEntries(read)).toBe(true);
  });

  it('não perde a marcação de lida ao salvar a rolagem', () => {
    const store = setLessonScroll(setLessonRead({}, 'licao-01', true), 'licao-01', 0.8);
    expect(store['licao-01'].read).toBe(true);
    expect(store['licao-01'].scrollPercent).toBe(0.8);
  });

  it('limita a posição entre 0 e 1', () => {
    expect(setLessonScroll({}, 'licao-01', 2)['licao-01'].scrollPercent).toBe(1);
    expect(setLessonScroll({}, 'licao-01', -1)['licao-01'].scrollPercent).toBe(0);
    expect(setLessonScroll({}, 'licao-01', Number.NaN)['licao-01'].scrollPercent).toBe(0);
  });

  it('ignora entradas inválidas do armazenamento', () => {
    const storage = memoryStorage(
      JSON.stringify({
        'licao-01': { read: true, scrollPercent: 0.5, updatedAt: '2026-10-26T00:00:00.000Z' },
        'licao-02': 'inválido',
        '': { read: true },
      }),
    );
    const store = readProgressStore(storage);
    expect(Object.keys(store)).toEqual(['licao-01']);
    expect(store['licao-01'].scrollPercent).toBe(0.5);
  });

  it('limpa uma lição ou todo o progresso', () => {
    const store = {
      'licao-01': { read: true, scrollPercent: 0.5, updatedAt: '2026-10-26T00:00:00.000Z' },
      'licao-02': { read: false, scrollPercent: 0.2, updatedAt: '2026-10-26T00:00:00.000Z' },
    };
    expect(clearLessonProgress(store, 'licao-01')).toEqual({ 'licao-02': store['licao-02'] });
    expect(clearAllProgress()).toEqual({});
    expect(hasProgressEntries({})).toBe(false);
  });
});
