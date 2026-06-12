import { addDays } from 'date-fns';

export interface SeasonInfo {
  id: string;
  label: string;
  technical: string;
  color: string;
  week: number;
  nextSeasonLabel: string;
  nextSeasonDays: number;
}

export interface LiturgicalSegment {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  startFraction: number;
  endFraction: number;
}

export interface LiturgicalYearProgress {
  progress: number;
  currentSeason: SeasonInfo;
  segments: LiturgicalSegment[];
  yearStart: Date;
  yearEnd: Date;
}

interface SeasonRange {
  id: string;
  start: Date;
  end: Date;
}

const MACRO_SEASONS: Record<string, { label: string; technical: string; color: string; shortLabel: string }> = {
  advent: { label: 'Preparação', technical: 'Advento', color: '#a37e46', shortLabel: 'Prep' },
  christmas: { label: 'Natal', technical: 'Natal', color: '#d3be88', shortLabel: 'Natal' },
  easter: { label: 'Páscoa', technical: 'Páscoa', color: '#fbbf24', shortLabel: 'Pás' },
  ordinary: { label: 'Caminhada', technical: 'Tempo Comum', color: '#a8a29e', shortLabel: 'Camin' },
};

function aggregateToMacro(seasonId: string): string {
  switch (seasonId) {
    case 'lent':
      return 'easter';
    case 'pentecost':
      return 'ordinary';
    default:
      return seasonId;
  }
}

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

function findSeasonForDate(date: Date): { season: SeasonRange; macroId: string; next: SeasonRange; nextMacroId: string; week: number; daysUntilNext: number } | null {
  const y = date.getFullYear();

  for (const ly of [y - 1, y, y + 1]) {
    const seasons = getSeasonsForLiturgicalYear(ly);
    for (let i = 0; i < seasons.length; i++) {
      const s = seasons[i];
      if (date >= s.start && date <= s.end) {
        let next: SeasonRange;
        if (i === seasons.length - 1) {
          const nextSeasons = getSeasonsForLiturgicalYear(ly + 1);
          next = nextSeasons[0];
        } else {
          next = seasons[i + 1];
        }

        const msPerDay = 86400000;
        const week = Math.floor((date.getTime() - s.start.getTime()) / (7 * msPerDay)) + 1;
        const daysUntilNext = Math.ceil((next.start.getTime() - date.getTime()) / msPerDay);

        return {
          season: s,
          macroId: aggregateToMacro(s.id),
          next,
          nextMacroId: aggregateToMacro(next.id),
          week,
          daysUntilNext,
        };
      }
    }
  }

  return null;
}

export function getCurrentSeasonInfo(): SeasonInfo {
  const now = new Date();
  const result = findSeasonForDate(now);

  if (!result) {
    return {
      id: 'ordinary',
      label: 'Caminhada',
      technical: 'Tempo Comum',
      color: '#a8a29e',
      week: 1,
      nextSeasonLabel: 'Preparação',
      nextSeasonDays: 0,
    };
  }

  const currentMacro = MACRO_SEASONS[result.macroId];
  const nextMacro = MACRO_SEASONS[result.nextMacroId];

  return {
    id: result.macroId,
    label: currentMacro.label,
    technical: currentMacro.technical,
    color: currentMacro.color,
    week: result.week,
    nextSeasonLabel: nextMacro.label,
    nextSeasonDays: result.daysUntilNext,
  };
}

export function getLiturgicalYearProgress(): LiturgicalYearProgress {
  const now = new Date();
  const y = now.getFullYear();

  let yearStart: Date;
  let yearEnd: Date;

  const advY = getAdventSunday(y);
  if (now >= advY) {
    yearStart = advY;
    yearEnd = addDays(getAdventSunday(y + 1), -1);
  } else {
    yearStart = getAdventSunday(y - 1);
    yearEnd = addDays(advY, -1);
  }

  const yearMs = yearEnd.getTime() - yearStart.getTime();
  const progress = Math.max(0, Math.min(1, (now.getTime() - yearStart.getTime()) / yearMs));

  const seasons = getSeasonsForLiturgicalYear(yearStart.getFullYear());
  const msPerDay = 86400000;

  const segments: LiturgicalSegment[] = [];
  for (const s of seasons) {
    const macroId = aggregateToMacro(s.id);
    const macro = MACRO_SEASONS[macroId];
    const startFraction = Math.max(0, (s.start.getTime() - yearStart.getTime()) / yearMs);
    const endFraction = Math.min(1, (s.end.getTime() + msPerDay - yearStart.getTime()) / yearMs);
    segments.push({
      id: macroId,
      label: macro.label,
      shortLabel: macro.shortLabel,
      color: macro.color,
      startFraction,
      endFraction,
    });
  }

  const merged = mergeSegments(segments);
  const currentSeason = getCurrentSeasonInfo();

  return {
    progress,
    currentSeason,
    segments: merged,
    yearStart,
    yearEnd,
  };
}

function mergeSegments(segments: LiturgicalSegment[]): LiturgicalSegment[] {
  if (segments.length === 0) return [];

  const sorted = [...segments].sort((a, b) => a.startFraction - b.startFraction);
  const merged: LiturgicalSegment[] = [];

  for (const seg of sorted) {
    const last = merged[merged.length - 1];
    if (last && last.id === seg.id && seg.startFraction <= last.endFraction + 0.001) {
      last.endFraction = Math.max(last.endFraction, seg.endFraction);
    } else {
      merged.push({ ...seg });
    }
  }

  return merged;
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
