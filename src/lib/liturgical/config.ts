export const TIMEZONE = 'America/Porto_Velho';

export const LITURGICAL_COLORS = {
  purple: '#6f42c1',
  blue: '#2563a6',
  green: '#3f7d44',
  gray: '#7a7a7a',
  red: '#9f1d20',
  black: '#171717',
  gold: '#c89b24',
};

export const TRANSITION_CONFIG = {
  adventToChristmasDays: 21,
  christmasToOrdinaryDays: 7,
  ordinaryToLentDays: 14,
  pentecostToOrdinaryDays: 14,
  ordinaryToAdventDays: 21,
} as const;

export const MACRO_LABELS = {
  advent: 'Advento',
  christmas: 'Natal',
  easter: 'Páscoa',
  ordinary: 'Tempo Comum',
} as const;

export const PHASE_LABELS = {
  advent: 'Advento',
  christmas: 'Natal',
  'ordinary-before-lent': 'Tempo Comum',
  lent: 'Quaresma',
  'holy-week': 'Semana Santa',
  'good-friday': 'Sexta-feira da Paixão',
  'holy-saturday': 'Sábado de Aleluia',
  'easter-sunday': 'Domingo de Páscoa',
  'easter-season': 'Período Pascal',
  pentecost: 'Pentecostes',
  'ordinary-after-pentecost': 'Tempo Comum',
} as const;
