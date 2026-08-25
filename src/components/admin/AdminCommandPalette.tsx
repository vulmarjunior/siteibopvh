import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  CalendarClock,
  Image,
  LayoutDashboard,
  Mail,
  Shield,
  Users,
  ExternalLink,
  PlusCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { getStoredAdminUser } from '../../lib/admin/session';
import { hasAdminPermission, type AdminPermission } from '../../lib/admin/permissions';

interface CommandItem {
  id: string;
  title: string;
  category: 'Páginas' | 'Ações Rápidas' | 'Atalhos';
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  permission?: AdminPermission;
  keywords?: string;
}

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminCommandPalette({ isOpen, onClose }: AdminCommandPaletteProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const user = getStoredAdminUser();

  const allItems: CommandItem[] = useMemo(
    () => [
      // Páginas
      { id: 'p-dash', title: 'Dashboard Geral', category: 'Páginas', icon: LayoutDashboard, href: '/admin' },
      { id: 'p-series', title: 'Séries & Mensagens', category: 'Páginas', icon: CalendarClock, href: '/admin/series', permission: 'series:edit', keywords: 'sermão pregações editorial' },
      { id: 'p-veredas', title: 'Veredas IBO (Curadoria)', category: 'Páginas', icon: BookOpen, href: '/admin/veredas', permission: 'veredas:manage', keywords: 'livros vídeos cursos resenhas relatos' },
      { id: 'p-emails', title: 'E-mails das Séries', category: 'Páginas', icon: Mail, href: '/admin/emails', permission: 'email:manage', keywords: 'newsletter disparos leitura semanal assinantes' },
      { id: 'p-banners', title: 'Banners da Home', category: 'Páginas', icon: Image, href: '/admin/banners', permission: 'banners:manage', keywords: 'carrossel destaque capa imagens' },
      { id: 'p-relogio', title: 'Relógio de Oração', category: 'Páginas', icon: Shield, href: '/admin/relogio', permission: 'prayer:manage', keywords: 'intercessão escalas reservas 24h' },
      { id: 'p-ebf', title: 'Histórico da EBF', category: 'Páginas', icon: Users, href: '/admin/ebf', permission: 'ebf:manage', keywords: 'escola bíblica férias crianças edições' },
      { id: 'p-modulos', title: 'Módulos do Portal', category: 'Páginas', icon: LayoutDashboard, href: '/admin/modulos', permission: 'modules:manage', keywords: 'campanhas ativação status' },
      { id: 'p-users', title: 'Usuários & Permissões', category: 'Páginas', icon: Users, href: '/admin/usuarios', permission: 'users:manage', keywords: 'administradores senhas papéis' },

      // Ações Rápidas
      { id: 'a-veredas-novo', title: 'Adicionar novo item no Veredas', category: 'Ações Rápidas', icon: PlusCircle, href: '/admin/veredas/conteudos/novo', permission: 'veredas:manage', keywords: 'cadastrar livro vídeo' },
      { id: 'a-email-test', title: 'Enviar e-mail de teste', category: 'Ações Rápidas', icon: Mail, href: '/admin/emails', permission: 'email:manage', keywords: 'testar resend' },
      { id: 'a-banner-novo', title: 'Gerenciar Banners', category: 'Ações Rápidas', icon: Image, href: '/admin/banners', permission: 'banners:manage' },
      
      // Atalhos externos
      { id: 's-site', title: 'Ir para o Portal IBO Público', category: 'Atalhos', icon: ExternalLink, action: () => window.open('/', '_blank') },
      { id: 's-parousia', title: 'Ver Hotsite Parousia', category: 'Atalhos', icon: ExternalLink, action: () => window.open('/da-ascensao-a-parousia', '_blank') },
      { id: 's-veredas-pub', title: 'Ver Portal Veredas', category: 'Atalhos', icon: ExternalLink, action: () => window.open('/veredas', '_blank') },
      { id: 's-relogio-pub', title: 'Ver Relógio de Oração', category: 'Atalhos', icon: ExternalLink, action: () => window.open('/relogio', '_blank') },
    ],
    []
  );

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (item.permission && (!user?.role || !hasAdminPermission(user.role, item.permission))) {
        return false;
      }
      if (!query.trim()) return true;
      const normalizedQuery = query.toLowerCase().trim();
      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        (item.keywords && item.keywords.toLowerCase().includes(normalizedQuery))
      );
    });
  }, [allItems, query, user?.role]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or state
        }
      }
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredItems[selectedIndex];
        if (selected) {
          executeItem(selected);
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  function executeItem(item: CommandItem) {
    onClose();
    if (item.action) {
      item.action();
    } else if (item.href) {
      navigate(item.href);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-700/70 bg-stone-900 shadow-2xl ring-1 ring-amber-500/20">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-stone-800 px-4 py-3">
          <Search className="h-5 w-5 text-amber-500 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-stone-100 placeholder-stone-400 focus:outline-none text-base"
            placeholder="Buscar páginas, módulos, ações e ferramentas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded-lg p-1 text-stone-400 hover:text-stone-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="ml-2 hidden rounded bg-stone-800 px-2 py-0.5 text-[10px] font-mono text-stone-400 sm:inline-block">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-stone-400">
              <Sparkles className="mx-auto h-8 w-8 text-amber-500/40 mb-2" />
              <p className="text-sm font-medium">Nenhum resultado encontrado para &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-stone-500 mt-1">Tente buscar por termos como &ldquo;séries&rdquo;, &ldquo;livros&rdquo;, &ldquo;oração&rdquo; ou &ldquo;usuários&rdquo;.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => executeItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-semibold'
                        : 'text-stone-300 hover:bg-stone-800/80 hover:text-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          isSelected
                            ? 'bg-stone-950/20 text-stone-950'
                            : 'bg-stone-800 text-amber-400'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                      </div>
                      <span className="truncate text-sm">{item.title}</span>
                    </div>

                    <span
                      className={`text-[11px] uppercase tracking-wider font-semibold rounded-md px-2 py-0.5 ${
                        isSelected
                          ? 'bg-stone-950/20 text-stone-950'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-stone-800/80 bg-stone-950/60 px-4 py-2.5 text-xs text-stone-400">
          <div className="flex items-center gap-3">
            <span><kbd className="rounded bg-stone-800 px-1.5 py-0.5 text-[10px] font-mono text-stone-300">↑</kbd> <kbd className="rounded bg-stone-800 px-1.5 py-0.5 text-[10px] font-mono text-stone-300">↓</kbd> Navegar</span>
            <span><kbd className="rounded bg-stone-800 px-1.5 py-0.5 text-[10px] font-mono text-stone-300">ENTER</kbd> Selecionar</span>
          </div>
          <span className="text-amber-500/80 font-medium">Central Administrativa IBO</span>
        </div>
      </div>
    </div>
  );
}
