export function calculateAdventSunday(year: number): Date {
  const nov27 = new Date(year, 10, 27);
  const dow = nov27.getDay();
  const diff = dow === 0 ? 0 : 7 - dow;
  return new Date(year, 10, 27 + diff);
}
