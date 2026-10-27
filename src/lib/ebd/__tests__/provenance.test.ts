import { describe, expect, it } from 'vitest';
import type { EbdImportEdition } from '../import';
import {
  canEditEditionMetadata,
  editionDivergences,
  type EbdEditionMetadata,
} from '../provenance';

function jsonEdition(overrides: Partial<EbdImportEdition> = {}): EbdImportEdition {
  return {
    publisher: 'Convenção Batista Fluminense',
    title: 'Revista de Jovens e Adultos',
    year: 2022,
    quarter: 1,
    issue: 72,
    volume: 18,
    class: 'Adultos',
    ...overrides,
  };
}

function edition(overrides: Partial<EbdEditionMetadata> = {}): EbdEditionMetadata {
  return {
    publisher: 'Convenção Batista Fluminense',
    title: 'Revista de Jovens e Adultos',
    year: 2022,
    quarter: 1,
    className: 'Adultos',
    issue: 72,
    volume: 18,
    ...overrides,
  };
}

describe('editionDivergences', () => {
  it('não aponta divergência quando a proveniência coincide', () => {
    expect(editionDivergences(jsonEdition(), edition())).toEqual([]);
  });

  it('aponta ano, trimestre e turma sem transformar a divergência em bloqueio', () => {
    const result = editionDivergences(
      jsonEdition(),
      edition({ year: 2026, quarter: 4, className: 'Jovens' }),
    );
    expect(result.map((item) => item.field)).toEqual(['year', 'quarter', 'className']);
    expect(result.find((item) => item.field === 'year')).toMatchObject({
      label: 'Ano editorial',
      json: '2022',
      edition: '2026',
    });
    expect(result.find((item) => item.field === 'quarter')).toMatchObject({
      json: '1º trimestre',
      edition: '4º trimestre',
    });
  });

  it('aponta também os campos que o import sobrescreve com o JSON', () => {
    const result = editionDivergences(
      jsonEdition({ publisher: 'Editora Nova', title: 'Outra revista', issue: null, volume: 20 }),
      edition({ publisher: 'Editora Antiga', title: 'Revista Antiga', issue: 71, volume: null }),
    );
    expect(result.map((item) => item.field)).toEqual([
      'publisher',
      'title',
      'issue',
      'volume',
    ]);
    expect(result.find((item) => item.field === 'issue')).toMatchObject({
      json: '—',
      edition: '71',
    });
  });
});

describe('canEditEditionMetadata', () => {
  it('libera a correção antes do primeiro PDF, lição ou ciclo', () => {
    expect(canEditEditionMetadata({ pdfAssets: 0, lessons: 0, cycles: 0 })).toBe(true);
  });

  it('bloqueia a correção depois de qualquer conteúdo', () => {
    expect(canEditEditionMetadata({ pdfAssets: 1, lessons: 0, cycles: 0 })).toBe(false);
    expect(canEditEditionMetadata({ pdfAssets: 0, lessons: 1, cycles: 0 })).toBe(false);
    expect(canEditEditionMetadata({ pdfAssets: 0, lessons: 0, cycles: 1 })).toBe(false);
  });
});
