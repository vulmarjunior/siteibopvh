import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import type { SiteModuleId } from '../../config/siteModules';
import { useSiteModule } from '../../lib/modules/siteModulesClient';
import ModuleClosingPage from './ModuleClosingPage';

export default function ModuleRoute({ moduleId, children }: { moduleId: SiteModuleId; children: ReactNode }) {
  const module = useSiteModule(moduleId);
  if (module.directAccess === 'UNAVAILABLE') return <Navigate to="/" replace />;
  if (module.directAccess === 'CLOSING_PAGE') return <ModuleClosingPage moduleId={moduleId} />;
  return <>{children}</>;
}
