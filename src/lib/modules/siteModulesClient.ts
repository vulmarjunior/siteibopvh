import { useEffect, useState } from 'react';
import { SITE_MODULES, type SiteModuleConfig, type SiteModuleId } from '../../config/siteModules';

export type RuntimeSiteModule = SiteModuleConfig & { updatedAt?: string };
let cachedModules: RuntimeSiteModule[] | null = null;
let pendingRequest: Promise<RuntimeSiteModule[]> | null = null;
const fallbackModules = Object.values(SITE_MODULES) as RuntimeSiteModule[];

export function invalidateSiteModulesCache() {
  cachedModules = null;
  pendingRequest = null;
}

export async function loadSiteModules(): Promise<RuntimeSiteModule[]> {
  if (cachedModules) return cachedModules;
  if (!pendingRequest) {
    pendingRequest = fetch('/api/modules').then(async response => {
      if (!response.ok) throw new Error('Module configuration unavailable');
      const body = await response.json();
      if (!Array.isArray(body.modules) || body.modules.length === 0) throw new Error('Empty module configuration');
      cachedModules = body.modules;
      return cachedModules!;
    }).catch(() => fallbackModules).finally(() => { pendingRequest = null; });
  }
  return pendingRequest;
}

export function useSiteModules() {
  const [modules, setModules] = useState<RuntimeSiteModule[]>(cachedModules ?? fallbackModules);
  useEffect(() => { let active = true; void loadSiteModules().then(result => { if (active) setModules(result); }); return () => { active = false; }; }, []);
  return modules;
}

export function useSiteModule(moduleId: SiteModuleId) {
  return useSiteModules().find(module => module.id === moduleId) ?? SITE_MODULES[moduleId];
}
