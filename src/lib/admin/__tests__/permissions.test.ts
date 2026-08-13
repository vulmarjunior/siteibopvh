import { describe, expect, it } from 'vitest';
import { hasAdminPermission, mapLegacyCuradoriaRole, toPersistedAdminRole } from '../permissions';

describe('admin permissions', () => {
  it('maps legacy users without duplicating identities', () => {
    expect(mapLegacyCuradoriaRole('ADMIN')).toBe('ADMIN_GERAL');
    expect(mapLegacyCuradoriaRole('CURADOR')).toBe('CURADOR_VEREDAS');
    expect(mapLegacyCuradoriaRole('EDITOR')).toBe('EDITOR');
    expect(mapLegacyCuradoriaRole('OPERADOR')).toBe('OPERADOR');
    expect(toPersistedAdminRole('ADMIN_GERAL')).toBe('ADMIN');
  });
  it('keeps personal prayer requests restricted to the general administrator', () => {
    expect(hasAdminPermission('ADMIN_GERAL', 'prayer:personal-requests')).toBe(true);
    expect(hasAdminPermission('OPERADOR', 'prayer:personal-requests')).toBe(false);
  });
  it('lets editors prepare but not publish content', () => {
    expect(hasAdminPermission('EDITOR', 'series:edit')).toBe(true);
    expect(hasAdminPermission('EDITOR', 'series:publish')).toBe(false);
  });
});

