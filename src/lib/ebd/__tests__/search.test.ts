import { describe, expect, it } from 'vitest';
import {
  buildAccentInsensitivePattern,
  buildLessonSearchText,
  findLessonMatches,
  normalizeForSearch,
  searchLessons,
  type EbdSearchableLesson,
} from '../search';

const lesson: EbdSearchableLesson = {
  number: 1,
  slug: '2022-1t-adultos-licao-01',
  title: 'Por que é importante conhecer o Pentateuco?',
  baseText: 'Romanos 1:1-8',
  startPage: 16,
  endPage: 22,
  introduction: ['Neste trimestre, estudaremos o Pentateuco.'],
  sections: [
    {
      number: 1,
      title: 'A criação',
      paragraphs: ['No princípio, Deus criou os céus e a terra.'],
    },
  ],
  questions: [{ number: 1, text: 'Qual é a relevância do Pentateuco?' }],
  dailyReadings: [{ day: 'SEG', reference: 'Gênesis 1:1' }],
};

describe('normalizeForSearch', () => {
  it('remove acentos, caixa e espaços repetidos', () => {
    expect(normalizeForSearch('  Criação   do MUNDO  ')).toBe('criacao do mundo');
  });
});

describe('buildAccentInsensitivePattern', () => {
  it('encontra palavras com e sem acento', () => {
    expect('A criação do mundo'.match(buildAccentInsensitivePattern('criacao')!)).toEqual(['criação']);
    expect('A CRIAÇÃO do mundo'.match(buildAccentInsensitivePattern('criacao')!)).toEqual(['CRIAÇÃO']);
    expect('A criação do mundo'.match(buildAccentInsensitivePattern('criação')!)).toEqual(['criação']);
  });

  it('trata caracteres especiais de expressão regular', () => {
    const expression = buildAccentInsensitivePattern('1:1');
    expect(expression).not.toBeNull();
    expect('Romanos 1:1-8'.match(expression!)).toEqual(['1:1']);
    expect(() => buildAccentInsensitivePattern('(teste)')).not.toThrow();
  });

  it('rejeita buscas com menos de dois caracteres', () => {
    expect(buildAccentInsensitivePattern('a')).toBeNull();
    expect(buildAccentInsensitivePattern('  ')).toBeNull();
  });
});

describe('buildLessonSearchText', () => {
  it('inclui seções, perguntas e leituras diárias', () => {
    const text = buildLessonSearchText(lesson);
    expect(text).toContain('A criação');
    expect(text).toContain('No princípio, Deus criou os céus e a terra.');
    expect(text).toContain('Qual é a relevância do Pentateuco?');
    expect(text).toContain('SEG: Gênesis 1:1');
  });
});

describe('findLessonMatches', () => {
  it('retorna a contagem e um trecho com o texto original', () => {
    const result = findLessonMatches('No princípio, Deus criou os céus e a terra. A criação é boa.', 'criacao');
    expect(result.matches).toBe(1);
    expect(result.snippets).toHaveLength(1);
    expect(result.snippets[0].match).toBe('criação');
    expect(result.snippets[0].before).toContain('No princípio');
    expect(result.snippets[0].after).toContain('é boa');
  });

  it('preserva a pontuação logo após a ocorrência', () => {
    const result = findLessonMatches('Conhecer o Pentateuco? Sim.', 'pentateuco');
    expect(result.snippets[0].after.startsWith('?')).toBe(true);
  });

  it('limita a quantidade de trechos exibidos', () => {
    const result = findLessonMatches('criação criação criação', 'criacao', 2);
    expect(result.matches).toBe(3);
    expect(result.snippets).toHaveLength(2);
  });
});

describe('searchLessons', () => {
  it('busca no título, no texto base e no conteúdo', () => {
    expect(searchLessons([lesson], 'pentateuco')[0]?.lesson.number).toBe(1);
    expect(searchLessons([lesson], 'romanos')[0]?.matches).toBeGreaterThan(0);
    expect(searchLessons([lesson], 'criacao')[0]?.snippets[0].match).toBe('criação');
  });

  it('não retorna lições sem ocorrência', () => {
    expect(searchLessons([lesson], 'inexistente')).toEqual([]);
  });

  it('ordena as lições pelo número', () => {
    const second = { ...lesson, number: 2, slug: 'licao-02', title: 'Outra lição' };
    const results = searchLessons([second, lesson], 'pentateuco');
    expect(results.map((result) => result.lesson.number)).toEqual([1, 2]);
  });
});
