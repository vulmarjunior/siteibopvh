import { Sermon } from '../types/parousia';

export type SermonStatus = 'em_breve' | 'pregado_materiais_em_breve' | 'disponivel';

export function getSermonStatus(sermao: Sermon): SermonStatus | string {
  if (sermao.statusManual) {
    return sermao.statusManual;
  }

  const hoje = new Date();
  const dataSermao = new Date(`${sermao.data}T00:00:00`); // using midnight local time to avoid timezone offsets causing issues

  const temMaterial =
    sermao.youtubeId ||
    sermao.youtubeUrl ||
    sermao.audioUrl ||
    sermao.pdfUrl;

  if (dataSermao > hoje) {
    return 'em_breve';
  }

  if (!temMaterial) {
    return 'pregado_materiais_em_breve';
  }

  return 'disponivel';
}

export function getYoutubeWatchUrl(youtubeId?: string, youtubeUrl?: string) {
  if (youtubeUrl) return youtubeUrl;
  if (youtubeId) return `https://www.youtube.com/watch?v=${youtubeId}`;
  return '';
}

export function getYoutubeEmbedUrl(youtubeId?: string, youtubeUrl?: string) {
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`;
  if (youtubeUrl) {
    // Try to extract ID from URL
    try {
      const url = new URL(youtubeUrl);
      const v = url.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
      if (url.hostname === 'youtu.be') {
        const path = url.pathname.slice(1);
        return `https://www.youtube.com/embed/${path}`;
      }
    } catch (e) {
      // invalid url
    }
  }
  return '';
}

export function getYoutubeThumbnailUrl(youtubeId?: string) {
  if (!youtubeId) return '';
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}
