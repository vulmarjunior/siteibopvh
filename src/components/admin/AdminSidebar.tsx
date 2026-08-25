import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarClock,
  BookOpen,
  Mail,
  Image,
  Shield,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  Sparkles,
  Church,
} from 'lucide-react';
import { clearAdminSession, getAdminAccessToken, getStoredAdminUser } from '../../lib/admin/session';
import { hasAdminPermission, type AdminPermission } from '../../lib/admin/permissions';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: AdminPermission;
  matches: (path: string) => boolean;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Visão Geral',
    items: [
      {
        label: 'Dashboard Executivo',
        href: '/admin',
        icon: LayoutDashboard,
        matches: (path) => path === '/admin',
      },
    ],
  },
  {
    title: 'Editorial & Conteúdo',
    items: [
      {
        label: 'Séries & Mensagens',
        href: '/admin/series',
        icon: CalendarClock,
        permission: 'series:edit',
        matches: (path) => path.startsWith('/admin/series'),
      },
      {
        label: 'Veredas IBO',
        href: '/admin/veredas',
        icon: BookOpen,
        permission: 'veredas:manage',
        matches: (path) => path.startsWith('/admin/veredas'),
      },
      {
        label: 'E-mails das Séries',
        href: '/admin/emails',
        icon: Mail,
        permission: 'email:manage',
        matches: (path) => path.startsWith('/admin/emails'),
      },
      {
        label: 'Banners da Home',
        href: '/admin/banners',
        icon: Image,
        permission: 'banners:manage',
        matches: (path) => path.startsWith('/admin/banners'),
      },
    ],
  },
  {
    title: 'Pastoral & Eventos',
    items: [
      {
        label: 'Relógio de Oração',
        href: '/admin/relogio',
        icon: Shield,
        permission: 'prayer:manage',
        matches: (path) => path.startsWith('/admin/relogio'),
      },
      {
        label: 'Histórico da EBF',
        href: '/admin/ebf',
        icon: Users,
        permission: 'ebf:manage',
        matches: (path) => path.startsWith('/admin/ebf'),
      },
    ],
  },
  {
    title: 'Governança & Sistema',
    items: [
      {
        label: 'Módulos do Portal',
        href: '/admin/modulos',
        icon: LayoutDashboard,
        permission: 'modules:manage',
        matches: (path) => path.startsWith('/admin/modulos'),
      },
      {
        label: 'Usuários & Permissões',
        href: '/admin/usuarios',
        icon: Users,
        permission: 'users:manage',
        matches: (path) => path.startsWith('/admin/usuarios'),
      },
    ],
  },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = getStoredAdminUser();
  const role = user?.role;

  async function handleLogout() {
    const token = await getAdminAccessToken();
    await fetch('/api/admin/auth/logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => undefined);
    await clearAdminSession();
    navigate('/admin/login', { replace: true });
  }

  const roleLabelMap: Record<string, string> = {
    SUPERADMIN: 'Administrador Geral',
    ADMIN_GERAL: 'Administrador Geral',
    EDITOR_VEREDAS: 'Editor Veredas',
    COORDENADOR_EBF: 'Coordenação EBF',
    COORDENADOR_ORACAO: 'Coordenação Oração',
    INTERCESSOR: 'Intercessor',
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-stone-800/80 bg-stone-950 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-stone-800/80 px-4">
          <Link
            to="/admin"
            className="flex items-center gap-3 overflow-hidden text-left"
            title="Ir para o Dashboard"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 font-bold shadow-md shadow-amber-500/10">
              <Church className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[.25em] text-amber-500">
                  Igreja Batista Olaria
                </p>
                <h2 className="font-serif text-base font-bold tracking-tight text-stone-100 truncate">
                  Central IBO
                </h2>
              </div>
            )}
          </Link>

          {/* Desktop Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="hidden rounded-lg p-1.5 text-stone-400 hover:bg-stone-800 hover:text-stone-200 lg:flex"
            title={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-stone-800">
          {navSections.map((section) => {
            const visibleItems = section.items.filter(
              (item) => !item.permission || (role && hasAdminPermission(role, item.permission))
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                {!collapsed && (
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-stone-300 mb-2">
                    {section.title}
                  </p>
                )}
                {visibleItems.map((item) => {
                  const active = item.matches(pathname);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onCloseMobile}
                      title={collapsed ? item.label : undefined}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        active
                          ? 'bg-amber-500 text-stone-950 font-semibold shadow-md shadow-amber-500/10'
                          : 'text-stone-300 hover:bg-stone-900 hover:text-stone-100'
                      } ${collapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${
                          active ? 'text-stone-950' : 'text-amber-500/80 group-hover:text-amber-400'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Profile & Quick Logout Footer */}
        <div className="border-t border-stone-800/80 bg-stone-900/40 p-3">
          {!collapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-800 text-amber-400 font-bold border border-stone-700">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-stone-200 truncate">
                    {user?.name || user?.email || 'Administrador'}
                  </p>
                  <p className="text-[10px] text-amber-500 font-medium truncate">
                    {role ? roleLabelMap[role] || role : 'Administrador'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 pt-1 border-t border-stone-800/60">
                <Link
                  to="/admin/definir-senha"
                  className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-stone-400 hover:bg-stone-800 hover:text-stone-200"
                  title="Alterar senha"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Senha</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                  title="Encerrar sessão"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 hover:bg-rose-950/40 hover:text-rose-300"
                title="Encerrar sessão"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
