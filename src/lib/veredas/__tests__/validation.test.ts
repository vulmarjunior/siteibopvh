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
