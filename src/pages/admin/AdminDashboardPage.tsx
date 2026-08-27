import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  CalendarClock,
  Image,
  LayoutDashboard,
  Mail,
  Shield,
  Users,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Radio,
} from 'lucide-react';
import { getAdminAccessToken, getStoredAdminUser } from '../../lib/admin/session';
import { hasAdminPermission, type AdminPermission } from '../../lib/admin/permissions';
import AdminPageHeader from '../../components/admin/AdminPageHeader';

interface ModuleCard {
  title: string;
  category: 'Editorial & Conteúdo' | 'Pastoral & Eventos' | 'Governança & Sistema';
  description: string;
  href: string;
  icon: React.ElementType;
  permission?: AdminPermission;
  badge?: string;
  badgeColor?: string;
}

const moduleCards: ModuleCard[] = [
  // Editorial & Conteúdo
  {
    title: 'Séries & Mensagens',
    category: 'Editorial & Conteúdo',
    description: 'Gestão de sermões, temas, passagens bíblicas, vídeos e materiais da programação pastoral.',
    href: '/admin/series',
    icon: CalendarClock,
    permission: 'series:edit',
    badge: 'Editorial',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    title: 'Veredas IBO (Curadoria)',
    category: 'Editorial & Conteúdo',
    description: 'Curadoria bíblica de livros, resenhas, vídeos, cursos recomendados e biblioteca gratuita.',
    href: '/admin/veredas',
    icon: BookOpen,
    permission: 'veredas:manage',
    badge: 'Catálogo',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  },
  {
    title: 'E-mails das Séries',
    category: 'Editorial & Conteúdo',
    description: 'Preview, envio semanal de leituras bíblicas, gestão de assinantes e testes via Resend.',
    href: '/admin/emails',
    icon: Mail,
    permission: 'email:manage',
    badge: 'Disparos',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    title: 'Banners da Página Inicial',
    category: 'Editorial & Conteúdo',
    description: 'Imagens de destaque, chamadas promocionais, links e ordenação do carrossel principal.',
    href: '/admin/banners',
    icon: Image,
    permission: 'banners:manage',
    badge: 'Home',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },

  // Pastoral & Eventos
  {
    title: 'Relógio de Oração',
    category: 'Pastoral & Eventos',
    description: 'Controle de escalas de intercessão 24h, temas de oração, intercessores e estatísticas.',
    href: '/admin/relogio',
    icon: Shield,
    permission: 'prayer:manage',
    badge: 'Intercessão',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    title: 'Histórico da EBF',
    category: 'Pastoral & Eventos',
    description: 'Inscrições da Escola Bíblica de Férias, faixas etárias, grupos por cores e relatórios.',
    href: '/admin/ebf',
    icon: Users,
    permission: 'ebf:manage',
    badge: 'Eventos',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  },

  // Governança & Sistema
  {
    title: 'Módulos do Portal',
    category: 'Governança & Sistema',
    description: 'Controle de ciclo de vida (Ativo, Rascunho, Encerrado), visibilidade na Home e páginas de fechamento.',
    href: '/admin/modulos',
    icon: LayoutDashboard,
    permission: 'modules:manage',
    badge: 'Sistema',
    badgeColor: 'text-stone-400 bg-stone-500/10 border-stone-500/20',
  },
  {
    title: 'Usuários & Permissões',
    category: 'Governança & Sistema',
    description: 'Controle de contas de acesso, papéis administrativos (Admin, Editor, Coordenação) e senhas.',
    href: '/admin/usuarios',
    icon: Users,
    permission: 'users:manage',
    badge: 'Segurança',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
];

interface DashboardStats {
  prayerCoverage: number;
  currentIntercessorsCount: number;
  monthlyIntercessors: number;
  activeModulesCount: number;
}

export default function AdminDashboardPage() {
  const user = getStoredAdminUser();
  const role = user?.role;
  const [stats, setStats] = useState<DashboardStats>({
    prayerCoverage: 0,
    currentIntercessorsCount: 0,
    monthlyIntercessors: 0,
    activeModulesCount: 4,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const token = await getAdminAccessToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch prayer stats (Escala Semanal)
        const prayerRes = await fetch('/api/relogio/sentinelas/semana').catch(() => null);
        if (prayerRes && prayerRes.ok) {
          const prayerData = await prayerRes.json();
          const coveredDays = Array.isArray(prayerData.days) ? prayerData.days.filter((d: any) => d.count > 0).length : 0;
          const todayItem = Array.isArray(prayerData.days) ? prayerData.days.find((d: any) => d.isToday) : null;
          setStats((prev) => ({
            ...prev,
            prayerCoverage: Math.round(((coveredDays || 0) / 7) * 100),
            currentIntercessorsCount: todayItem?.count || 0,
            monthlyIntercessors: prayerData.totalSentinels || 0,
          }));
        }

        // Fetch modules count
        const modulesRes = await fetch('/api/modules', { headers }).catch(() => null);
        if (modulesRes && modulesRes.ok) {
          const modulesData = await modulesRes.json();
          if (Array.isArray(modulesData)) {
            setStats((prev) => ({ ...prev, activeModulesCount: modulesData.length }));
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const visibleCards = moduleCards.filter((card) =>
    Boolean(!card.permission || (role && hasAdminPermission(role, card.permission)))
  );

  const categories = [
    'Editorial & Conteúdo',
    'Pastoral & Eventos',
    'Governança & Sistema',
  ] as const;

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Dashboard Executivo — Central Administrativa IBO</title>
      </Helmet>

      {/* Page Header with Welcome & Status */}
      <AdminPageHeader
        category="Visão Geral"
        title="Dashboard Executivo"
        description={`Bem-vindo(a), ${user?.name || 'Administrador'}. Aqui está a visão unificada da operação, comunicação e ministérios do Portal da Igreja Batista Olaria.`}
        badge={
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-0.5 text-xs font-semibold text-amber-400">
            <Sparkles className="h-3 w-3" />
            Central Ativa
          </span>
        }
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Relógio de Oração */}
        <div className="rounded-2xl border border-stone-800/80 bg-stone-900/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Relógio de Oração
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-100">
              {stats.prayerCoverage}/24h
            </span>
            <span className="text-xs text-emerald-400 font-semibold">
              {Math.round((stats.prayerCoverage / 24) * 100)}% coberto
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            {stats.currentIntercessorsCount > 0
              ? `${stats.currentIntercessorsCount} intercessores orando agora`
              : 'Nenhum intercessor no horário atual'}
          </p>
        </div>

        {/* KPI 2: Intercessores no Mês */}
        <div className="rounded-2xl border border-stone-800/80 bg-stone-900/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Intercessores no Mês
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-100">
              {stats.monthlyIntercessors}
            </span>
            <span className="text-xs text-stone-400">irmãos inscritos</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Compromissos ativos no mês vigente
          </p>
        </div>

        {/* KPI 3: Comunicação Editorial */}
        <div className="rounded-2xl border border-stone-800/80 bg-stone-900/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Série Pastoral
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CalendarClock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-100">
              Parousia
            </span>
            <span className="text-xs text-indigo-400 font-semibold">
              Publicada
            </span>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Leituras devocionais semanais ativas
          </p>
        </div>

        {/* KPI 4: Módulos no Ar */}
        <div className="rounded-2xl border border-stone-800/80 bg-stone-900/60 p-5 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Módulos do Portal
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <LayoutDashboard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-100">
              {stats.activeModulesCount}
            </span>
            <span className="text-xs text-stone-400">disponíveis</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Serviços com operação ativa
          </p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <section className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-500 mb-3">
          ⚡ Ações Rápidas
        </h2>
        <div className="flex flex-wrap gap-3">
          {(!role || hasAdminPermission(role, 'series:edit')) && (
            <Link
              to="/admin/series"
              className="flex items-center gap-2 rounded-xl border border-amber-600/40 bg-amber-500/10 px-4 py-2 text-xs font-bold text-amber-400 transition-colors hover:bg-amber-500 hover:text-stone-950"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Gerenciar Séries & Sermões</span>
            </Link>
          )}

          {(!role || hasAdminPermission(role, 'veredas:manage')) && (
            <Link
              to="/admin/veredas/conteudos/novo"
              className="flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-800/60 px-4 py-2 text-xs font-semibold text-stone-200 transition-colors hover:border-amber-500/40 hover:bg-stone-800 hover:text-amber-400"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Novo Livro no Veredas</span>
            </Link>
          )}

          {(!role || hasAdminPermission(role, 'email:manage')) && (
            <Link
              to="/admin/emails"
              className="flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-800/60 px-4 py-2 text-xs font-semibold text-stone-200 transition-colors hover:border-amber-500/40 hover:bg-stone-800 hover:text-amber-400"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Testar E-mail Semanal</span>
            </Link>
          )}

          {(!role || hasAdminPermission(role, 'banners:manage')) && (
            <Link
              to="/admin/banners"
              className="flex items-center gap-2 rounded-xl border border-stone-700 bg-stone-800/60 px-4 py-2 text-xs font-semibold text-stone-200 transition-colors hover:border-amber-500/40 hover:bg-stone-800 hover:text-amber-400"
            >
              <Image className="h-3.5 w-3.5" />
              <span>Editar Banners da Home</span>
            </Link>
          )}
        </div>
      </section>

      {/* Categorized Modules Navigation Grid */}
      <section className="space-y-6">
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-100">
            Painéis & Ferramentas
          </h2>
          <p className="mt-1 text-sm text-stone-400">
            Selecione o módulo abaixo para acessar os recursos de administração.
          </p>
        </div>

        {categories.map((category) => {
          const categoryCards = visibleCards.filter((card) => card.category === category);
          if (categoryCards.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 pl-1">
                {category}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {categoryCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link
                      key={card.title}
                      to={card.href}
                      className="group relative flex flex-col justify-between rounded-2xl border border-stone-800/80 bg-stone-900/60 p-6 transition-all hover:border-amber-500/50 hover:bg-stone-900/90 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-800 text-amber-400 border border-stone-700 transition-transform group-hover:scale-105 group-hover:border-amber-500/40">
                            <Icon className="h-5 w-5" />
                          </div>
                          {card.badge && (
                            <span
                              className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${card.badgeColor}`}
                            >
                              {card.badge}
                            </span>
                          )}
                        </div>

                        <h4 className="mt-4 font-serif text-lg font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                          {card.title}
                        </h4>
                        <p className="mt-1.5 text-sm text-stone-400 leading-relaxed">
                          {card.description}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-500 group-hover:text-amber-400">
                        <span>Acessar Painel</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
