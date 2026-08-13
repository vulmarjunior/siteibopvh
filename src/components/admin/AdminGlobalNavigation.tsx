import { BookOpen, CalendarClock, LayoutDashboard, Mail, Shield, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getStoredAdminUser } from '../../lib/admin/session';
import { hasAdminPermission, type AdminPermission } from '../../lib/admin/permissions';

const items = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, matches: (path: string) => path === '/admin' },
  { label: 'Módulos', href: '/admin/modulos', icon: LayoutDashboard, permission: 'modules:manage', matches: (path: string) => path.startsWith('/admin/modulos') },
  { label: 'Séries', href: '/admin/series', icon: CalendarClock, permission: 'series:edit', matches: (path: string) => path.startsWith('/admin/series') },
  { label: 'E-mails', href: '/admin/emails', icon: Mail, permission: 'email:manage', matches: (path: string) => path.startsWith('/admin/emails') },
  { label: 'Veredas', href: '/admin/veredas', icon: BookOpen, permission: 'veredas:manage', matches: (path: string) => path.startsWith('/admin/veredas') },
  { label: 'Relógio', href: '/admin/relogio', icon: Shield, permission: 'prayer:manage', matches: (path: string) => path.startsWith('/admin/relogio') },
  { label: 'EBF', href: '/admin/ebf', icon: Users, permission: 'ebf:manage', matches: (path: string) => path.startsWith('/admin/ebf') },
  { label: 'Usuários', href: '/admin/usuarios', icon: Users, permission: 'users:manage', matches: (path: string) => path.startsWith('/admin/usuarios') },
];

export default function AdminGlobalNavigation() {
  const { pathname } = useLocation();
  const role = getStoredAdminUser()?.role;
  const visibleItems = items.filter((item) => !('permission' in item) || Boolean(role && hasAdminPermission(role, item.permission as AdminPermission)));

  return <nav aria-label="Navegação principal da Central" className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950/95 text-stone-200 shadow-lg backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
      <Link to="/admin" className="shrink-0 rounded-lg px-2 py-2 font-serif text-sm font-bold text-amber-400 hover:bg-stone-800" aria-label="Ir para o Dashboard da Central">
        Central IBO
      </Link>
      <div className="h-6 w-px shrink-0 bg-stone-800" />
      <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto" role="list">
        {visibleItems.map(({ label, href, icon: Icon, matches }) => {
          const active = matches(pathname);
          return <Link
            key={href}
            to={href}
            aria-current={active ? 'page' : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${active ? 'bg-amber-500 text-stone-950' : 'text-stone-300 hover:bg-stone-800 hover:text-white'}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>;
        })}
      </div>
    </div>
  </nav>;
}
