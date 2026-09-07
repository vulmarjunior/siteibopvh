import { describe, expect, it } from 'vitest';
import { currentReadingDay, getFallbackWeeklyReadingFromJSON, type WeeklyReadingSelection } from '../weeklyReading';

const selection: WeeklyReadingSelection = {
  messageId: 'message-1', seriesId: 'series-1', seriesSlug: 'serie', emailEnabled: true, number: '01', title: 'Mensagem', theme: 'Tema',
  days: [
    { dia: 'Segunda', texto: 'João 1', descricao: 'Leitura' },
    { dia: 'Sábado', texto: 'João 6', descricao: 'Leitura' },
  ],
};

describe('currentReadingDay', () => {
  it('usa o dia da semana em Porto Velho', () => {
    expect(currentReadingDay(selection, new Date('2026-08-10T12:00:00Z'))).toEqual({ dayLabel: 'Segunda', reading: selection.days[0] });
  });

  it('retorna leitura nula quando o plano não possui o dia', () => {
    expect(currentReadingDay(selection, new Date('2026-08-09T12:00:00Z'))).toEqual({ dayLabel: 'Domingo', reading: null });
  });
});

describe('getFallbackWeeklyReadingFromJSON', () => {
  it('obtém a leitura vigente de sermoes.json para a data informada', () => {
    const reading = getFallbackWeeklyReadingFromJSON(new Date('2026-09-07T12:00:00Z'));
    expect(reading).not.toBeNull();
    expect(reading?.seriesSlug).toBe('da-ascensao-a-parousia');
    expect(reading?.number).toBe('11');
    expect(reading?.title).toBe('Uma Só Casa no Deserto');
    expect(reading?.days.length).toBe(6);
    expect(reading?.days[0].dia).toBe('Segunda');
  });
});

