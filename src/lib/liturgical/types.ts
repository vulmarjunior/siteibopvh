export type MacroSeason = 'advent' | 'christmas' | 'easter' | 'ordinary';

export type LiturgicalPhase =
  | 'advent'
  | 'christmas'
  | 'ordinary-before-lent'
  | 'lent'
  | 'holy-week'
  | 'good-friday'
  | 'holy-saturday'
  | 'easter-sunday'
  | 'easter-season'
  | 'pentecost'
  | 'ordinary-after-pentecost';

export interface LiturgicalState {
  macroSeason: MacroSeason;
  phase: LiturgicalPhase;
  label: string;
  phaseLabel?: string;
  color: string;
  progress?: number;
}

export interface LiturgicalDates {
  year: number;
  ashWednesday: Date;
  palmSunday: Date;
  holyThursday: Date;
  goodFriday: Date;
  holySaturday: Date;
  easterSunday: Date;
  pentecost: Date;
  adventSunday: Date;
}
