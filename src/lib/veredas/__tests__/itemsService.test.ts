import { describe, expect, it, vi } from 'vitest';
import { ItemsService } from '../services/itemsService';

describe('ItemsService public catalog', () => {
  it('includes course lessons and materials in catalog items', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    const prisma = {
      curadoriaItem: { findMany, count: vi.fn().mockResolvedValue(0) },
    } as any;

    await new ItemsService(prisma).getPublicItems({ tipo: 'CURSO' as any });

    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      include: expect.objectContaining({
        curso: {
          include: {
            aulas: { orderBy: { ordem: 'asc' } },
            materiais: { orderBy: { ordem: 'asc' } },
          },
        },
      }),
    }));
  });
});
