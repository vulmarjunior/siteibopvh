/**
 * Calendário dos ciclos de estudo da EBD (Rev. 2).
 *
 * A data de cada lição é **calculada** a partir da âncora do ciclo e das
 * exceções registradas; nada é recalculado em massa sobre datas gravadas.
 *
 * Regras:
 * - `startsOn` é a data de referência; a lição 1 cai no primeiro dia da
 *   semana escolhido (`weekday`) a partir dela.
 * - `RESCHEDULED` guarda a data manual em `scheduledOn` e **não** desloca as
 *   seguintes: a lição ocupa a própria posição semanal.
 * - `NO_MEETING` marca que a semana prevista não teve encontro; a lição e
 *   todas as seguintes deslocam uma semana.
 * - Datas são civis (`YYYY-MM-DD`), sem fuso: nenhuma conversão pode mover um
 *   domingo de encontro.
 */

export type EbdScheduleKind = 'RULE' | 'RESCHEDULED' | 'NO_MEETING';

export interface EbdCivilDate {
  year: number;
  month: number;
  day: number;
}

export interface EbdScheduleExceptionInput {
  lessonNumber: number;
  exceptionKind: EbdScheduleKind;
  scheduledOn?: string | null;
  adjustedAtRevision?: number | null;
}

export interface EbdCycleScheduleInput {
  startsOn: string;
  weekday: number;
  lessonCount: number;
  anchorRevision?: number;
  exceptions?: readonly EbdScheduleExceptionInput[];
}

export interface EbdScheduleEntry {
  lessonNumber: number;
  /** Data efetiva do encontro (YYYY-MM-DD). */
  date: string;
  /** Data que a regra daria para esta posição, antes do ajuste manual. */
  ruleDate: string;
  exceptionKind: EbdScheduleKind;
  /** Data manual, presente apenas em `RESCHEDULED`. */
  scheduledOn: string | null;
  /** Ajuste manual feito sob uma âncora anterior: revisar após reancorar. */
  divergesFromRule: boolean;
  /** Outras lições do ciclo que caíram na mesma data. */
  sharesDateWith: number[];
}

export interface EbdCycleSchedule {
  startsOn: string;
  weekday: number;
  anchorRevision: number;
  entries: EbdScheduleEntry[];
  firstDate: string;
  lastDate: string;
  /** Rótulo público do período de uso, ex.: "Setembro a dezembro de 2027". */
  periodLabel: string;
}

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
] as const;

const CIVIL_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function isValidWeekday(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 6;
}

