import { addDays, differenceInDays, isSameDay } from 'date-fns';
import type { LiturgicalState, MacroSeason, LiturgicalPhase } from './types';
import { LITURGICAL_COLORS, TRANSITION_CONFIG, MACRO_LABELS, PHASE_LABELS, TIMEZONE } from './config';
import { getLiturgicalDates } from './getLiturgicalDates';
import { interpolateColor } from './interpolateColor';

function normalizeDate(date: Date): Date {
  const str = date.toLocaleString('en-US', { timeZone: TIMEZONE });
  const parts = str.split(',')[0].split('/');
  const month = parseInt(parts[0], 10) - 1;
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

export function getLiturgicalState(date: Date): LiturgicalState {
  const normalizedDate = normalizeDate(date);
  const year = normalizedDate.getFullYear();

  const dates = getLiturgicalDates(year);
  const prevDates = getLiturgicalDates(year - 1);
  const nextDates = getLiturgicalDates(year + 1);

  // Priority 1: Good Friday
  if (isSameDay(normalizedDate, dates.goodFriday)) {
    return {
      macroSeason: 'easter',
      phase: 'good-friday',
      label: MACRO_LABELS.easter,
      phaseLabel: PHASE_LABELS['good-friday'],
      color: LITURGICAL_COLORS.red,
    };
  }

  // Priority 2: Holy Saturday
  if (isSameDay(normalizedDate, dates.holySaturday)) {
    return {
      macroSeason: 'easter',
      phase: 'holy-saturday',
      label: MACRO_LABELS.easter,
      phaseLabel: PHASE_LABELS['holy-saturday'],
      color: LITURGICAL_COLORS.black,
    };
  }

  // Priority 3: Easter Sunday
  if (isSameDay(normalizedDate, dates.easterSunday)) {
    return {
      macroSeason: 'easter',
      phase: 'easter-sunday',
      label: MACRO_LABELS.easter,
      phaseLabel: PHASE_LABELS['easter-sunday'],
      color: LITURGICAL_COLORS.gold,
    };
  }

  // Holy Week (Palm Sunday to Holy Thursday, excluding Good Friday and Holy Saturday)
  if (isDateInRange(normalizedDate, dates.palmSunday, addDays(dates.easterSunday, -3))) {
    return {
      macroSeason: 'easter',
      phase: 'holy-week',
      label: MACRO_LABELS.easter,
      phaseLabel: PHASE_LABELS['holy-week'],
      color: LITURGICAL_COLORS.gray,
    };
  }

  // Lent (Ash Wednesday to day before Palm Sunday)
  if (isDateInRange(normalizedDate, dates.ashWednesday, addDays(dates.palmSunday, -1))) {
    return {
      macroSeason: 'easter',
      phase: 'lent',
      label: MACRO_LABELS.easter,
      phaseLabel: PHASE_LABELS.lent,
      color: LITURGICAL_COLORS.gray,
    };
  }

  // Easter season (Easter Monday to Pentecost)
  if (isDateInRange(normalizedDate, addDays(dates.easterSunday, 1), dates.pentecost)) {
    return {
      macroSeason: 'easter',
      phase: 'easter-season',
      label: MACRO_LABELS.easter,
      phaseLabel: PHASE_LABELS['easter-season'],
      color: LITURGICAL_COLORS.gold,
    };
  }

  // Pentecost (same day as end of Easter season, but let's handle it separately for clarity)
  // Actually, Pentecost is included in the Easter season range above, so this is redundant
  // But let's keep it for explicit handling if needed in the future

  // Christmas season (Dec 25 to Jan 5 of next year)
  const christmasStart = new Date(year, 11, 25);
  const christmasEnd = new Date(year + 1, 0, 5);
  const prevChristmasEnd = new Date(year, 0, 5);

  if (isDateInRange(normalizedDate, christmasStart, christmasEnd)) {
    return {
      macroSeason: 'christmas',
      phase: 'christmas',
      label: MACRO_LABELS.christmas,
      phaseLabel: PHASE_LABELS.christmas,
      color: LITURGICAL_COLORS.blue,
    };
  }

  if (isDateInRange(normalizedDate, new Date(year, 0, 1), prevChristmasEnd)) {
    return {
      macroSeason: 'christmas',
      phase: 'christmas',
      label: MACRO_LABELS.christmas,
      phaseLabel: PHASE_LABELS.christmas,
      color: LITURGICAL_COLORS.blue,
    };
  }

  // Advent
  const adventEnd = new Date(year, 11, 24);
  if (isDateInRange(normalizedDate, dates.adventSunday, adventEnd)) {
    const daysUntilChristmas = differenceInDays(christmasStart, normalizedDate);
    const transitionStart = TRANSITION_CONFIG.adventToChristmasDays;

    let color = LITURGICAL_COLORS.purple;
    let progress: number | undefined;

    if (daysUntilChristmas <= transitionStart && daysUntilChristmas > 0) {
      progress = 1 - daysUntilChristmas / transitionStart;
      color = interpolateColor(LITURGICAL_COLORS.purple, LITURGICAL_COLORS.blue, progress);
    }

    return {
      macroSeason: 'advent',
      phase: 'advent',
      label: MACRO_LABELS.advent,
      phaseLabel: PHASE_LABELS.advent,
      color,
      progress,
    };
  }

  // Ordinary time before Lent (Jan 6 to day before Ash Wednesday)
  const ordinaryBeforeLentStart = new Date(year, 0, 6);
  const ordinaryBeforeLentEnd = addDays(dates.ashWednesday, -1);

  if (isDateInRange(normalizedDate, ordinaryBeforeLentStart, ordinaryBeforeLentEnd)) {
    const daysUntilLent = differenceInDays(dates.ashWednesday, normalizedDate);
    const transitionStart = TRANSITION_CONFIG.ordinaryToLentDays;

    let color = LITURGICAL_COLORS.green;
    let progress: number | undefined;

    if (daysUntilLent <= transitionStart && daysUntilLent > 0) {
      progress = 1 - daysUntilLent / transitionStart;
      color = interpolateColor(LITURGICAL_COLORS.green, LITURGICAL_COLORS.gray, progress);
    }

    return {
      macroSeason: 'ordinary',
      phase: 'ordinary-before-lent',
      label: MACRO_LABELS.ordinary,
      phaseLabel: PHASE_LABELS['ordinary-before-lent'],
      color,
      progress,
    };
  }

  // Ordinary time after Pentecost (day after Pentecost to day before Advent)
  const ordinaryAfterPentecostStart = addDays(dates.pentecost, 1);
  const ordinaryAfterPentecostEnd = addDays(nextDates.adventSunday, -1);

  if (isDateInRange(normalizedDate, ordinaryAfterPentecostStart, ordinaryAfterPentecostEnd)) {
    const daysSincePentecost = differenceInDays(normalizedDate, dates.pentecost);
    const daysUntilAdvent = differenceInDays(nextDates.adventSunday, normalizedDate);
    const transitionAfterPentecost = TRANSITION_CONFIG.pentecostToOrdinaryDays;
    const transitionBeforeAdvent = TRANSITION_CONFIG.ordinaryToAdventDays;

    let color = LITURGICAL_COLORS.green;
    let progress: number | undefined;

    // Transition from Pentecost gold to Ordinary green
    if (daysSincePentecost <= transitionAfterPentecost) {
      progress = daysSincePentecost / transitionAfterPentecost;
      color = interpolateColor(LITURGICAL_COLORS.gold, LITURGICAL_COLORS.green, progress);
    }
    // Transition from Ordinary green to Advent purple
    else if (daysUntilAdvent <= transitionBeforeAdvent && daysUntilAdvent > 0) {
      progress = 1 - daysUntilAdvent / transitionBeforeAdvent;
      color = interpolateColor(LITURGICAL_COLORS.green, LITURGICAL_COLORS.purple, progress);
    }

    return {
      macroSeason: 'ordinary',
      phase: 'ordinary-after-pentecost',
      label: MACRO_LABELS.ordinary,
      phaseLabel: PHASE_LABELS['ordinary-after-pentecost'],
      color,
      progress,
    };
  }

  // Transition from Christmas to Ordinary (Jan 6 to Jan 6 + transition days)
  const transitionEnd = new Date(year, 0, 6 + TRANSITION_CONFIG.christmasToOrdinaryDays);
  if (isDateInRange(normalizedDate, new Date(year, 0, 6), transitionEnd)) {
    const daysSinceJan6 = differenceInDays(normalizedDate, new Date(year, 0, 6));
    const progress = daysSinceJan6 / TRANSITION_CONFIG.christmasToOrdinaryDays;
    const color = interpolateColor(LITURGICAL_COLORS.blue, LITURGICAL_COLORS.green, progress);

    return {
      macroSeason: 'ordinary',
      phase: 'ordinary-before-lent',
      label: MACRO_LABELS.ordinary,
      phaseLabel: PHASE_LABELS['ordinary-before-lent'],
      color,
      progress,
    };
  }

  // Fallback: Ordinary time
  return {
    macroSeason: 'ordinary',
    phase: 'ordinary-after-pentecost',
    label: MACRO_LABELS.ordinary,
    phaseLabel: PHASE_LABELS['ordinary-after-pentecost'],
    color: LITURGICAL_COLORS.green,
  };
}
