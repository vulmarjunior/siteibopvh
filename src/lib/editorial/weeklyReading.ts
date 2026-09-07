import type { PrismaClient } from '@prisma/client';
import sermoesData from '../../data/sermoes.json';

export interface WeeklyReadingSelection {
  messageId: string;
  seriesId: string;
  seriesSlug: string;
  emailEnabled: boolean;
  number: string;
  title: string;
  theme: string;
  days: { dia: string; texto: string; descricao: string }[];
}

export function getFallbackWeeklyReadingFromJSON(now = new Date()): WeeklyReadingSelection | null {
  try {
    const todayStr = now.toISOString().slice(0, 10);
    const sermonsWithReadings = (sermoesData as any[]).filter(
      (s) => s?.leituras?.tema && Array.isArray(s.leituras?.dias) && s.leituras.dias.length > 0
    );

    if (!sermonsWithReadings.length) return null;

    // Achar o sermão mais recente cuja data já chegou
    const pastSermons = sermonsWithReadings.filter((s) => s.data <= todayStr);
    const chosen = pastSermons.length > 0
      ? pastSermons[pastSermons.length - 1]
      : sermonsWithReadings[0];

    return {
      messageId: `json-${chosen.numero}`,
      seriesId: 'da-ascensao-a-parousia',
      seriesSlug: 'da-ascensao-a-parousia',
      emailEnabled: true,
      number: String(chosen.numero).padStart(2, '0'),
      title: chosen.titulo,
      theme: chosen.leituras.tema,
      days: chosen.leituras.dias.map((day: any) => ({
        dia: day.dia,
        texto: day.texto,
        descricao: day.descricao || '',
      })),
    };
  } catch (err) {
    console.error('[weeklyReading] Erro no fallback de sermoes.json:', err);
    return null;
  }
}

export async function selectCurrentWeeklyReading(
  prisma: PrismaClient,
  now = new Date(),
  seriesSlug = 'da-ascensao-a-parousia',
  enableFallback = true
): Promise<WeeklyReadingSelection | null> {
  try {
    const message = await prisma.editorialMessage.findFirst({
      where: {
        series: { slug: seriesSlug, status: { in: ['PUBLISHED', 'ENDED'] } },
        status: { in: ['PUBLISHED', 'SCHEDULED'] },
        scheduledFor: { lte: now },
        readingPlan: { isNot: null },
      },
      include: {
        series: { select: { id: true, slug: true, emailEnabled: true } },
        readingPlan: { include: { days: { orderBy: { order: 'asc' } } } },
      },
      orderBy: [{ scheduledFor: 'desc' }, { order: 'desc' }],
    });

    if (message?.readingPlan?.days.length) {
      return {
        messageId: message.id,
        seriesId: message.series.id,
        seriesSlug: message.series.slug,
        emailEnabled: message.series.emailEnabled,
        number: String(message.order).padStart(2, '0'),
        title: message.title,
        theme: message.readingPlan.theme,
        days: message.readingPlan.days.map((day) => ({
          dia: day.dayLabel,
          texto: day.biblicalText,
          descricao: day.description || '',
        })),
      };
    }
  } catch (error) {
    console.error('[weeklyReading] Erro ao consultar banco de dados:', error);
  }

  if (enableFallback && seriesSlug === 'da-ascensao-a-parousia') {
    return getFallbackWeeklyReadingFromJSON(now);
  }

  return null;
}

export function currentReadingDay(selection: WeeklyReadingSelection, now = new Date()) {
  const dayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'America/Porto_Velho' }).format(now);
  const normalized = dayName.charAt(0).toUpperCase() + dayName.slice(1).replace('-feira', '');
  return { dayLabel: normalized, reading: selection.days.find(day => day.dia.replace('-feira', '') === normalized) || null };
}

