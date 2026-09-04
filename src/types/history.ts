export interface HistoricalEra {
  id: string;
  name: string;
  period: string;
  subtitle: string;
  description: string;
  color: string;
  badge: string;
}

export interface HistoricalQuote {
  text: string;
  author: string;
  role: string;
  source: string;
  year?: number;
}

export interface TimelineMilestone {
  id: string;
  eraId: string;
  year: number;
  exactDate?: string;
  location: string;
  title: string;
  subtitle: string;
  narrative: string;
  highlights: string[];
  keyFigures: string[];
  quote?: HistoricalQuote;
  theologicalPillar?: string;
  curiosity?: string;
  badge: string;
  iconName: 'scroll' | 'anchor' | 'ship' | 'book' | 'flame' | 'map-pin' | 'hammer' | 'droplets' | 'cross' | 'church';
}

export interface HistorianDocument {
  id: string;
  title: string;
  year: number;
  author: string;
  location: string;
  documentType: string;
  excerpt: string;
  historicalContext: string;
  theologicalImpact: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Pastorate {
  id: string;
  pastorName: string;
  role: string;
  startYear: number;
  endYear?: number | null;
  photoUrl?: string | null;
  biography: string;
  keyMilestones?: string | null;
  orderIndex: number;
  active: boolean;
}

export interface HistoryItem {
  id: string;
  year: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  category: string;
  source?: string | null;
  orderIndex: number;
  active: boolean;
}
