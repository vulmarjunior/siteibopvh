export interface GalleryImage {
  id: string;
  src: string;
  thumb: string;
  placeholder: string;
  width: number;
  height: number;
  original: string;
  timestamp: string;
}

export interface GalleryStage {
  id: number;
  name: string;
  clue: string;
  icon: string;
  images: GalleryImage[];
}

export interface GalleryManifest {
  generated: string;
  totalImages: number;
  stages: GalleryStage[];
  highlights: string[];
}

export interface GalleryConfig {
  settings?: {
    sorting?: 'captureDate' | 'fileName' | 'modificationDate';
    journeyStages?: number;
    downloadsEnabled?: boolean;
    batchSize?: number;
    title?: string;
    subtitle?: string;
  };
  stages?: Record<string, { name?: string; clue?: string; icon?: string }>;
  photos?: Record<string, {
    caption?: string;
    alt?: string;
    featured?: boolean;
    hidden?: boolean;
    downloadEnabled?: boolean;
    order?: number;
  }>;
}

export interface TreasureProgress {
  unlockedStages: number[];
  cluesFound: number[];
}
