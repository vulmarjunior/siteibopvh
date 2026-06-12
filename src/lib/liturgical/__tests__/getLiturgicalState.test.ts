import { describe, it, expect } from 'vitest';
import { getLiturgicalState } from '../getLiturgicalState';
import { LITURGICAL_COLORS } from '../config';

function makeDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0);
}

describe('getLiturgicalState', () => {
  describe('Tríduo Pascal (prioridade máxima)', () => {
    it('Sexta-feira da Paixão: vermelho, fase good-friday, label Páscoa', () => {
      const state = getLiturgicalState(makeDate(2026, 4, 3));
      expect(state.macroSeason).toBe('easter');
      expect(state.phase).toBe('good-friday');
      expect(state.label).toBe('Páscoa');
      expect(state.color).toBe(LITURGICAL_COLORS.red);
    });

    it('Sábado de Aleluia: preto, fase holy-saturday, label Páscoa', () => {
      const state = getLiturgicalState(makeDate(2026, 4, 4));
      expect(state.macroSeason).toBe('easter');
      expect(state.phase).toBe('holy-saturday');
      expect(state.label).toBe('Páscoa');
      expect(state.color).toBe(LITURGICAL_COLORS.black);
    });

    it('Domingo de Páscoa: dourado, fase easter-sunday, label Páscoa', () => {
      const state = getLiturgicalState(makeDate(2026, 4, 5));
      expect(state.macroSeason).toBe('easter');
      expect(state.phase).toBe('easter-sunday');
      expect(state.label).toBe('Páscoa');
      expect(state.color).toBe(LITURGICAL_COLORS.gold);
    });

    it('Sexta-feira da Paixão nunca retorna cinza', () => {
      const state = getLiturgicalState(makeDate(2026, 4, 3));
      expect(state.color).not.toBe(LITURGICAL_COLORS.gray);
    });

    it('Sábado de Aleluia nunca retorna vermelho', () => {
      const state = getLiturgicalState(makeDate(2026, 4, 4));
      expect(state.color).not.toBe(LITURGICAL_COLORS.red);
    });

    it('Domingo de Páscoa nunca retorna preto', () => {
      const state = getLiturgicalState(makeDate(2026, 4, 5));
      expect(state.color).not.toBe(LITURGICAL_COLORS.black);
    });
  });

  describe('Quaresma', () => {
    it('Primeiro dia da Quaresma (Quarta-feira de Cinzas): cinza', () => {
      const state = getLiturgicalState(makeDate(2026, 2, 18));
      expect(state.macroSeason).toBe('easter');
      expect(state.phase).toBe('lent');
      expect(state.label).toBe('Páscoa');
      expect(state.color).toBe(LITURGICAL_COLORS.gray);
    });

    it('Período intermediário da Quaresma: cinza', () => {
      const state = getLiturgicalState(makeDate(2026, 3, 15));
      expect(state.macroSeason).toBe('easter');
      expect(state.phase).toBe('lent');
      expect(state.color).toBe(LITURGICAL_COLORS.gray);
    });
  });

  describe('Semana Santa', () => {
    it('Domingo de Ramos: cinza, fase holy-week', () => {
      const state = getLiturgicalState(makeDate(2026, 3, 29));
      expect(state.macroSeason).toBe('easter');
      expect(state.phase).toBe('holy-week');
      expect(state.label).toBe('Páscoa');
      expect(state.color).toBe(LITURGICAL_COLORS.gray);
    });

    it('Quinta-feira Santa: cinza, fase holy-week', () => {
      const state = getLiturgicalState(makeDate(2026, 4, 2));
      expect(state.macroSeason).toBe('easter');
      expect(state.phase).toBe('holy-week');
      expect(state.color).toBe(LITURGICAL_COLORS.gray);
    });
  });

  describe('Período Pascal e Pentecostes', () => {
    it('Segunda-feira após a Páscoa: dourado, fase easter-season', () => {
      const state = getLiturgicalState(makeDate(2026, 4, 6));
      expect(state.macroSeason).toBe('easter');
      expect(state.phase).toBe('easter-season');
      expect(state.label).toBe('Páscoa');
      expect(state.color).toBe(LITURGICAL_COLORS.gold);
    });

    it('Período pascal intermediário: dourado', () => {
      const state = getLiturgicalState(makeDate(2026, 5, 1));
      expect(state.macroSeason).toBe('easter');
      expect(state.phase).toBe('easter-season');
      expect(state.color).toBe(LITURGICAL_COLORS.gold);
    });

    it('Pentecostes: dourado', () => {
      const state = getLiturgicalState(makeDate(2026, 5, 24));
      expect(state.macroSeason).toBe('easter');
      expect(state.color).toBe(LITURGICAL_COLORS.gold);
    });
  });

  describe('Advento', () => {
    it('Primeiro dia do Advento: roxo', () => {
      const state = getLiturgicalState(makeDate(2026, 11, 29));
      expect(state.macroSeason).toBe('advent');
      expect(state.phase).toBe('advent');
      expect(state.label).toBe('Advento');
    });

    it('Advento intermediário: roxo ou em transição', () => {
      const state = getLiturgicalState(makeDate(2026, 12, 10));
      expect(state.macroSeason).toBe('advent');
      expect(state.label).toBe('Advento');
    });

    it('Véspera do Natal: fase advent', () => {
      const state = getLiturgicalState(makeDate(2026, 12, 24));
      expect(state.macroSeason).toBe('advent');
      expect(state.phase).toBe('advent');
    });
  });

  describe('Natal', () => {
    it('Dia de Natal: azul, fase christmas', () => {
      const state = getLiturgicalState(makeDate(2026, 12, 25));
      expect(state.macroSeason).toBe('christmas');
      expect(state.phase).toBe('christmas');
      expect(state.label).toBe('Natal');
      expect(state.color).toBe(LITURGICAL_COLORS.blue);
    });

    it('Período natalino (30/dez): azul', () => {
      const state = getLiturgicalState(makeDate(2026, 12, 30));
      expect(state.macroSeason).toBe('christmas');
      expect(state.color).toBe(LITURGICAL_COLORS.blue);
    });

    it('Início de janeiro ainda é Natal (3/jan): azul', () => {
      const state = getLiturgicalState(makeDate(2027, 1, 3));
      expect(state.macroSeason).toBe('christmas');
      expect(state.color).toBe(LITURGICAL_COLORS.blue);
    });
  });

  describe('Tempo Comum', () => {
    it('Tempo Comum antes da Quaresma (15/jan): verde', () => {
      const state = getLiturgicalState(makeDate(2026, 1, 15));
      expect(state.macroSeason).toBe('ordinary');
      expect(state.label).toBe('Tempo Comum');
      expect(state.color).toBe(LITURGICAL_COLORS.green);
    });

    it('Tempo Comum após Pentecostes (15/jul): verde', () => {
      const state = getLiturgicalState(makeDate(2026, 7, 15));
      expect(state.macroSeason).toBe('ordinary');
      expect(state.label).toBe('Tempo Comum');
      expect(state.color).toBe(LITURGICAL_COLORS.green);
    });

    it('Período intermediário do Tempo Comum (1/set): verde', () => {
      const state = getLiturgicalState(makeDate(2026, 9, 1));
      expect(state.macroSeason).toBe('ordinary');
      expect(state.color).toBe(LITURGICAL_COLORS.green);
    });
  });

  describe('Transições graduais', () => {
    it('Advento próximo ao Natal: cor em transição roxo→azul', () => {
      const state = getLiturgicalState(makeDate(2026, 12, 15));
      expect(state.macroSeason).toBe('advent');
      expect(state.color).not.toBe(LITURGICAL_COLORS.purple);
      expect(state.color).not.toBe(LITURGICAL_COLORS.blue);
      expect(state.progress).toBeDefined();
    });

    it('Tempo Comum próximo à Quaresma: cor em transição verde→cinza', () => {
      const state = getLiturgicalState(makeDate(2026, 2, 10));
      expect(state.macroSeason).toBe('ordinary');
      expect(state.color).not.toBe(LITURGICAL_COLORS.green);
      expect(state.color).not.toBe(LITURGICAL_COLORS.gray);
      expect(state.progress).toBeDefined();
    });

    it('Pós-Pentecostes: transição dourado→verde', () => {
      const state = getLiturgicalState(makeDate(2026, 5, 30));
      expect(state.macroSeason).toBe('ordinary');
      expect(state.progress).toBeDefined();
    });
  });

  describe('Mudança de ano civil', () => {
    it('31/dez é Natal', () => {
      const state = getLiturgicalState(makeDate(2026, 12, 31));
      expect(state.macroSeason).toBe('christmas');
    });

    it('1/jan é Natal', () => {
      const state = getLiturgicalState(makeDate(2027, 1, 1));
      expect(state.macroSeason).toBe('christmas');
    });

    it('6/jan é Tempo Comum', () => {
      const state = getLiturgicalState(makeDate(2027, 1, 6));
      expect(state.macroSeason).toBe('ordinary');
    });
  });

  describe('Ano bissexto (2024)', () => {
    it('Easter 2024 = 31/mar', () => {
      const state = getLiturgicalState(makeDate(2024, 3, 31));
      expect(state.macroSeason).toBe('easter');
      expect(state.phase).toBe('easter-sunday');
    });

    it('Good Friday 2024 = 29/mar', () => {
      const state = getLiturgicalState(makeDate(2024, 3, 29));
      expect(state.macroSeason).toBe('easter');
      expect(state.phase).toBe('good-friday');
      expect(state.color).toBe(LITURGICAL_COLORS.red);
    });

    it('Holy Saturday 2024 = 30/mar', () => {
      const state = getLiturgicalState(makeDate(2024, 3, 30));
      expect(state.macroSeason).toBe('easter');
      expect(state.phase).toBe('holy-saturday');
      expect(state.color).toBe(LITURGICAL_COLORS.black);
    });
  });

  describe('Acessibilidade', () => {
    it('phaseLabel definido para Sexta-feira da Paixão', () => {
      const state = getLiturgicalState(makeDate(2026, 4, 3));
      expect(state.phaseLabel).toBe('Sexta-feira da Paixão');
    });

    it('phaseLabel definido para Sábado de Aleluia', () => {
      const state = getLiturgicalState(makeDate(2026, 4, 4));
      expect(state.phaseLabel).toBe('Sábado de Aleluia');
    });

    it('phaseLabel definido para Domingo de Páscoa', () => {
      const state = getLiturgicalState(makeDate(2026, 4, 5));
      expect(state.phaseLabel).toBe('Domingo de Páscoa');
    });
  });
});
