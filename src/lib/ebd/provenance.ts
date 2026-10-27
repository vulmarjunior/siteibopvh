import type { EbdImportEdition } from './import.js';

/**
 * Proveniência editorial da EBD (Rev. 3).
 *
 * A edição é a revista; o ciclo é o uso. `year`/`quarter`/`className` são
 * proveniência, não identidade do conteúdo. Este módulo concentra as regras
 * compartilhadas pelo admin e pela API para que a divergência seja exibida
 * sem bloquear a importação.
 */

export interface EbdEditionMetadata {
  publisher: string;
  title: string;
  year: number;
  quarter: number;
  className: string;
  issue: number | null;
  volume: number | null;
}

export type EbdEditionDivergenceField =
  | 'publisher'
  | 'title'
  | 'year'
  | 'quarter'
  | 'className'
  | 'issue'
  | 'volume';

export interface EbdEditionDivergence {
  field: EbdEditionDivergenceField;
  label: string;
  json: string;
  edition: string;
}

export interface EbdEditionContentCounts {
  pdfAssets: number;
  lessons: number;
  cycles: number;
}

const LABELS: Record<EbdEditionDivergenceField, string> = {
  publisher: 'Editora',
  title: 'Título',
  year: 'Ano editorial',
  quarter: 'Trimestre editorial',
  className: 'Turma',
  issue: 'Edição (nº)',
  volume: 'Volume',
};

const integerLabel = (value: number | null): string => (value === null ? '—' : String(value));

const quarterLabel = (value: number): string => `${value}º trimestre`;

/**
 * Só libera a correção de ano/trimestre/turma enquanto a edição não tiver
 * PDF, lições ou ciclos. Depois disso, slug e caminho do PDF já dependem
 * desses valores e a edição fica imutável.
 */
export function canEditEditionMetadata(counts: EbdEditionContentCounts): boolean {
  return counts.pdfAssets <= 0 && counts.lessons <= 0 && counts.cycles <= 0;
}

/**
 * Compara a proveniência do JSON com a edição cadastrada. O resultado é
 * informativo: nenhum destes campos bloqueia a importação.
 */
export function editionDivergences(
  jsonEdition: EbdImportEdition,
  edition: EbdEditionMetadata,
): EbdEditionDivergence[] {
  const divergences: EbdEditionDivergence[] = [];
  const add = (
    field: EbdEditionDivergenceField,
    jsonValue: string,
    editionValue: string,
    differs: boolean,
  ) => {
    if (!differs) return;
    divergences.push({
      field,
      label: LABELS[field],
      json: jsonValue,
      edition: editionValue,
    });
  };

  const jsonIssue = jsonEdition.issue ?? null;
  const jsonVolume = jsonEdition.volume ?? null;

  add('publisher', jsonEdition.publisher, edition.publisher, jsonEdition.publisher !== edition.publisher);
  add('title', jsonEdition.title, edition.title, jsonEdition.title !== edition.title);
  add('year', String(jsonEdition.year), String(edition.year), jsonEdition.year !== edition.year);
  add(
    'quarter',
    quarterLabel(jsonEdition.quarter),
    quarterLabel(edition.quarter),
    jsonEdition.quarter !== edition.quarter,
  );
  add('className', jsonEdition.class, edition.className, jsonEdition.class !== edition.className);
  add('issue', integerLabel(jsonIssue), integerLabel(edition.issue), jsonIssue !== edition.issue);
  add('volume', integerLabel(jsonVolume), integerLabel(edition.volume), jsonVolume !== edition.volume);

  return divergences;
}
