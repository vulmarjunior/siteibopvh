import { describe, expect, it } from 'vitest';
import {
  addCivilDays,
  alignToWeekday,
  civilDateFromDb,
  civilWeekday,
  computeEbdSchedule,
  dbDateFromCivil,
  formatCivilDate,
  formatCyclePeriod,
  isCivilDate,
  parseCivilDate,
} from '../schedule.js';

describe('datas civis', () => {
  it('valida datas reais e recusa datas inexistentes', () => {
    expect(isCivilDate('2027-09-05')).toBe(true);
    expect(isCivilDate('2027-02-30')).toBe(false);
    expect(isCivilDate('05/09/2027')).toBe(false);
    expect(isCivilDate('2027-13-01')).toBe(false);
  });

  it('soma dias sem atravessar fuso', () => {
    expect(formatCivilDate(addCivilDays({ year: 2027, month: 12, day: 26 }, 7))).toBe('2028-01-02');
    expect(civilWeekday({ year: 2027, month: 9, day: 5 })).toBe(0);
    expect(civilWeekday({ year: 2027, month: 12, day: 25 })).toBe(6);
  });

  it('alinha a data para o dia da semana escolhido', () => {
    expect(formatCivilDate(alignToWeekday({ year: 2027, month: 9, day: 1 }, 0))).toBe('2027-09-05');
    expect(formatCivilDate(alignToWeekday({ year: 2027, month: 9, day: 5 }, 0))).toBe('2027-09-05');
    expect(formatCivilDate(alignToWeekday({ year: 2027, month: 9, day: 6 }, 3))).toBe('2027-09-08');
  });

  it('grava e lê DATE do banco no mesmo dia civil', () => {
    const stored = dbDateFromCivil('2027-09-05');
    expect(stored.toISOString()).toBe('2027-09-05T00:00:00.000Z');
    expect(civilDateFromDb(stored)).toBe('2027-09-05');
    expect(civilDateFromDb(null)).toBeNull();
  });
});

describe('rótulo do período de uso', () => {
  it('usa o período no mesmo ano', () => {
    expect(formatCyclePeriod('2027-09-05', '2027-12-05')).toBe('Setembro a dezembro de 2027');
  });

  it('usa o período quando cruza o ano', () => {
    expect(formatCyclePeriod('2027-11-07', '2028-02-06')).toBe('Novembro de 2027 a fevereiro de 2028');
  });

  it('usa o mês único quando começa e termina no mesmo mês', () => {
    expect(formatCyclePeriod('2027-09-05', '2027-09-26')).toBe('Setembro de 2027');
  });
});

