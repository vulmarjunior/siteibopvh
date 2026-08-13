export interface YoutubeParseResult {
  youtubeId: string | null;
  thumbnailUrl: string | null;
  canonicalUrl: string | null;
  embedUrl: string | null;
  isValid: boolean;
  error?: string;
}

export interface YoutubePlaylistParseResult {
  playlistId: string | null;
  firstVideoId: string | null;
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
  let youtubeId: string | null = /^[a-zA-Z0-9_-]{11}$/.test(trimmed) ? trimmed : null;

  if (!youtubeId) {
    try {
      const parsedUrl = new URL(trimmed);
      const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
      if (hostname === 'youtu.be') {
        youtubeId = parsedUrl.pathname.split('/').filter(Boolean)[0] || null;
      } else if (hostname === 'youtube.com' || hostname === 'youtube-nocookie.com') {
        youtubeId = parsedUrl.searchParams.get('v');
        if (!youtubeId) {
          const [route, id] = parsedUrl.pathname.split('/').filter(Boolean);
          if (['embed', 'shorts', 'live', 'v'].includes(route)) youtubeId = id || null;
        }
      }
    } catch {
      youtubeId = null;
    }
  }

  if (youtubeId && /^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) {
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

export function parseYoutubePlaylistUrl(url: string): YoutubePlaylistParseResult {
  if (!url || typeof url !== 'string') {
    return { playlistId: null, firstVideoId: null, canonicalUrl: null, embedUrl: null, isValid: false, error: 'URL inválida' };
  }

  try {
    const parsedUrl = new URL(url.trim());
    const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
    if (hostname !== 'youtube.com' && hostname !== 'youtube-nocookie.com' && hostname !== 'youtu.be') {
      throw new Error('domain');
    }
    const playlistId = parsedUrl.searchParams.get('list');
    if (!playlistId || !/^[a-zA-Z0-9_-]{10,80}$/.test(playlistId)) throw new Error('playlist');
    const firstVideoId = parseYoutubeUrl(url).youtubeId;
    return {
      playlistId,
      firstVideoId,
      canonicalUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
      embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistId}`,
      isValid: true,
    };
  } catch {
    return {
      playlistId: null,
      firstVideoId: null,
      canonicalUrl: url.trim(),
      embedUrl: null,
      isValid: false,
      error: 'Informe uma URL de playlist válida do YouTube contendo o parâmetro list',
    };
  }
}
