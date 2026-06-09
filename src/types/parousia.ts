export interface ArtesSermon {
  feed?: string;
  story?: string;
  cartaz?: string;
  thumb?: string;
}

export interface MaterialApoio {
  titulo: string;
  tipo: string;
  url: string;
}

export interface LeituraDiaria {
  dia: string;
  texto: string;
  descricao: string;
}

export interface RoteiroSemanal {
  tema: string;
  dias: LeituraDiaria[];
}

export interface Sermon {
  numero: string;
  slug: string;
  data: string; // YYYY-MM-DD
  titulo: string;
  textoBiblico: string;
  ato: string;
  movimento: string;
  descricao: string;
  youtubeId?: string;
  youtubeUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  statusManual?: string;
  artes?: ArtesSermon;
  materiais?: MaterialApoio[];
  leituras?: RoteiroSemanal;
}