describe('computeEbdSchedule', () => {
  it('distribui 13 lições uma por domingo a partir da âncora', () => {
    const schedule = computeEbdSchedule({
      startsOn: '2027-09-05',
      weekday: 0,
      lessonCount: 13,
    });

    expect(schedule.entries).toHaveLength(13);
    expect(schedule.entries[0]).toMatchObject({ lessonNumber: 1, date: '2027-09-05', exceptionKind: 'RULE' });
    expect(schedule.entries[1].date).toBe('2027-09-12');
    expect(schedule.entries[12].date).toBe('2027-11-28');
    expect(schedule.firstDate).toBe('2027-09-05');
    expect(schedule.lastDate).toBe('2027-11-28');
    expect(schedule.periodLabel).toBe('Setembro a novembro de 2027');
  });

  it('alinha a lição 1 ao dia da semana quando a data não coincide', () => {
    const schedule = computeEbdSchedule({
      startsOn: '2027-09-01',
      weekday: 0,
      lessonCount: 2,
    });
    expect(schedule.entries[0].date).toBe('2027-09-05');
    expect(schedule.startsOn).toBe('2027-09-01');
  });

  it('ajuste manual não move as lições seguintes', () => {
    const schedule = computeEbdSchedule({
      startsOn: '2027-09-05',
      weekday: 0,
      lessonCount: 4,
      exceptions: [
        { lessonNumber: 2, exceptionKind: 'RESCHEDULED', scheduledOn: '2027-09-15', adjustedAtRevision: 1 },
      ],
    });

    expect(schedule.entries[1]).toMatchObject({
      date: '2027-09-15',
      ruleDate: '2027-09-12',
      exceptionKind: 'RESCHEDULED',
      scheduledOn: '2027-09-15',
      divergesFromRule: false,
    });
    expect(schedule.entries[2].date).toBe('2027-09-19');
    expect(schedule.entries[3].date).toBe('2027-09-26');
  });

  it('semana sem encontro desloca a lição e as seguintes', () => {
    const schedule = computeEbdSchedule({
      startsOn: '2027-09-05',
      weekday: 0,
      lessonCount: 4,
      exceptions: [{ lessonNumber: 2, exceptionKind: 'NO_MEETING' }],
    });

    expect(schedule.entries[0].date).toBe('2027-09-05');
    expect(schedule.entries[1]).toMatchObject({
      date: '2027-09-19',
      ruleDate: '2027-09-12',
      exceptionKind: 'NO_MEETING',
      scheduledOn: null,
    });
    expect(schedule.entries[2].date).toBe('2027-09-26');
    expect(schedule.entries[3].date).toBe('2027-10-03');
  });

  it('marca como divergente o ajuste manual feito sob âncora anterior', () => {
    const exception = {
      lessonNumber: 3,
      exceptionKind: 'RESCHEDULED' as const,
      scheduledOn: '2027-10-01',
      adjustedAtRevision: 1,
    };

    const beforeReanchor = computeEbdSchedule({
      startsOn: '2027-09-05',
      weekday: 0,
      lessonCount: 4,
      anchorRevision: 1,
      exceptions: [exception],
    });
    expect(beforeReanchor.entries[2].divergesFromRule).toBe(false);

    const afterReanchor = computeEbdSchedule({
      startsOn: '2027-09-12',
      weekday: 0,
      lessonCount: 4,
      anchorRevision: 2,
      exceptions: [exception],
    });
    expect(afterReanchor.entries[2].date).toBe('2027-10-01');
    expect(afterReanchor.entries[2].divergesFromRule).toBe(true);
    // O ajuste manual ocupa a posição semanal; a lição 4 segue a regra (26/09 + 7).
    expect(afterReanchor.entries[3].date).toBe('2027-10-03');
  });

  it('sinaliza duas lições na mesma data', () => {
    const schedule = computeEbdSchedule({
      startsOn: '2027-09-05',
      weekday: 0,
      lessonCount: 3,
      exceptions: [
        { lessonNumber: 3, exceptionKind: 'RESCHEDULED', scheduledOn: '2027-09-12', adjustedAtRevision: 1 },
      ],
    });

    expect(schedule.entries[1].sharesDateWith).toEqual([3]);
    expect(schedule.entries[2].sharesDateWith).toEqual([2]);
  });

  it('cruza o ano e rotula o período', () => {
    const schedule = computeEbdSchedule({
      startsOn: '2027-11-07',
      weekday: 0,
      lessonCount: 13,
    });
    expect(schedule.lastDate).toBe('2028-01-30');
    expect(schedule.periodLabel).toBe('Novembro de 2027 a janeiro de 2028');
  });

  it('recusa entrada inválida', () => {
    expect(() => computeEbdSchedule({ startsOn: '2027-02-30', weekday: 0, lessonCount: 13 })).toThrow(RangeError);
    expect(() => computeEbdSchedule({ startsOn: '2027-09-05', weekday: 9, lessonCount: 13 })).toThrow(RangeError);
    expect(() => computeEbdSchedule({ startsOn: '2027-09-05', weekday: 0, lessonCount: 0 })).toThrow(RangeError);
  });

  it('ignora exceções fora do intervalo de lições', () => {
    const schedule = computeEbdSchedule({
      startsOn: '2027-09-05',
      weekday: 0,
      lessonCount: 3,
      exceptions: [{ lessonNumber: 9, exceptionKind: 'NO_MEETING' }],
    });
    expect(schedule.entries.map((entry) => entry.date)).toEqual(['2027-09-05', '2027-09-12', '2027-09-19']);
    expect(parseCivilDate(schedule.entries[0].date)).not.toBeNull();
  });
});
