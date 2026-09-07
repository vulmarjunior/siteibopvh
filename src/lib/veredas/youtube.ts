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

export interface YoutubeOEmbedResult {
  title: string | null;
  authorName: string | null; // Channel name
}

/**
 * Fetches lightweight YouTube video metadata via public oEmbed endpoint.
 */
export async function fetchYoutubeOEmbed(url: string): Promise<YoutubeOEmbedResult | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data: any = await res.json();
    return {
      title: typeof data.title === 'string' ? data.title.trim() : null,
      authorName: typeof data.author_name === 'string' ? data.author_name.trim() : null,
    };
  } catch {
    return null;
  }
}

const COMMON_NON_PEOPLE_WORDS = new Set([
  'conferencia', 'conferência', 'igreja', 'ministerio', 'ministério', 'seminario', 'seminário',
  'plenaria', 'plenária', 'mensagem', 'pregação', 'pregacao', 'estudo', 'aula', 'episodio',
  'episódio', 'parte', 'canal', 'ibopvh', 'fiel', 'bucer', 'ligonier', 'culto', 'oficial',
  'completo', 'ao vivo', 'livestream', 'transmissao', 'transmissão', 'painel', 'debate', 'mesa',
  'redonda', 'podcast', 'simposio', 'simpósio', 'congresso'
]);

function cleanClericalPrefix(name: string): string {
  return name
    .replace(/^(preletor|expositor|palestrante|orador|pregação|pregador)\s*:\s*/i, '')
    .replace(/^(pr\.|pastor|rev\.|reverendo|dr\.|doutor|prof\.|professor|bispo|missionario|missionário)\s+/i, '')
    .trim();
}

/**
 * Extracts speaker/author name suggestions from YouTube title, matching against known people
 * or extracting from common title naming patterns.
 */
export function extractSpeakerSuggestions(title: string, knownPeople: string[] = []): string[] {
  if (!title || typeof title !== 'string') return [];
  const normalizedTitle = title.trim();
  const found: string[] = [];

  // 1. Check against known catalog people (high confidence)
  for (const person of knownPeople) {
    if (!person || person.trim().length < 3) continue;
    const cleanPerson = person.trim();
    // Word boundary match
    const escaped = cleanPerson.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(normalizedTitle)) {
      found.push(cleanPerson);
    }
  }

  if (found.length > 0) {
    return [...new Set(found)];
  }

  // 2. Heuristic extraction from delimiters: " | ", " — ", " - ", " // "
  const parts = normalizedTitle.split(/\s+[-—|/•]\s+/).map((p) => p.trim()).filter(Boolean);
  for (const part of parts) {
    // Check if part starts with clerical prefix (e.g., "Pr. Terry Johnson")
    if (/^(pr\.|pastor|rev\.|reverendo|dr\.|doutor|prof\.|professor)\s+/i.test(part)) {
      const candidate = cleanClericalPrefix(part);
      if (looksLikePersonName(candidate)) {
        found.push(candidate);
      }
    } else if (looksLikePersonName(part)) {
      found.push(cleanClericalPrefix(part));
    }
  }

  // 3. Parenthesis check: e.g. "Plenária 1 (Heber Campos Jr.)"
  const parenMatch = normalizedTitle.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const inside = parenMatch[1].trim();
    const candidate = cleanClericalPrefix(inside);
    if (looksLikePersonName(candidate)) {
      found.push(candidate);
    }
  }

  // 4. "Preletor: Name" or "Expositor: Name"
  const labelMatch = normalizedTitle.match(/(?:preletor|expositor|palestrante|orador|pregação|pregador):\s*([^,-|—]+)/i);
  if (labelMatch && labelMatch[1]) {
    const candidate = cleanClericalPrefix(labelMatch[1].trim());
    if (looksLikePersonName(candidate)) {
      found.push(candidate);
    }
  }

  return [...new Set(found)];
}

function looksLikePersonName(text: string): boolean {
  if (!text || text.length < 4 || text.length > 40) return false;
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 5) return false;

  for (const word of words) {
    const lower = word.toLowerCase().replace(/[^a-záéíóúâêîôûãõç]/gi, '');
    if (COMMON_NON_PEOPLE_WORDS.has(lower)) {
      return false;
    }
  }

  // At least 2 words start with capital letter
  const capitalWords = words.filter((w) => /^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ]/.test(w));
  return capitalWords.length >= 2;
}

