import type { PrismaClient } from '@prisma/client';

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

export async function selectCurrentWeeklyReading(prisma: PrismaClient, now = new Date(), seriesSlug = 'da-ascensao-a-parousia'): Promise<WeeklyReadingSelection | null> {
  const message = await prisma.editorialMessage.findFirst({
    where: {
      series: { slug: seriesSlug, status: { in: ['PUBLISHED', 'ENDED'] } },
      status: { in: ['PUBLISHED', 'SCHEDULED'] },
      scheduledFor: { lte: now },
      readingPlan: { isNot: null },
    },
    include: { series: { select: { id: true, slug: true, emailEnabled: true } }, readingPlan: { include: { days: { orderBy: { order: 'asc' } } } } },
    orderBy: [{ scheduledFor: 'desc' }, { order: 'desc' }],
  });

  if (!message?.readingPlan?.days.length) return null;
  return {
    messageId: message.id,
    seriesId: message.series.id,
    seriesSlug: message.series.slug,
    emailEnabled: message.series.emailEnabled,
    number: String(message.order).padStart(2, '0'),
    title: message.title,
    theme: message.readingPlan.theme,
    days: message.readingPlan.days.map(day => ({ dia: day.dayLabel, texto: day.biblicalText, descricao: day.description || '' })),
  };
}

export function currentReadingDay(selection: WeeklyReadingSelection, now = new Date()) {
  const dayName = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', timeZone: 'America/Porto_Velho' }).format(now);
  const normalized = dayName.charAt(0).toUpperCase() + dayName.slice(1).replace('-feira', '');
  return { dayLabel: normalized, reading: selection.days.find(day => day.dia.replace('-feira', '') === normalized) || null };
}
