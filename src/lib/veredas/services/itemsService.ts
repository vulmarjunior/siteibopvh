import { PrismaClient, CuradoriaStatus, CuradoriaTipoItem, CuradoriaNivel } from '@prisma/client';
import { generateSlug } from '../slug.js';

export interface ItemsQueryParams {
  q?: string;
  tipo?: CuradoriaTipoItem;
  categoria?: string;
  nivel?: CuradoriaNivel;
  pessoa?: string;
  gratuito?: boolean;
  formato?: string;
  disponibilidade?: string;
  destaqueOnly?: boolean;
  page?: number;
  limit?: number;
}

export class ItemsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Fetches published items for public view with filters and pagination.
   */
  async getPublicItems(params: ItemsQueryParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(50, Math.max(1, params.limit || 12));
    const skip = (page - 1) * limit;

    const where: any = {
      status: CuradoriaStatus.PUBLICADO,
    };

    if (params.tipo) {
      where.tipo = params.tipo;
    }

    if (params.nivel) {
      where.nivel = params.nivel;
    }

    if (params.destaqueOnly) {
      where.destaque = true;
    }

    if (params.categoria) {
      where.categorias = {
        some: {
          categoria: {
            slug: params.categoria,
          },
        },
      };
    }

    if (params.q) {
      const query = params.q.trim();
      where.OR = [
        { titulo: { contains: query, mode: 'insensitive' } },
        { resumo: { contains: query, mode: 'insensitive' } },
        { porqueIndicamos: { contains: query, mode: 'insensitive' } },
        {
          livro: {
            OR: [
              { subtitulo: { contains: query, mode: 'insensitive' } },
              { editora: { contains: query, mode: 'insensitive' } },
              {
                autores: {
                  some: {
                    pessoa: {
                      nome: { contains: query, mode: 'insensitive' },
                    },
                  },
                },
              },
            ],
          },
        },
        {
          video: {
            OR: [
              { canal: { contains: query, mode: 'insensitive' } },
              {
                participantes: {
                  some: {
                    pessoa: {
                      nome: { contains: query, mode: 'insensitive' },
                    },
                  },
                },
              },
            ],
          },
        },
      ];
    }

    if (params.pessoa) {
      where.OR = [
        {
          livro: {
            autores: {
              some: {
                pessoa: {
                  slug: params.pessoa,
                },
              },
            },
          },
        },
        {
          video: {
            participantes: {
              some: {
                pessoa: {
                  slug: params.pessoa,
                },
              },
            },
          },
        },
      ];
    }

    if (params.gratuito) {
      where.livro = {
        acessos: {
          some: {
            gratuito: true,
            ativo: true,
          },
        },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.curadoriaItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: params.destaqueOnly
          ? [{ ordemDestaque: 'asc' }, { publicadoEm: 'desc' }]
          : [{ publicadoEm: 'desc' }, { criadoEm: 'desc' }],
        include: {
          categorias: {
            include: {
              categoria: true,
            },
          },
          livro: {
            include: {
              autores: {
                orderBy: { ordem: 'asc' },
                include: { pessoa: true },
              },
              acessos: {
                where: { ativo: true },
                orderBy: { ordem: 'asc' },
              },
            },
          },
          video: {
            include: {
              participantes: {
                orderBy: { ordem: 'asc' },
                include: { pessoa: true },
              },
            },
          },
        },
      }),
      this.prisma.curadoriaItem.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Fetches published item by slug.
   */
  async getPublicItemBySlug(slug: string) {
    const item = await this.prisma.curadoriaItem.findUnique({
      where: { slug },
      include: {
        categorias: {
          include: {
            categoria: true,
          },
        },
        livro: {
          include: {
            autores: {
              orderBy: { ordem: 'asc' },
              include: { pessoa: true },
            },
            acessos: {
              where: { ativo: true },
              orderBy: { ordem: 'asc' },
            },
          },
        },
        video: {
          include: {
            participantes: {
              orderBy: { ordem: 'asc' },
              include: { pessoa: true },
            },
          },
        },
      },
    });

    if (!item || item.status !== CuradoriaStatus.PUBLICADO) {
      return null;
    }

    return item;
  }

  /**
   * Administrative items list with status and tipo filter.
   */
  async getAdminItems(status?: string, tipo?: string) {
    const where: any = {};
    if (status && status !== 'TODOS') {
      where.status = status;
    }
    if (tipo && tipo !== 'TODOS') {
      where.tipo = tipo;
    }

    return this.prisma.curadoriaItem.findMany({
      where,
      orderBy: [{ criadoEm: 'desc' }],
      include: {
        categorias: {
          include: { categoria: true },
        },
        livro: {
          include: {
            autores: { include: { pessoa: true } },
            acessos: true,
          },
        },
        video: {
          include: {
            participantes: { include: { pessoa: true } },
          },
        },
      },
    });
  }

  /**
   * Get single item by ID for editing.
   */
  async getAdminItemById(id: number) {
    return this.prisma.curadoriaItem.findUnique({
      where: { id },
      include: {
        categorias: {
          include: { categoria: true },
        },
        livro: {
          include: {
            autores: { include: { pessoa: true } },
            acessos: true,
          },
        },
        video: {
          include: {
            participantes: { include: { pessoa: true } },
          },
        },
      },
    });
  }

  /**
   * Delete item by ID.
   */
  async deleteAdminItem(id: number) {
    return this.prisma.curadoriaItem.delete({
      where: { id },
    });
  }

  /**
   * Administrative item creation (Book or Video).
   */
  async createAdminItem(data: any) {
    const baseSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.titulo);

    // Ensure unique slug
    let slug = baseSlug;
    let count = 1;
    while (await this.prisma.curadoriaItem.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const status = data.status || CuradoriaStatus.RASCUNHO;
    const publicadoEm = status === CuradoriaStatus.PUBLICADO ? new Date() : null;

    const itemData: any = {
      tipo: data.tipo,
      titulo: data.titulo,
      slug,
      resumo: data.resumo,
      descricao: data.descricao || null,
      porqueIndicamos: data.porqueIndicamos,
      ressalvas: data.ressalvas || null,
      publicoIndicado: data.publicoIndicado || null,
      nivel: data.nivel,
      status,
      destaque: Boolean(data.destaque),
      ordemDestaque: data.ordemDestaque ? Number(data.ordemDestaque) : null,
      imagemUrl: data.imagemUrl || null,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      publicadoEm,
      categorias: {
        create: (data.categoriaIds || []).map((catId: number) => ({
          categoriaId: Number(catId),
        })),
      },
    };

    if (data.tipo === CuradoriaTipoItem.LIVRO) {
      itemData.livro = {
        create: {
          subtitulo: data.livro?.subtitulo || null,
          isbn10: data.livro?.isbn10 || null,
          isbn13: data.livro?.isbn13 || null,
          asin: data.livro?.asin || null,
          editora: data.livro?.editora || null,
          anoPublicacao: data.livro?.anoPublicacao ? Number(data.livro.anoPublicacao) : null,
          edicao: data.livro?.edicao || null,
          idioma: data.livro?.idioma || 'Português',
          numeroPaginas: data.livro?.numeroPaginas ? Number(data.livro.numeroPaginas) : null,
          formatoPrincipal: data.livro?.formatoPrincipal || null,
          capaUrl: data.livro?.capaUrl || null,
          disponibilidade: data.livro?.disponibilidade || 'DISPONIVEL',
          autores: {
            create: (data.livro?.pessoaIds || []).map((pessoaId: number, idx: number) => ({
              pessoaId: Number(pessoaId),
              papel: data.livro?.papel || 'AUTOR',
              ordem: idx,
            })),
          },
        },
      };
    } else if (data.tipo === CuradoriaTipoItem.VIDEO) {
      itemData.video = {
        create: {
          youtubeId: data.video?.youtubeId || null,
          urlOriginal: data.video?.urlOriginal,
          canal: data.video?.canal || null,
          duracaoSegundos: data.video?.duracaoSegundos ? Number(data.video.duracaoSegundos) : null,
          thumbnailUrl: data.video?.thumbnailUrl || null,
          incorporavel: data.video?.incorporavel !== undefined ? Boolean(data.video.incorporavel) : true,
          participantes: {
            create: (data.video?.pessoaIds || []).map((pessoaId: number, idx: number) => ({
              pessoaId: Number(pessoaId),
              papel: data.video?.papel || 'EXPOSITOR',
              ordem: idx,
            })),
          },
        },
      };
    }

    return this.prisma.curadoriaItem.create({
      data: itemData,
      include: {
        livro: true,
        video: true,
        categorias: true,
      },
    });
  }
}
