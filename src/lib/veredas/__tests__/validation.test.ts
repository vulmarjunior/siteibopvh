import { describe, it, expect } from 'vitest';
import { validateAccessPayload, validateItemPayload, validateReportPayload } from '../validation';
import { CuradoriaMotivoRelato, CuradoriaNivel, CuradoriaStatus, CuradoriaTipoItem } from '@prisma/client';

describe('validateReportPayload', () => {
  it('should validate correct report payload', () => {
    const res = validateReportPayload({
      acessoId: 10,
      motivo: CuradoriaMotivoRelato.LINK_NAO_ABRE,
      observacao: 'Página em branco ao clicar',
    });
    expect(res.isValid).toBe(true);
    expect(res.errors).toHaveLength(0);
    expect(res.data?.acessoId).toBe(10);
  });

  it('should reject honeypot submissions', () => {
    const res = validateReportPayload({
      acessoId: 10,
      motivo: CuradoriaMotivoRelato.LINK_NAO_ABRE,
      honeypot: 'bot-fill-value',
    });
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toContain('Submissão inválida');
  });

  it('should reject observations exceeding 500 characters', () => {
    const longText = 'a'.repeat(501);
    const res = validateReportPayload({
      acessoId: 10,
      motivo: CuradoriaMotivoRelato.LINK_NAO_ABRE,
      observacao: longText,
    });
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toContain('500 caracteres');
  });
});
describe('validateAccessPayload', () => {
  it('accepts a valid Amazon affiliate access link', () => {
    const result = validateAccessPayload({
      tipo: 'COMPRA',
      formato: 'IMPRESSO',
      provedor: 'AMAZON',
      fornecedor: 'Amazon',
      url: 'https://www.amazon.com.br/dp/8527500010?tag=ibopvh-20',
      textoBotao: 'Comprar na Amazon',
      linkAssociado: true,
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects an access link without a valid URL', () => {
    const result = validateAccessPayload({
      tipo: 'COMPRA',
      provedor: 'LIVRARIA',
      url: 'livraria.example',
      textoBotao: 'Comprar',
    });
    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain('URL');
  });
});

describe('validateItemPayload with book accesses', () => {
  it('validates every acquisition option sent with a book', () => {
    const result = validateItemPayload({
      tipo: CuradoriaTipoItem.LIVRO,
      titulo: 'Livro recomendado',
      resumo: 'Resumo suficiente para validacao',
      porqueIndicamos: 'Uma recomendacao pastoral suficientemente detalhada.',
      nivel: CuradoriaNivel.INTRODUTORIO,
      status: CuradoriaStatus.RASCUNHO,
      categoriaIds: [1],
      livro: {
        acessos: [{
          tipo: 'COMPRA',
          provedor: 'EDITORA',
          url: 'https://editora.example/livro',
          textoBotao: 'Comprar na editora',
        }],
      },
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('validateItemPayload with conference and course', () => {
  it('validates a valid conference item with playlist and sessions', () => {
    const result = validateItemPayload({
      tipo: CuradoriaTipoItem.CONFERENCIA,
      titulo: 'Conferência Teológica 2026',
      resumo: 'Plenárias completas sobre a soberania de Deus.',
      porqueIndicamos: 'Excelente série de plenárias e palestras com preletores bíblicos.',
      nivel: CuradoriaNivel.INTERMEDIARIO,
      status: CuradoriaStatus.PUBLICADO,
      categoriaIds: [1],
      curso: {
        urlOriginal: 'https://www.youtube.com/playlist?list=PL1234567890',
        playlistId: 'PL1234567890',
        canal: 'IBO Porto Velho',
        aulas: [
          {
            titulo: 'Plenária 1 - Abertura',
            youtubeId: 'abcde12345_',
            urlOriginal: 'https://www.youtube.com/watch?v=abcde12345_',
          },
        ],
        materiais: [
          {
            titulo: 'Caderno da Conferência PDF',
            url: 'https://ibopvh.com.br/docs/conferencia.pdf',
          },
        ],
      },
    });
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

