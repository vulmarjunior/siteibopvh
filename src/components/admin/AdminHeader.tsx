import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Menu,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Radio,
} from 'lucide-react';

interface AdminHeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  collapsed: boolean;
}

const routeTitles: Record<string, string> = {
  '/admin': 'Dashboard Executivo',
  '/admin/series': 'Séries & Mensagens',
  '/admin/veredas': 'Veredas IBO (Curadoria)',
  '/admin/veredas/conteudos/novo': 'Novo Conteúdo Veredas',
  '/admin/veredas/relatos': 'Relatos e Testemunhos',
  '/admin/emails': 'E-mails das Séries',
  '/admin/banners': 'Banners da Home',
  '/admin/relogio': 'Relógio de Oração',
  '/admin/ebf': 'Histórico da EBF',
  '/admin/modulos': 'Módulos do Portal',
  '/admin/usuarios': 'Usuários & Permissões',
  '/admin/definir-senha': 'Redefinir Senha',
};

export default function AdminHeader({
  onOpenMobileSidebar,
  onOpenCommandPalette,
  collapsed,
}: AdminHeaderProps) {
  const { pathname } = useLocation();

  // Determine current breadcrumb label
  const currentTitle = routeTitles[pathname] || (
    pathname.startsWith('/admin/series/') ? 'Editor de Série' :
    pathname.startsWith('/admin/veredas/conteudos/') ? 'Editar Item Veredas' :
    'Central Administrativa'
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-stone-800/80 bg-stone-950/90 px-4 backdrop-blur-md transition-all sm:px-6">
      {/* Left side: Mobile Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileSidebar}
          className="rounded-xl border border-stone-800 p-2 text-stone-400 hover:bg-stone-900 hover:text-stone-200 lg:hidden"
          aria-label="Abrir menu de navegação"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm">
          <Link
            to="/admin"
            className="font-medium text-stone-400 hover:text-amber-400 transition-colors"
          >
            Central IBO
          </Link>
          {pathname !== '/admin' && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-stone-600 shrink-0" />
              <span className="font-semibold text-stone-200 truncate max-w-[200px] sm:max-w-none">
                {currentTitle}
              </span>
            </>
          )}
        </nav>
      </div>

      {/* Right side: Search Trigger, Status, Public Link */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 rounded-xl border border-stone-800 bg-stone-900/80 px-3 py-1.5 text-xs text-stone-400 transition-colors hover:border-amber-500/40 hover:bg-stone-900 hover:text-stone-200"
          title="Abrir busca rápida (Ctrl+K)"
        >
          <Search className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="hidden md:inline">Buscar ferramentas...</span>
          <span className="inline md:hidden">Buscar</span>
          <kbd className="hidden rounded bg-stone-800 px-1.5 py-0.5 text-[10px] font-mono text-stone-400 lg:inline-block">
            Ctrl+K
          </kbd>
        </button>

        {/* System Health Badge */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-900/40 bg-emerald-950/30 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>Operacional</span>
        </div>

        {/* Public Site Link */}
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl border border-stone-800 px-3 py-1.5 text-xs font-semibold text-stone-300 transition-colors hover:border-stone-700 hover:bg-stone-900 hover:text-amber-400"
          title="Ver o site público da IBO"
        >
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          <span className="hidden sm:inline">Ver Portal</span>
        </Link>
      </div>
    </header>
  );
}
