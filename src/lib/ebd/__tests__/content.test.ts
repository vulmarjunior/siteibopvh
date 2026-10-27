import { describe, expect, it } from 'vitest';
import {
  buildLessonNavigation,
  formatFileSize,
  formatPageRange,
  normalizeDailyReadings,
  normalizeQuestions,
  normalizeSections,
  normalizeStringArray,
  pdfDownloadPath,
  editionLabel,
} from '../content';

describe('normalizeStringArray', () => {
  it('mantém apenas textos não vazios', () => {
    expect(normalizeStringArray(['  primeiro  ', '', 42, null, 'segundo'])).toEqual(['primeiro', 'segundo']);
    expect(normalizeStringArray('texto')).toEqual([]);
  });
});

describe('normalizeSections', () => {
  it('ordena as seções e exige título e parágrafos', () => {
    const sections = normalizeSections([
      { number: 2, title: 'Segunda', paragraphs: ['texto'] },
      { number: 1, title: 'Primeira', paragraphs: ['a', 'b'] },
      { number: 3, title: '', paragraphs: ['sem título'] },
      { number: 4, title: 'Vazia', paragraphs: [] },
    ]);
    expect(sections).toEqual([
      { number: 1, title: 'Primeira', paragraphs: ['a', 'b'] },
      { number: 2, title: 'Segunda', paragraphs: ['texto'] },
    ]);
  });

  it('preserva referências opcionais válidas', () => {
    const sections = normalizeSections([
      { number: 1, title: 'Título', paragraphs: ['texto'], references: ['Rm 1:1', ''] },
    ]);
    expect(sections[0].references).toEqual(['Rm 1:1']);
  });
});

describe('normalizeQuestions', () => {
  it('ordena e valida as perguntas', () => {
    expect(
      normalizeQuestions([
        { number: 2, text: 'Segunda?' },
        { number: 1, text: 'Primeira?' },
        { number: 3, text: '' },
        { text: 'Sem número' },
      ]),
    ).toEqual([
      { number: 1, text: 'Primeira?' },
      { number: 2, text: 'Segunda?' },
    ]);
  });
});

describe('normalizeDailyReadings', () => {
  it('aceita somente dias da semana conhecidos', () => {
    expect(
      normalizeDailyReadings([
        { day: 'seg', reference: 'Gênesis 1:1' },
        { day: 'FER', reference: 'Inválido' },
        { day: 'DOM', reference: '  Apocalipse 4:11  ' },
      ]),
    ).toEqual([
      { day: 'SEG', reference: 'Gênesis 1:1' },
      { day: 'DOM', reference: 'Apocalipse 4:11' },
    ]);
  });
});

describe('buildLessonNavigation', () => {
  const lessons = [
    { number: 3, slug: 'tres', title: 'Três', scheduledOn: '2027-09-19' },
    { number: 1, slug: 'um', title: 'Um', scheduledOn: '2027-09-05' },
    { number: 2, slug: 'dois', title: 'Dois', scheduledOn: null },
  ];

  it('retorna anterior e próxima na ordem numérica', () => {
    expect(buildLessonNavigation(lessons, 2)).toEqual({
      previous: { number: 1, slug: 'um', title: 'Um', scheduledOn: '2027-09-05' },
      next: { number: 3, slug: 'tres', title: 'Três', scheduledOn: '2027-09-19' },
    });
  });

  it('não retorna vizinhos fora dos limites', () => {
    expect(buildLessonNavigation(lessons, 1).previous).toBeNull();
    expect(buildLessonNavigation(lessons, 3).next).toBeNull();
    expect(buildLessonNavigation(lessons, 99)).toEqual({ previous: null, next: null });
  });
});

describe('helpers de exibição', () => {
  it('formata trimestre, páginas e tamanho de arquivo', () => {
    expect(editionLabel(2022, 1)).toBe('1º trimestre de 2022');
    expect(formatPageRange(16, 22)).toBe('p. 16–22');
    expect(formatPageRange(30, 30)).toBe('p. 30');
    expect(formatFileSize(4_850_159)).toBe('4,6 MB');
    expect(formatFileSize(900_000)).toBe('879 KB');
    expect(formatFileSize(0)).toBe('');
  });

  it('codifica o caminho do PDF', () => {
    expect(pdfDownloadPath('abc 123')).toBe('/api/ebd/editions/abc%20123/pdf');
  });
});
