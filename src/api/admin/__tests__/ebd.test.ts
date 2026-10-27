import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import type { PrismaClient } from '@prisma/client';
import express from 'express';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../auth.js', () => ({
  createAdminAuthMiddleware: () => (req: any, _res: any, next: any) => {
    req.adminUser = {
      id: 'user-1',
      email: 'editor@exemplo.com',
      name: 'Editor',
      role: 'ADMIN_GERAL',
    };
    next();
  },
}));

vi.mock('../ebd-schema.js', () => ({
  ensureEbdSchema: async () => {},
}));

import { createAdminEbdRouter } from '../ebd.js';

const SHA256 = 'a'.repeat(64);
const SIZE_BYTES = 4_850_159;

function edition(overrides: Record<string, unknown> = {}) {
  return {
    id: 'edition-1',
    publisher: 'Convenção Batista Fluminense',
    year: 2026,
    quarter: 4,
    className: 'Adultos',
    title: 'Revista de Jovens e Adultos',
    issue: 72,
    volume: 18,
    sourceFileName: null,
    sourceSha256: null,
    sourcePageCount: null,
    sourceSizeBytes: null,
    createdAt: new Date('2026-10-27T12:00:00Z'),
    updatedAt: new Date('2026-10-27T12:00:00Z'),
    ...overrides,
  };
}

function asset(overrides: Record<string, unknown> = {}) {
  return {
    id: 'asset-1',
    editionId: 'edition-1',
    version: 1,
    fileName: 'PalavraeVida-1T2022-Digital.pdf',
    storagePath: 'ebd/2026/4/adultos/revista-v1.pdf',
    url: null,
    sha256: SHA256,
    sizeBytes: SIZE_BYTES,
    pageCount: 119,
    uploadedBy: 'editor@exemplo.com',
    createdAt: new Date('2026-10-27T12:00:00Z'),
    ...overrides,
  };
}

function payload() {
  return {
    schema_version: '1.0.0',
    source: {
      file_name: 'PalavraeVida-1T2022-Digital.pdf',
      sha256: SHA256,
      page_count: 119,
      size_bytes: SIZE_BYTES,
    },
    edition: {
      publisher: 'Convenção Batista Fluminense',
      title: 'Revista de Jovens e Adultos',
      year: 2022,
      quarter: 1,
      issue: 72,
      volume: 18,
      class: 'Adultos',
    },
    lessons: [
      {
        number: 1,
        title: 'Lição 1',
        base_text: 'Romanos 1:1-8',
        start_page: 16,
        end_page: 22,
        introduction: ['Introdução.'],
        sections: [
          {
            number: 1,
            title: 'Seção 1',
            paragraphs: ['Parágrafo.'],
            references: ['Rm 1:1'],
          },
        ],
        questions: [{ number: 1, text: 'Pergunta?' }],
        daily_readings: [{ day: 'SEG', reference: 'Gênesis 1:1' }],
        figures: [],
      },
    ],
  };
}

