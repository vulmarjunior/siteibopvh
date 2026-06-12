import { describe, it, expect } from 'vitest';
import {
  calculateEaster,
  calculateAshWednesday,
  calculateGoodFriday,
  calculateHolySaturday,
  calculatePentecost,
} from '../calculateEaster';
import { calculateAdventSunday } from '../calculateAdvent';

describe('calculateEaster', () => {
  it('Easter 2024 = 31/mar', () => {
    const easter = calculateEaster(2024);
    expect(easter.getFullYear()).toBe(2024);
    expect(easter.getMonth()).toBe(2); // March (0-indexed)
    expect(easter.getDate()).toBe(31);
  });

  it('Easter 2025 = 20/abr', () => {
    const easter = calculateEaster(2025);
    expect(easter.getFullYear()).toBe(2025);
    expect(easter.getMonth()).toBe(3); // April
    expect(easter.getDate()).toBe(20);
  });

  it('Easter 2026 = 5/abr', () => {
    const easter = calculateEaster(2026);
    expect(easter.getFullYear()).toBe(2026);
    expect(easter.getMonth()).toBe(3); // April
    expect(easter.getDate()).toBe(5);
  });

  it('Easter 2027 = 28/mar', () => {
    const easter = calculateEaster(2027);
    expect(easter.getFullYear()).toBe(2027);
    expect(easter.getMonth()).toBe(2); // March
    expect(easter.getDate()).toBe(28);
  });
});

describe('calculateAshWednesday', () => {
  it('Ash Wednesday 2026 = 18/fev', () => {
    const ash = calculateAshWednesday(2026);
    expect(ash.getFullYear()).toBe(2026);
    expect(ash.getMonth()).toBe(1); // February
    expect(ash.getDate()).toBe(18);
  });
});

describe('calculateGoodFriday', () => {
  it('Good Friday 2026 = 3/abr', () => {
    const gf = calculateGoodFriday(2026);
    expect(gf.getFullYear()).toBe(2026);
    expect(gf.getMonth()).toBe(3); // April
    expect(gf.getDate()).toBe(3);
  });
});

describe('calculateHolySaturday', () => {
  it('Holy Saturday 2026 = 4/abr', () => {
    const hs = calculateHolySaturday(2026);
    expect(hs.getFullYear()).toBe(2026);
    expect(hs.getMonth()).toBe(3); // April
    expect(hs.getDate()).toBe(4);
  });
});

describe('calculatePentecost', () => {
  it('Pentecost 2026 = 24/mai', () => {
    const pent = calculatePentecost(2026);
    expect(pent.getFullYear()).toBe(2026);
    expect(pent.getMonth()).toBe(4); // May
    expect(pent.getDate()).toBe(24);
  });
});

describe('calculateAdventSunday', () => {
  it('Advent 2026 = 29/nov', () => {
    const advent = calculateAdventSunday(2026);
    expect(advent.getFullYear()).toBe(2026);
    expect(advent.getMonth()).toBe(10); // November
    expect(advent.getDate()).toBe(29);
  });

  it('Advent 2025 = 30/nov', () => {
    const advent = calculateAdventSunday(2025);
    expect(advent.getFullYear()).toBe(2025);
    expect(advent.getMonth()).toBe(10); // November
    expect(advent.getDate()).toBe(30);
  });
});
