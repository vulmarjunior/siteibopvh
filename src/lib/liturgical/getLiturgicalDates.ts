import type { LiturgicalDates } from './types';
import {
  calculateEaster,
  calculateAshWednesday,
  calculatePalmSunday,
  calculateHolyThursday,
  calculateGoodFriday,
  calculateHolySaturday,
  calculatePentecost,
} from './calculateEaster';
import { calculateAdventSunday } from './calculateAdvent';

export function getLiturgicalDates(year: number): LiturgicalDates {
  return {
    year,
    ashWednesday: calculateAshWednesday(year),
    palmSunday: calculatePalmSunday(year),
    holyThursday: calculateHolyThursday(year),
    goodFriday: calculateGoodFriday(year),
    holySaturday: calculateHolySaturday(year),
    easterSunday: calculateEaster(year),
    pentecost: calculatePentecost(year),
    adventSunday: calculateAdventSunday(year),
  };
}
