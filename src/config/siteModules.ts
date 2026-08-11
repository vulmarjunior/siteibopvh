export type SiteModuleStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'ARCHIVED';
export type DirectAccessPolicy = 'AVAILABLE' | 'CLOSING_PAGE' | 'UNAVAILABLE';

export interface SiteModuleConfig {
  id: 'parousia' | 'veredas' | 'relogio' | 'pascoa' | 'moldanos' | 'ebf';
  name: string;
  path: string;
  status: SiteModuleStatus;
  visibleOnHome: boolean;
  visibleInNavigation: boolean;
  directAccess: DirectAccessPolicy;
  publicOperationsOpen: boolean;
}

export const SITE_MODULES = {
  parousia: { id: 'parousia', name: 'Da Ascensão à Parousia', path: '/da-ascensao-a-parousia', status: 'ACTIVE', visibleOnHome: true, visibleInNavigation: false, directAccess: 'AVAILABLE', publicOperationsOpen: true },
  veredas: { id: 'veredas', name: 'Veredas IBO', path: '/veredas', status: 'ACTIVE', visibleOnHome: false, visibleInNavigation: false, directAccess: 'AVAILABLE', publicOperationsOpen: true },
  relogio: { id: 'relogio', name: 'Relógio de Oração', path: '/relogio', status: 'ACTIVE', visibleOnHome: false, visibleInNavigation: true, directAccess: 'AVAILABLE', publicOperationsOpen: true },
  pascoa: { id: 'pascoa', name: 'Páscoa e Tenebras', path: '/pascoa', status: 'ARCHIVED', visibleOnHome: false, visibleInNavigation: false, directAccess: 'CLOSING_PAGE', publicOperationsOpen: false },
  moldanos: { id: 'moldanos', name: 'Molda-nos', path: '/moldanos', status: 'ARCHIVED', visibleOnHome: false, visibleInNavigation: false, directAccess: 'CLOSING_PAGE', publicOperationsOpen: false },
  ebf: { id: 'ebf', name: 'EBF 2026 — Em Busca do Maior Tesouro', path: '/ebf', status: 'ENDED', visibleOnHome: false, visibleInNavigation: false, directAccess: 'CLOSING_PAGE', publicOperationsOpen: false },
} as const satisfies Record<string, SiteModuleConfig>;

export type SiteModuleId = keyof typeof SITE_MODULES;

export function isPublicOperationOpen(moduleId: SiteModuleId): boolean {
  const module = SITE_MODULES[moduleId];
  return module.status === 'ACTIVE' && module.publicOperationsOpen;
}
