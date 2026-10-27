import { describe, expect, it } from 'vitest';
import {
  assertImportHash,
  cycleSlugFor,
  editionSlugFor,
  lessonSlugFor,
  validateEbdImport,
} from '../import';

function validPayload() {
  return {
    schema_version: '1.0.0',
    source: {
      file_name: 'revista.pdf',
      sha256: 'a'.repeat(64),
      page_count: 119,
      size_bytes: 4_850_159,
    },
    edition: {
      publisher: 'Editora',
      title: 'Revista',
      year: 2022,
      quarter: 1,
      issue: 72,
      volume: 18,
      class: 'Adultos',
    },
    lessons: [
      {
        number: 1,
        title: 'Lição 1',
        base_text: 'Romanos 1:1-8',
        start_page: 16,
        end_page: 22,
        introduction: ['Introdução.'],
        sections: [
          {
            number: 1,
            title: 'Seção 1',
            paragraphs: ['Parágrafo.'],
            references: ['Rm 1:1'],
          },
        ],
        questions: [{ number: 1, text: 'Pergunta?' }],
        daily_readings: [{ day: 'SEG', reference: 'Gênesis 1:1' }],
        figures: [],
        review: { status: 'reviewed', source_hash: 'a'.repeat(64) },
      },
    ],
  };
}

describe('validateEbdImport', () => {
  it('aceita o JSON completo e normaliza os campos', () => {
    const result = validateEbdImport(validPayload());
    expect(result.ok).toBe(true);
    if (result.ok === true) {
      expect(result.data.lessons).toHaveLength(1);
      expect(result.data.lessons[0].sections[0].title).toBe('Seção 1');
      expect(result.data.source.sha256).toBe('a'.repeat(64));
    }
  });

  it('recusa schema_version diferente', () => {
    const result = validateEbdImport({ ...validPayload(), schema_version: '2.0.0' });
    expect(result.ok).toBe(false);
  });

  it('recusa hash inválido', () => {
    const payload = validPayload();
    payload.source.sha256 = 'invalido';
    expect(validateEbdImport(payload).ok).toBe(false);
  });

  it('recusa lições duplicadas e intervalo de páginas invertido', () => {
    const payload = validPayload();
    payload.lessons.push({ ...payload.lessons[0], title: 'Duplicada' });
    payload.lessons[1].end_page = 10;
    const result = validateEbdImport(payload);
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.errors.join(' ')).toContain('duplicado');
      expect(result.errors.join(' ')).toContain('end_page');
    }
  });

  it('recusa dias de leitura inválidos e lição sem seções', () => {
    const payload = validPayload();
    payload.lessons[0].daily_readings = [{ day: 'FER', reference: 'Texto' }];
    payload.lessons[0].sections = [];
    const result = validateEbdImport(payload);
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.errors.join(' ')).toContain('day');
      expect(result.errors.join(' ')).toContain('sections');
    }
  });

  it('recusa JSON que não é objeto', () => {
    expect(validateEbdImport(null).ok).toBe(false);
    expect(validateEbdImport([]).ok).toBe(false);
  });
});

describe('assertImportHash', () => {
  it('compara o hash do JSON com o hash do PDF', () => {
    const result = validateEbdImport(validPayload());
    expect(result.ok).toBe(true);
    if (result.ok === false) return;
    expect(assertImportHash(result.data, 'a'.repeat(64))).toBeNull();
    expect(assertImportHash(result.data, 'b'.repeat(64))).toContain('não confere');
  });
});

describe('slugs da EBD', () => {
  it('gera o slug da edição sem torná-lo identidade pública', () => {
    expect(editionSlugFor(2022, 1, 'Adultos')).toBe('2022-1t-adultos');
    expect(editionSlugFor(2022, 1, 'Jovens e Adultos')).toBe('2022-1t-jovens-e-adultos');
    expect(lessonSlugFor('2022-1t-adultos', 1)).toBe('2022-1t-adultos-licao-01');
    expect(lessonSlugFor('2022-1t-adultos', 13)).toBe('2022-1t-adultos-licao-13');
  });

  it('gera o slug permanente do ciclo pela turma e pela lição 1', () => {
    expect(cycleSlugFor('Adultos', '2027-09-05')).toBe('adultos-2027-09-05');
    expect(cycleSlugFor('Jovens e Adultos', '2027-09-05')).toBe('jovens-e-adultos-2027-09-05');
    expect(cycleSlugFor('Adultos', '2027-09-05', 1)).toBe('adultos-2027-09-05-2');
  });
});