function fakePrisma(options: {
  editionRow?: Record<string, unknown>;
  assetRow?: Record<string, unknown>;
  counts?: { pdfAssets: number; lessons: number; cycles: number };
  conflict?: { id: string } | null;
} = {}) {
  const editionRow = options.editionRow ?? edition();
  const assetRow = options.assetRow ?? asset();
  const counts = options.counts ?? { pdfAssets: 0, lessons: 0, cycles: 0 };

  const prisma: any = {
    ebdEdition: {
      findUnique: vi.fn(async (args: any) => {
        if (args?.include) return { ...editionRow, lessons: [], pdfAssets: [] };
        if (args?.select?._count) return { _count: counts };
        if (args?.select?.id) return options.conflict ?? null;
        return editionRow;
      }),
      create: vi.fn(async (args: any) => ({ ...editionRow, ...args.data, id: 'edition-new' })),
      update: vi.fn(async (args: any) => ({ ...editionRow, ...args.data })),
    },
    ebdPdfAsset: {
      findFirst: vi.fn(async () => assetRow),
      update: vi.fn(async () => assetRow),
    },
    ebdLesson: {
      findMany: vi.fn(async () => []),
      upsert: vi.fn(async () => ({})),
      updateMany: vi.fn(async () => ({ count: 0 })),
    },
    ebdCycle: { findMany: vi.fn(async () => []) },
    ebdCycleLesson: {
      findMany: vi.fn(async () => []),
      delete: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    curadoriaAuditoria: { create: vi.fn(async () => ({})) },
  };
  prisma.$transaction = vi.fn(async (callback: any) => callback(prisma));
  return prisma;
}

async function request(
  prisma: any,
  method: 'GET' | 'POST' | 'PATCH',
  path: string,
  body?: unknown,
): Promise<{ status: number; body: any }> {
  const app = express();
  app.use(express.json({ limit: '2mb' }));
  app.use('/api/ebd/admin', createAdminEbdRouter(prisma as PrismaClient));
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;

  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/ebd/admin${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

describe('POST /editions (edição nasce do JSON)', () => {
  it('cria a edição com edition.* e source.* do JSON', async () => {
    const prisma = fakePrisma();
    const response = await request(prisma, 'POST', '/editions', { data: payload() });

    expect(response.status).toBe(201);
    expect(response.body.edition.id).toBe('edition-new');
    expect(prisma.ebdEdition.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        publisher: 'Convenção Batista Fluminense',
        title: 'Revista de Jovens e Adultos',
        year: 2022,
        quarter: 1,
        className: 'Adultos',
        issue: 72,
        volume: 18,
        sourceFileName: 'PalavraeVida-1T2022-Digital.pdf',
        sourceSha256: SHA256,
        sourcePageCount: 119,
        sourceSizeBytes: SIZE_BYTES,
      }),
    });
  });

  it('recusa a criação manual sem o JSON', async () => {
    const prisma = fakePrisma();
    const response = await request(prisma, 'POST', '/editions', {
      year: 2022,
      quarter: 1,
      className: 'Adultos',
      publisher: 'Editora',
      title: 'Revista',
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('a partir do JSON');
    expect(prisma.ebdEdition.create).not.toHaveBeenCalled();
  });

  it('recusa JSON fora do esquema com 422', async () => {
    const prisma = fakePrisma();
    const response = await request(prisma, 'POST', '/editions', {
      data: { ...payload(), schema_version: '2.0.0' },
    });

    expect(response.status).toBe(422);
    expect(response.body.details.length).toBeGreaterThan(0);
    expect(prisma.ebdEdition.create).not.toHaveBeenCalled();
  });
});

describe('PATCH /editions/:id (metadados antes do primeiro asset)', () => {
  it('corrige ano, trimestre e turma enquanto não há conteúdo', async () => {
    const prisma = fakePrisma({ counts: { pdfAssets: 0, lessons: 0, cycles: 0 } });
    const response = await request(prisma, 'PATCH', '/editions/edition-1', {
      year: 2023,
      quarter: 2,
      className: 'Jovens',
    });

    expect(response.status).toBe(200);
    expect(prisma.ebdEdition.update).toHaveBeenCalledWith({
      where: { id: 'edition-1' },
      data: expect.objectContaining({ year: 2023, quarter: 2, className: 'Jovens' }),
    });
  });

  it('bloqueia a correção depois do primeiro PDF, lição ou ciclo', async () => {
    const prisma = fakePrisma({ counts: { pdfAssets: 1, lessons: 0, cycles: 0 } });
    const response = await request(prisma, 'PATCH', '/editions/edition-1', { year: 2023 });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain('não tiver PDF');
    expect(prisma.ebdEdition.update).not.toHaveBeenCalled();
  });
});

describe('POST /editions/:id/import (proveniência não bloqueia)', () => {
  it('importa com ano/trimestre divergentes e devolve a nota informativa', async () => {
    const prisma = fakePrisma();
    const response = await request(prisma, 'POST', '/editions/edition-1/import', { data: payload() });

    expect(response.status).toBe(200);
    expect(response.body.imported).toBe(1);
    expect(response.body.divergences.map((item: { field: string }) => item.field)).toEqual([
      'year',
      'quarter',
    ]);
    expect(prisma.ebdLesson.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.ebdLesson.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ slug: '2026-4t-adultos-licao-01' }),
      }),
    );
  });

  it('continua bloqueando hash divergente', async () => {
    const prisma = fakePrisma({ assetRow: asset({ sha256: 'b'.repeat(64) }) });
    const response = await request(prisma, 'POST', '/editions/edition-1/import', { data: payload() });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain('hash');
    expect(prisma.ebdLesson.upsert).not.toHaveBeenCalled();
  });

  it('continua bloqueando tamanho divergente', async () => {
    const prisma = fakePrisma({ assetRow: asset({ sizeBytes: SIZE_BYTES + 1 }) });
    const response = await request(prisma, 'POST', '/editions/edition-1/import', { data: payload() });

    expect(response.status).toBe(409);
    expect(response.body.error).toContain('tamanho');
    expect(prisma.ebdLesson.upsert).not.toHaveBeenCalled();
  });

  it('continua recusando JSON fora do esquema com 422', async () => {
    const prisma = fakePrisma();
    const response = await request(prisma, 'POST', '/editions/edition-1/import', {
      data: { ...payload(), schema_version: '2.0.0' },
    });

    expect(response.status).toBe(422);
    expect(response.body.details.length).toBeGreaterThan(0);
    expect(prisma.ebdPdfAsset.findFirst).not.toHaveBeenCalled();
  });
});
