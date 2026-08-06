export interface YoutubeParseResult {
  youtubeId: string | null;
  thumbnailUrl: string | null;
  canonicalUrl: string | null;
  embedUrl: string | null;
  isValid: boolean;
  error?: string;
}

/**
 * Extracts YouTube video ID, canonical thumbnail and embed URLs from any standard YouTube link format.
 */
export function parseYoutubeUrl(url: string): YoutubeParseResult {
  if (!url || typeof url !== 'string') {
    return { youtubeId: null, thumbnailUrl: null, canonicalUrl: null, embedUrl: null, isValid: false, error: 'URL inválida' };
  }

  const trimmed = url.trim();

  // RegEx for standard watch, shortened youtu.be, embed, and shorts links
  const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regex);

  if (match && match[1]) {
    const youtubeId = match[1];
    return {
      youtubeId,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      canonicalUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
      isValid: true,
    };
  }

  return {
    youtubeId: null,
    thumbnailUrl: null,
    canonicalUrl: trimmed,
    embedUrl: null,
    isValid: false,
    error: 'Não foi possível extrair um ID de vídeo válido do YouTube',
  };
}
