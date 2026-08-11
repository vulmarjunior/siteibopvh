import { describe, expect, it } from 'vitest';
import { isPublicOperationOpen, SITE_MODULES } from '../siteModules';

describe('siteModules', () => {
  it('mantém apenas os módulos aprovados como ativos', () => {
    const active = Object.values(SITE_MODULES).filter((module) => module.status === 'ACTIVE').map((module) => module.id);
    expect(active).toEqual(['parousia', 'veredas', 'relogio']);
  });

  it('não divulga módulos encerrados ou arquivados', () => {
    for (const module of Object.values(SITE_MODULES)) {
      if (module.status !== 'ACTIVE') {
        expect(module.visibleOnHome).toBe(false);
        expect(module.visibleInNavigation).toBe(false);
      }
    }
  });

  it('fecha operações públicas da EBF 2026', () => {
    expect(isPublicOperationOpen('ebf')).toBe(false);
  });
});

