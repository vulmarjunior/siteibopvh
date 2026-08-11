import { describe, expect, it } from 'vitest';
import { sanitizeEditorialHtml } from '../sanitizeContent';

describe('sanitizeEditorialHtml', () => {
  it('preserva a estrutura editorial e remove código perigoso', () => {
    const result = sanitizeEditorialHtml('<h2 style="color:red">Título</h2><p><strong>Texto</strong><script>alert(1)</script></p><a href="javascript:alert(1)" onclick="x()">link</a>');
    expect(result).toContain('<h2>Título</h2>');
    expect(result).toContain('<strong>Texto</strong>');
    expect(result).not.toContain('script');
    expect(result).not.toContain('javascript:');
    expect(result).not.toContain('onclick');
  });

  it('normaliza conteúdo vazio para null', () => expect(sanitizeEditorialHtml('  ')).toBeNull());
});
