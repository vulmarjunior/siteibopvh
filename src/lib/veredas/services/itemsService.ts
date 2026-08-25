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
        { curso: { aulas: { some: { titulo: { contains: query, mode: 'insensitive' } } } } },
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
          curso: {
            include: {
              aulas: { orderBy: { ordem: 'asc' } },
              materiais: { orderBy: { ordem: 'asc' } },
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
        curso: { include: { aulas: { orderBy: { ordem: 'asc' } }, materiais: { orderBy: { ordem: 'asc' } } } },
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
        curso: { include: { aulas: { orderBy: { ordem: 'asc' } }, materiais: { orderBy: { ordem: 'asc' } } } },
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
        curso: { include: { aulas: { orderBy: { ordem: 'asc' } }, materiais: { orderBy: { ordem: 'asc' } } } },
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

  private buildAccessData(acessos: any[] = []) {
    return acessos.map((acesso, index) => ({
      tipo: acesso.tipo,
      formato: acesso.formato || null,
      provedor: acesso.provedor || null,
      fornecedor: acesso.fornecedor?.trim() || null,
      url: acesso.url.trim(),
      textoBotao: acesso.textoBotao.trim(),
      gratuito: Boolean(acesso.gratuito),
      linkAssociado: Boolean(acesso.linkAssociado),
      producaoIbo: Boolean(acesso.producaoIbo),
      ativo: acesso.ativo !== false,
      ordem: Number.isFinite(Number(acesso.ordem)) ? Number(acesso.ordem) : index,
      observacaoPublica: acesso.observacaoPublica?.trim() || null,
      fonte: acesso.fonte?.trim() || null,
    }));
  }

  private buildBookAuthors(livro: any = {}) {
    const authorNames: string[] = Array.isArray(livro.authorNames)
      ? [...new Set<string>(livro.authorNames.map((name: unknown) => String(name || '').trim()).filter(Boolean))]
      : [];
    const importedAuthors = authorNames.map((name, index) => ({
      papel: 'AUTOR' as const,
      ordem: index,
      pessoa: {
        connectOrCreate: {
          where: { slug: generateSlug(name) },
          create: { nome: name, slug: generateSlug(name) },
        },
      },
    }));
    const selectedAuthors = (livro.pessoaIds || []).map((pessoaId: number, index: number) => ({
      pessoaId: Number(pessoaId),
      papel: livro.papel || 'AUTOR',
      ordem: importedAuthors.length + index,
    }));
    return [...importedAuthors, ...selectedAuthors];
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
            create: this.buildBookAuthors(data.livro),
          },
          acessos: {
            create: this.buildAccessData(data.livro?.acessos),
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
    } else if (data.tipo === CuradoriaTipoItem.CURSO || data.tipo === CuradoriaTipoItem.CONFERENCIA) {
      itemData.curso = {
        create: {
          playlistId: data.curso.playlistId,
          urlOriginal: data.curso.urlOriginal,
          canal: data.curso.canal || null,
          thumbnailUrl: data.curso.thumbnailUrl || data.curso.aulas[0]?.thumbnailUrl || null,
          aulas: {
            create: data.curso.aulas.map((aula: any, index: number) => ({
              ordem: index + 1,
              titulo: aula.titulo.trim(),
              youtubeId: aula.youtubeId,
              urlOriginal: aula.urlOriginal || `https://www.youtube.com/watch?v=${aula.youtubeId}&list=${data.curso.playlistId}`,
              thumbnailUrl: aula.thumbnailUrl || `https://img.youtube.com/vi/${aula.youtubeId}/hqdefault.jpg`,
            })),
          },
          materiais: {
            create: (data.curso.materiais || []).map((material: any, index: number) => ({
              ordem: index + 1,
              titulo: material.titulo.trim(),
              url: material.url.trim(),
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
        curso: { include: { aulas: { orderBy: { ordem: 'asc' } }, materiais: { orderBy: { ordem: 'asc' } } } },
        categorias: true,
      },
    });
  }
  /**
   * Updates an existing item and replaces editable relationships atomically.
   */
  async updateAdminItem(id: number, data: any) {
    const updated = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.curadoriaItem.findUnique({
        where: { id },
        include: { livro: true, video: true, curso: true },
      });

      if (!existing) return false;

      const publicadoEm =
        data.status === CuradoriaStatus.PUBLICADO
          ? existing.publicadoEm || new Date()
          : existing.publicadoEm;

      await tx.curadoriaItem.update({
        where: { id },
        data: {
          titulo: data.titulo,
          resumo: data.resumo,
          descricao: data.descricao || null,
          porqueIndicamos: data.porqueIndicamos,
          ressalvas: data.ressalvas || null,
          publicoIndicado: data.publicoIndicado || null,
          nivel: data.nivel,
          status: data.status || existing.status,
          destaque: Boolean(data.destaque),
          ordemDestaque: data.ordemDestaque ? Number(data.ordemDestaque) : null,
          imagemUrl: data.imagemUrl || null,
          seoTitle: data.seoTitle || null,
          seoDescription: data.seoDescription || null,
          publicadoEm,
          arquivadoEm: data.status === CuradoriaStatus.ARQUIVADO ? new Date() : null,
          categorias: {
            deleteMany: {},
            create: (data.categoriaIds || []).map((catId: number) => ({
              categoriaId: Number(catId),
            })),
          },
        },
      });

      if (existing.tipo === CuradoriaTipoItem.LIVRO && existing.livro) {
        await tx.curadoriaLivro.update({
          where: { id: existing.livro.id },
          data: {
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
              deleteMany: {},
              create: this.buildBookAuthors(data.livro),
            },
            acessos: {
              deleteMany: {},
              create: this.buildAccessData(data.livro?.acessos),
            },
          },
        });
      } else if (existing.tipo === CuradoriaTipoItem.VIDEO && existing.video) {
        await tx.curadoriaVideo.update({
          where: { id: existing.video.id },
          data: {
            youtubeId: data.video?.youtubeId || null,
            urlOriginal: data.video?.urlOriginal,
            canal: data.video?.canal || null,
            duracaoSegundos: data.video?.duracaoSegundos ? Number(data.video.duracaoSegundos) : null,
            thumbnailUrl: data.video?.thumbnailUrl || null,
            incorporavel: data.video?.incorporavel !== false,
          },
        });
      } else if ((existing.tipo === CuradoriaTipoItem.CURSO || existing.tipo === CuradoriaTipoItem.CONFERENCIA) && existing.curso) {
        await tx.curadoriaCurso.update({
          where: { id: existing.curso.id },
          data: {
            playlistId: data.curso.playlistId,
            urlOriginal: data.curso.urlOriginal,
            canal: data.curso.canal || null,
            thumbnailUrl: data.curso.thumbnailUrl || data.curso.aulas[0]?.thumbnailUrl || null,
          },
        });
        await tx.curadoriaCursoAula.deleteMany({ where: { cursoId: existing.curso.id } });
        await tx.curadoriaCursoMaterial.deleteMany({ where: { cursoId: existing.curso.id } });
        await tx.curadoriaCursoAula.createMany({
          data: data.curso.aulas.map((aula: any, index: number) => ({
            cursoId: existing.curso!.id,
            ordem: index + 1,
            titulo: aula.titulo.trim(),
            youtubeId: aula.youtubeId,
            urlOriginal: aula.urlOriginal || `https://www.youtube.com/watch?v=${aula.youtubeId}&list=${data.curso.playlistId}`,
            thumbnailUrl: aula.thumbnailUrl || `https://img.youtube.com/vi/${aula.youtubeId}/hqdefault.jpg`,
          })),
        });
        const materiais = data.curso.materiais || [];
        if (materiais.length) {
          await tx.curadoriaCursoMaterial.createMany({
            data: materiais.map((material: any, index: number) => ({
              cursoId: existing.curso!.id,
              ordem: index + 1,
              titulo: material.titulo.trim(),
              url: material.url.trim(),
            })),
          });
        }
      }

      return true;
    }, { maxWait: 5_000, timeout: 15_000 });
    if (!updated) return null;
    return this.prisma.curadoriaItem.findUnique({
      where: { id },
      include: {
        categorias: { include: { categoria: true } },
        livro: { include: { acessos: { orderBy: { ordem: 'asc' } } } },
        video: true,
        curso: { include: { aulas: { orderBy: { ordem: 'asc' } }, materiais: { orderBy: { ordem: 'asc' } } } },
      },
    });
  }

}
