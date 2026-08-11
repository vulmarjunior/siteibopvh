import { useEffect, useState } from 'react';
import type { Sermon } from '../types/parousia';

interface EditorialMessageDto {
  order: number; slug: string; title: string; scheduledFor: string; biblicalText: string;
  speaker?: string | null; summary: string; description: string | null; contentHtml?: string | null; status: string; customFields?: Record<string, any>;
  media: { type: string; url: string; title?: string; youtubeId?: string | null }[];
  materials: { title: string; type: string; url: string }[];
  readingPlan: { theme: string; days: { dayLabel: string; biblicalText: string; description: string | null }[] } | null;
}

export function toParousiaSermon(message: EditorialMessageDto): Sermon {
  const video = message.media.find(item => item.type === 'VIDEO');
  const audio = message.media.find(item => item.type === 'AUDIO');
  const images = Object.fromEntries(message.media.filter(item => item.type === 'IMAGE').map(item => [item.title || 'thumb', item.url]));
  const pdf = message.materials.find(item => item.type.toUpperCase() === 'PDF');
  const hasMaterial = Boolean(video || audio || pdf);
  return {
    numero: String(message.order).padStart(2, '0'), slug: message.slug, data: message.scheduledFor.slice(0, 10),
    titulo: message.title, pregador: message.speaker || undefined, textoBiblico: message.biblicalText,
    ato: String(message.customFields?.ato || ''), movimento: String(message.customFields?.movimento || ''),
    descricao: message.description || message.summary || '', conteudoHtml: message.contentHtml || undefined,
    youtubeId: video?.youtubeId || undefined,
    youtubeUrl: video?.url || undefined, audioUrl: audio?.url || undefined, pdfUrl: pdf?.url || undefined,
    statusManual: String(message.customFields?.statusManual || (message.status === 'SCHEDULED' ? 'em_breve' : hasMaterial ? 'disponivel' : 'pregado_materiais_em_breve')),
    artes: { ...(message.customFields?.artes || {}), ...images },
    materiais: message.materials.filter(item => item !== pdf).map(item => ({ titulo: item.title, tipo: item.type, url: item.url })),
    leituras: message.readingPlan ? { tema: message.readingPlan.theme, dias: message.readingPlan.days.map(day => ({ dia: day.dayLabel, texto: day.biblicalText, descricao: day.description || '' })) } : undefined,
  };
}

export function useParousiaSermons() {
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [source, setSource] = useState<'api' | 'unavailable'>('api');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/series/da-ascensao-a-parousia', { signal: controller.signal })
      .then(response => {
        if (response.status === 404) { setSermons([]); setSource('api'); return null; }
        if (!response.ok) throw new Error('Editorial API unavailable');
        return response.json();
      })
      .then(data => { if (data && Array.isArray(data.messages)) { setSermons(data.messages.map(toParousiaSermon)); setSource('api'); } })
      .catch(error => { if (error?.name !== 'AbortError') { setSermons([]); setSource('unavailable'); } });
    return () => controller.abort();
  }, []);
  return { sermons, source };
}
