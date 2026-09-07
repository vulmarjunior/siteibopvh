import { describe, expect, it, vi } from 'vitest';
import { ItemsService } from '../services/itemsService';

describe('ItemsService getRelatedItems', () => {
  it('returns manual relations first with their pastoral labels', async () => {
    const currentItem = {
      id: 10,
      titulo: 'Conferência sobre o Culto',
      tipo: 'CONFERENCIA',
      categorias: [{ categoriaId: 1 }],
      curso: { participantes: [{ pessoaId: 100 }] },
    };

    const manualDestination = {
      id: 20,
      titulo: 'Livro Culto Bíblico',
      tipo: 'LIVRO',
      status: 'PUBLICADO',
      categorias: [],
    };

    const prisma = {
      curadoriaItem: {
        findUnique: vi.fn().mockResolvedValue(currentItem),
        findMany: vi.fn().mockResolvedValue([]),
      },
      curadoriaItemRelacionado: {
        findMany: vi.fn().mockResolvedValue([
          {
            origemId: 10,
            destinoId: 20,
            rotulo: 'Livro-texto da conferência',
            ordem: 0,
            destino: manualDestination,
          },
        ]),
      },
    } as any;

    const service = new ItemsService(prisma);
    const related = await service.getRelatedItems(10, 4);

    expect(related).toHaveLength(1);
    expect(related[0]).toMatchObject({
      item: { id: 20, titulo: 'Livro Culto Bíblico' },
      rotulo: 'Livro-texto da conferência',
      isManual: true,
    });
  });

  it('completes with automated affinity items when manual relations are fewer than limit', async () => {
    const currentItem = {
      id: 10,
      titulo: 'Conferência Culto e Adoração',
      tipo: 'CONFERENCIA',
      categorias: [{ categoriaId: 1 }],
      curso: { participantes: [{ pessoaId: 100 }] },
    };

    const automatedCandidate = {
      id: 30,
      titulo: 'Livro de Oração e Adoração',
      tipo: 'LIVRO',
      status: 'PUBLICADO',
      categorias: [{ categoriaId: 1, categoria: { nome: 'Culto' } }],
      livro: { autores: [{ pessoaId: 100, pessoa: { nome: 'Terry L. Johnson' } }] },
    };

    const prisma = {
      curadoriaItem: {
        findUnique: vi.fn().mockResolvedValue(currentItem),
        findMany: vi.fn().mockResolvedValue([automatedCandidate]),
      },
      curadoriaItemRelacionado: {
        findMany: vi.fn().mockResolvedValue([]), // No manual relations
      },
    } as any;

    const service = new ItemsService(prisma);
    const related = await service.getRelatedItems(10, 4);

    expect(related).toHaveLength(1);
    expect(related[0]).toMatchObject({
      item: { id: 30 },
      isManual: false,
    });
    // Person match (+5) + Category match (+4) + Complementary type (+3) + Title word "adoração" (+2)
    expect(related[0].score).toBeGreaterThanOrEqual(12);
  });
});
