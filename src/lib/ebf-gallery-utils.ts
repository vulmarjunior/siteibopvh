import type { GalleryImage, GalleryStage } from '../components/ebf/ebf-gallery.types';

const WHATSAPP_TS = /(\d{4})-(\d{2})-(\d{2})\s+at\s+(\d{2})\.(\d{2})\.(\d+)$/;

export function parseWhatsAppTimestamp(filename: string): Date | null {
  const match = filename.match(WHATSAPP_TS);
  if (!match) return null;
  const [, year, month, day, hour, min, rawSec] = match;
  const secParts = rawSec.split('');
  const seconds = parseInt(secParts[0] || '0', 10);
  const subMs = secParts.length > 1
    ? parseInt(secParts.slice(1).join(''), 10) * Math.pow(10, 3 - secParts.length + 1)
    : 0;
  return new Date(Date.UTC(
    Number(year), Number(month) - 1, Number(day),
    Number(hour), Number(min), seconds, subMs
  ));
}

export function naturalCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

export function sortImagesByTimestamp(images: GalleryImage[]): GalleryImage[] {
  return [...images].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

const DEFAULT_STAGES = [
  { name: 'Início da Jornada', clue: 'Uma chave antiga brilha no início do caminho...', icon: 'Map' },
  { name: 'Primeiras Pistas', clue: 'A bússola aponta para a próxima descoberta...', icon: 'Binoculars' },
  { name: 'Pelo Caminho', clue: 'Moedas douradas marcam o caminho percorrido...', icon: 'Footprints' },
  { name: 'Grandes Descobertas', clue: 'Uma pedra preciosa aguarda ser encontrada...', icon: 'Gem' },
  { name: 'O Tesouro Encontrado', clue: 'O maior tesouro estava no coração de cada criança!', icon: 'Trophy' },
];

export function distributeToStages(
  images: GalleryImage[],
  stageCount: number = 5,
  stageOverrides?: Record<string, { name?: string; clue?: string }>
): GalleryStage[] {
  const sorted = sortImagesByTimestamp(images);
  const total = sorted.length;
  const perStage = Math.ceil(total / stageCount);
  const stages: GalleryStage[] = [];

  for (let i = 0; i < stageCount; i++) {
    const start = i * perStage;
    const end = Math.min(start + perStage, total);
    if (start >= total) break;
    const stageImages = sorted.slice(start, end);
    const defaultStage = DEFAULT_STAGES[i] || { name: `Etapa ${i + 1}`, clue: '', icon: 'Map' };
    const overrides = stageOverrides?.[String(i + 1)] || {};

    stages.push({
      id: i + 1,
      name: overrides.name || defaultStage.name,
      clue: overrides.clue || defaultStage.clue,
      icon: defaultStage.icon,
      images: stageImages,
    });
  }

  return stages;
}

export function getStageForImage(stages: GalleryStage[], imageId: string): GalleryStage | undefined {
  return stages.find(s => s.images.some(img => img.id === imageId));
}

export function flattenStages(stages: GalleryStage[]): GalleryImage[] {
  return stages.flatMap(s => s.images);
}

export function formatImageAlt(image: GalleryImage, stageName?: string): string {
  const time = new Date(image.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (stageName) return `Foto da EBF 2026 — ${stageName} — ${time}`;
  return `Foto da EBF 2026 — ${time}`;
}
