/**
 * Remove uma edição EBD órfã (sem lições e sem ciclos) e os PDFs do bucket.
 *
 * Uso (dry-run, padrão):
 *   npx tsx --env-file=.env.production.local scripts/ebd/cleanup-orphan-edition.ts \
 *     --edition-id <id>
 *
 * Aplicar (exige credenciais de produção):
 *   npx tsx --env-file=.env.production.local scripts/ebd/cleanup-orphan-edition.ts \
 *     --edition-id <id> --apply
 *
 * Segurança:
 * - recusa a remoção se a edição tiver lições ou ciclos;
 * - exige SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para apagar o PDF;
 * - remove primeiro os objetos do bucket e só depois as linhas do banco;
 *   se a remoção do banco falhar, o script pode ser executado de novo
 *   (a edição já estará sem PDF e será removida).
 */
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const BUCKET = 'ebd';

function clean(value: string | undefined): string {
  let text = (value || '').trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1);
  }
  return text;
}

function argument(name: string): string {
  const index = process.argv.indexOf(name);
  return index >= 0 ? clean(process.argv[index + 1]) : '';
}

const apply = process.argv.includes('--apply');
const editionId = argument('--edition-id');
const expectedSha256 = argument('--expect-pdf-sha256').toLowerCase();

const prisma = new PrismaClient();

function maskedDatabase(): string {
  const raw = clean(process.env.DATABASE_URL);
  try {
    const url = new URL(raw);
    return `${url.protocol}//${url.hostname}:${url.port || '(padrão)'}${url.pathname}`;
  } catch {
    return '(DATABASE_URL ausente ou inválida)';
  }
}

async function main() {
  if (!editionId) {
    console.error('Informe --edition-id. O id aparece na URL /admin/ebd/:editionId.');
    process.exitCode = 1;
    return;
  }

  console.log(`Banco: ${maskedDatabase()}`);
  console.log(`Modo: ${apply ? 'APPLY (remoção real)' : 'dry-run (nenhuma alteração)'}`);

  const edition = await prisma.ebdEdition.findUnique({
    where: { id: editionId },
    include: {
      _count: { select: { lessons: true, cycles: true, pdfAssets: true } },
      pdfAssets: {
        select: {
          id: true,
          version: true,
          fileName: true,
          storagePath: true,
          url: true,
          sha256: true,
          sizeBytes: true,
        },
      },
    },
  });

  if (!edition) {
    console.log(`Edição ${editionId} não encontrada. Nada a fazer.`);
    return;
  }

  console.log(JSON.stringify({
    edition: {
      id: edition.id,
      publisher: edition.publisher,
      title: edition.title,
      year: edition.year,
      quarter: edition.quarter,
      className: edition.className,
      issue: edition.issue,
      volume: edition.volume,
      sourceFileName: edition.sourceFileName,
      sourceSha256: edition.sourceSha256,
    },
    counts: edition._count,
    pdfAssets: edition.pdfAssets,
  }, null, 2));

  if (edition._count.lessons > 0 || edition._count.cycles > 0) {
    throw new Error('A edição tem lições ou ciclos; a limpeza só é permitida para edição órfã.');
  }

  if (expectedSha256 && edition.pdfAssets.some((asset) => asset.sha256 !== expectedSha256)) {
    throw new Error('O SHA-256 de algum PDF não confere com --expect-pdf-sha256.');
  }

  if (!apply) {
    console.log('Dry-run concluído. Use --apply para remover a edição e os PDFs.');
    return;
  }

  const storagePaths = edition.pdfAssets
    .map((asset) => asset.storagePath)
    .filter((path): path is string => Boolean(path));

  if (storagePaths.length !== edition.pdfAssets.length) {
    throw new Error('Há PDF sem storagePath; remova o objeto manualmente antes de aplicar.');
  }

  if (storagePaths.length > 0) {
    const supabaseUrl = clean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
    const serviceRole = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);
    if (!supabaseUrl || !serviceRole) {
      throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY para remover o PDF do bucket.');
    }

    const client = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await client.storage.from(BUCKET).remove(storagePaths);
    if (error) {
      throw new Error(`Não foi possível remover o PDF do bucket: ${error.message}`);
    }
    console.log(`Objetos removidos do bucket: ${storagePaths.length}`);
  }

  const removed = await prisma.$transaction(async (tx) => {
    const assets = await tx.ebdPdfAsset.deleteMany({ where: { editionId } });
    const row = await tx.ebdEdition.delete({ where: { id: editionId } });
    return { pdfAssets: assets.count, editionId: row.id };
  });

  const remaining = await prisma.ebdEdition.findUnique({ where: { id: editionId }, select: { id: true } });
  console.log(JSON.stringify({ removed, remaining }, null, 2));
}

main()
  .catch((error) => {
    console.error('Limpeza recusada ou interrompida:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
