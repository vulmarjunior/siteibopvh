import { PrismaClient } from '@prisma/client';
import { parseYoutubeUrl } from '../src/lib/veredas/youtube.js';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');

async function main() {
  const videos = await prisma.curadoriaVideo.findMany({
    select: {
      id: true,
      itemId: true,
      urlOriginal: true,
      youtubeId: true,
      incorporavel: true,
      item: { select: { titulo: true, slug: true } },
    },
    orderBy: { id: 'asc' },
  });

  const report = videos.map((video) => {
    const parsed = parseYoutubeUrl(video.urlOriginal);
    return {
      id: video.id,
      itemId: video.itemId,
      titulo: video.item.titulo,
      slug: video.item.slug,
      urlOriginal: video.urlOriginal,
      youtubeIdAtual: video.youtubeId,
      youtubeIdDetectado: parsed.youtubeId,
      incorporavel: video.incorporavel,
      precisaRepararId: Boolean(parsed.youtubeId && parsed.youtubeId !== video.youtubeId),
      precisaRevisarIncorporacao: !video.incorporavel,
      urlInvalida: !parsed.isValid,
    };
  });

  if (apply) {
    const repairs = report.filter((item) => item.precisaRepararId && item.youtubeIdDetectado);
    await prisma.$transaction(repairs.map((item) => prisma.curadoriaVideo.update({
      where: { id: item.id },
      data: {
        youtubeId: item.youtubeIdDetectado,
        thumbnailUrl: `https://img.youtube.com/vi/${item.youtubeIdDetectado}/hqdefault.jpg`,
      },
    })));
  }

  console.table(report);
  console.log(JSON.stringify({
    total: report.length,
    idsParaReparar: report.filter((item) => item.precisaRepararId).length,
    incorporacoesParaRevisar: report.filter((item) => item.precisaRevisarIncorporacao).length,
    urlsInvalidas: report.filter((item) => item.urlInvalida).length,
    modo: apply ? 'alterações aplicadas' : 'somente leitura',
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
