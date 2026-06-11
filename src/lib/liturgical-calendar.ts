import { addDays } from 'date-fns';

export interface SeasonInfo {
  id: string;
  label: string;
  color: string;
  week: number;
  nextSeasonLabel: string;
  nextSeasonDays: number;
}

interface SeasonRange {
  id: string;
  start: Date;
  end: Date;
}

const SEASONS: Record<string, { label: string; color: string }> = {
  advent: { label: 'Advento', color: '#a37e46' },
  christmas: { label: 'Natal', color: '#d3be88' },
  ordinary: { label: 'Tempo Comum', color: '#a8a29e' },
  lent: { label: 'Quaresma', color: '#c59285' },
  easter: { label: 'Páscoa', color: '#fbbf24' },
  pentecost: { label: 'Pentecostes', color: '#bf9e5e' },
};

function getEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getAdventSunday(year: number): Date {
  const nov27 = new Date(year, 10, 27);
  const dow = nov27.getDay();
  const diff = dow === 0 ? 0 : 7 - dow;
  return new Date(year, 10, 27 + diff);
}

function getAshWednesday(year: number): Date {
  return addDays(getEaster(year), -46);
}

function getPentecost(year: number): Date {
  return addDays(getEaster(year), 49);
}

function getSeasonsForLiturgicalYear(ly: number): SeasonRange[] {
  const easter = getEaster(ly + 1);
  return [
    { id: 'advent', start: getAdventSunday(ly), end: new Date(ly, 11, 24) },
    { id: 'christmas', start: new Date(ly, 11, 25), end: new Date(ly + 1, 0, 5) },
    { id: 'ordinary', start: new Date(ly + 1, 0, 6), end: addDays(getAshWednesday(ly + 1), -1) },
    { id: 'lent', start: getAshWednesday(ly + 1), end: addDays(easter, -1) },
    { id: 'easter', start: easter, end: getPentecost(ly + 1) },
    { id: 'pentecost', start: addDays(getPentecost(ly + 1), 1), end: addDays(getAdventSunday(ly + 1), -1) },
  ];
}

export function getCurrentSeasonInfo(): SeasonInfo {
  const now = new Date();
  const y = now.getFullYear();

  for (const ly of [y - 1, y, y + 1]) {
    const seasons = getSeasonsForLiturgicalYear(ly);
    for (let i = 0; i < seasons.length; i++) {
      const s = seasons[i];
      if (now >= s.start && now <= s.end) {
        let next: SeasonRange;
        if (i === seasons.length - 1) {
          const nextSeasons = getSeasonsForLiturgicalYear(ly + 1);
          next = nextSeasons[0];
        } else {
          next = seasons[i + 1];
        }

        const msPerDay = 86400000;
        const week = Math.floor((now.getTime() - s.start.getTime()) / (7 * msPerDay)) + 1;
        const daysUntilNext = Math.ceil((next.start.getTime() - now.getTime()) / msPerDay);
        const season = SEASONS[s.id];

        return {
          id: s.id,
          label: season.label,
          color: season.color,
          week,
          nextSeasonLabel: SEASONS[next.id].label,
          nextSeasonDays: daysUntilNext,
        };
      }
    }
  }

  return {
    id: 'ordinary',
    label: 'Tempo Comum',
    color: '#a8a29e',
    week: 1,
    nextSeasonLabel: 'Advento',
    nextSeasonDays: 0,
  };
}

export function formatSeasonTooltip(info: SeasonInfo): string {
  const countdown =
    info.nextSeasonDays <= 0
      ? `${info.nextSeasonLabel} hoje`
      : info.nextSeasonDays === 1
        ? `${info.nextSeasonLabel} amanhã`
        : info.nextSeasonDays < 7
          ? `${info.nextSeasonLabel} em ${info.nextSeasonDays} dias`
          : `${info.nextSeasonLabel} em ${Math.floor(info.nextSeasonDays / 7)} semanas`;

  return `${info.label} · ${info.week}ª semana · ${countdown}`;
}