export function parseCivilDate(value: unknown): EbdCivilDate | null {
  if (typeof value !== 'string') return null;
  const match = CIVIL_DATE.exec(value.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return { year, month, day };
}

export function isCivilDate(value: unknown): value is string {
  return parseCivilDate(value) !== null;
}

export function formatCivilDate(date: EbdCivilDate): string {
  return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

function toUtcMs(date: EbdCivilDate): number {
  return Date.UTC(date.year, date.month - 1, date.day);
}

function fromUtcMs(ms: number): EbdCivilDate {
  const date = new Date(ms);
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
}

export function addCivilDays(date: EbdCivilDate, days: number): EbdCivilDate {
  return fromUtcMs(toUtcMs(date) + days * DAY_MS);
}

/** 0 = domingo … 6 = sábado, calculado em UTC para não sofrer fuso. */
export function civilWeekday(date: EbdCivilDate): number {
  return new Date(toUtcMs(date)).getUTCDay();
}

export function alignToWeekday(date: EbdCivilDate, weekday: number): EbdCivilDate {
  const delta = (weekday - civilWeekday(date) + 7) % 7;
  return delta === 0 ? date : addCivilDays(date, delta);
}

export function formatCivilDatePtBr(value: string): string {
  const date = parseCivilDate(value);
  if (!date) return value;
  return `${String(date.day).padStart(2, '0')}/${String(date.month).padStart(2, '0')}/${date.year}`;
}

export const WEEKDAY_LABELS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const;

export const WEEKDAY_OPTIONS = WEEKDAY_LABELS.map((label, value) => ({ label, value }));

export function weekdayLabel(value: number): string {
  return isValidWeekday(value) ? WEEKDAY_LABELS[value] : '';
}

export function formatCivilDateWithWeekday(value: string): string {
  const date = parseCivilDate(value);
  if (!date) return value;
  return `${WEEKDAY_LABELS[civilWeekday(date)]}, ${formatCivilDatePtBr(value)}`;
}

export function formatCivilDateLong(value: string): string {
  const date = parseCivilDate(value);
  if (!date) return value;
  return `${date.day} de ${MONTHS[date.month - 1]} de ${date.year}`;
}

/**
 * Rótulo do período de uso, derivado da primeira e da última data do ciclo.
 * - mesmo ano: `Setembro a dezembro de 2027`
 * - anos distintos: `Novembro de 2027 a fevereiro de 2028`
 */
export function formatCyclePeriod(firstDate: string, lastDate: string): string {
  const first = parseCivilDate(firstDate);
  const last = parseCivilDate(lastDate);
  if (!first || !last) return '';

  const firstMonth = MONTHS[first.month - 1];
  const lastMonth = MONTHS[last.month - 1];

  if (first.year === last.year) {
    if (first.month === last.month) {
      return `${capitalize(firstMonth)} de ${first.year}`;
    }
    return `${capitalize(firstMonth)} a ${lastMonth} de ${first.year}`;
  }

  return `${capitalize(firstMonth)} de ${first.year} a ${lastMonth} de ${last.year}`;
}

/**
 * Calcula a agenda do ciclo. Lança `RangeError` para entrada inválida; a API
 * valida antes e devolve mensagem em português.
 */
export function computeEbdSchedule(input: EbdCycleScheduleInput): EbdCycleSchedule {
  const start = parseCivilDate(input.startsOn);
  if (!start) throw new RangeError('Data de início inválida.');
  if (!isValidWeekday(input.weekday)) throw new RangeError('Dia da semana inválido.');
  if (!Number.isInteger(input.lessonCount) || input.lessonCount < 1 || input.lessonCount > 60) {
    throw new RangeError('Quantidade de lições inválida.');
  }

  const anchorRevision = Number.isInteger(input.anchorRevision) ? input.anchorRevision! : 1;
  const exceptions = new Map<number, EbdScheduleExceptionInput>();
  for (const exception of input.exceptions ?? []) {
    if (!Number.isInteger(exception.lessonNumber)) continue;
    if (exception.lessonNumber < 1 || exception.lessonNumber > input.lessonCount) continue;
    exceptions.set(exception.lessonNumber, exception);
  }

  let cursor = alignToWeekday(start, input.weekday);
  const entries: EbdScheduleEntry[] = [];

  for (let lessonNumber = 1; lessonNumber <= input.lessonCount; lessonNumber += 1) {
    const exception = exceptions.get(lessonNumber);
    const kind = exception?.exceptionKind ?? 'RULE';

    if (kind === 'NO_MEETING') {
      // A semana prevista não tem encontro: a lição e as seguintes deslocam.
      const skipped = cursor;
      cursor = addCivilDays(cursor, 7);
      entries.push({
        lessonNumber,
        date: formatCivilDate(cursor),
        ruleDate: formatCivilDate(skipped),
        exceptionKind: kind,
        scheduledOn: null,
        divergesFromRule: false,
        sharesDateWith: [],
      });
      cursor = addCivilDays(cursor, 7);
      continue;
    }

    const ruleDate = formatCivilDate(cursor);
    const manual = kind === 'RESCHEDULED' ? parseCivilDate(exception?.scheduledOn) : null;
    const date = manual ? formatCivilDate(manual) : ruleDate;

    entries.push({
      lessonNumber,
      date,
      ruleDate,
      exceptionKind: kind,
      scheduledOn: manual ? formatCivilDate(manual) : null,
      divergesFromRule: kind === 'RESCHEDULED' && exception?.adjustedAtRevision !== anchorRevision,
      sharesDateWith: [],
    });

    cursor = addCivilDays(cursor, 7);
  }

  const byDate = new Map<string, number[]>();
  for (const entry of entries) {
    const list = byDate.get(entry.date) ?? [];
    list.push(entry.lessonNumber);
    byDate.set(entry.date, list);
  }
  for (const entry of entries) {
    const list = byDate.get(entry.date) ?? [];
    entry.sharesDateWith = list.filter((number) => number !== entry.lessonNumber);
  }

  const firstDate = entries[0]?.date ?? formatCivilDate(start);
  const lastDate = entries[entries.length - 1]?.date ?? firstDate;

  return {
    startsOn: formatCivilDate(start),
    weekday: input.weekday,
    anchorRevision,
    entries,
    firstDate,
    lastDate,
    periodLabel: formatCyclePeriod(firstDate, lastDate),
  };
}

/** Converte uma data `DATE` do Prisma (UTC meia-noite) para `YYYY-MM-DD`. */
export function civilDateFromDb(value: Date | null | undefined): string | null {
  if (!value) return null;
  return formatCivilDate({
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
  });
}

/** Converte `YYYY-MM-DD` no `Date` UTC que o Prisma grava em colunas `DATE`. */
export function dbDateFromCivil(value: string): Date {
  const parsed = parseCivilDate(value);
  if (!parsed) throw new RangeError('Data inválida.');
  return new Date(toUtcMs(parsed));
}
