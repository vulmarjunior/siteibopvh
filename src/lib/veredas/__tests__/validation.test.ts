import { describe, it, expect } from 'vitest';
import { validateReportPayload } from '../validation';
import { CuradoriaMotivoRelato } from '@prisma/client';

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
