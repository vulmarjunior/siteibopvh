import { BookOpen, CalendarClock, LayoutDashboard, LogOut, Mail, Settings, Shield, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { clearAdminSession, getAdminAccessToken, getStoredAdminUser } from '../../lib/admin/session';
import { hasAdminPermission, type AdminPermission } from '../../lib/admin/permissions';

const modules = [
  { title: 'Veredas IBO', description: 'Curadoria de livros, vídeos e relatos.', href: '/admin/veredas', icon: BookOpen, permission: 'veredas:manage' },
  { title: 'Séries e mensagens', description: 'Conteúdo editorial e programação semanal.', href: '/admin/series', icon: CalendarClock, permission: 'series:edit' },
  { title: 'E-mails das séries', description: 'Preview, testes, assinantes e histórico de envios.', href: '/admin/emails', icon: Mail, permission: 'email:manage' },
  { title: 'Módulos do portal', description: 'Ciclo de vida de campanhas e serviços.', href: '/admin/modulos', icon: LayoutDashboard, permission: 'modules:manage' },
  { title: 'Relógio de Oração', description: 'Reservas, temas e configurações com acesso protegido.', href: '/admin/relogio', icon: Shield, permission: 'prayer:manage' },
  { title: 'Histórico da EBF', description: 'Inscrições isoladas por edição e exportações.', href: '/admin/ebf', icon: Users, permission: 'ebf:manage' },
  { title: 'Usuários e permissões', description: 'Papéis e acessos administrativos.', href: '/admin/usuarios', icon: Users, permission: 'users:manage' },
] as const;

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const role = getStoredAdminUser()?.role;
  const visibleModules = modules.filter((module) => Boolean(role && hasAdminPermission(role, module.permission as AdminPermission)));
  async function logout() {
    const token = await getAdminAccessToken();
    await fetch('/api/admin/auth/logout', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} }).catch(() => undefined);
    await clearAdminSession();
    navigate('/admin/login', { replace: true });
  }

  return <main className="min-h-screen bg-stone-950 text-stone-100">
    <Helmet><title>Dashboard — Central Administrativa IBO</title></Helmet>
    <header className="border-b border-stone-800 bg-stone-900"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-500">IBO</p><h1 className="font-serif text-2xl font-bold">Central Administrativa</h1></div><button onClick={logout} className="flex items-center gap-2 rounded-xl border border-stone-700 px-4 py-2 text-sm hover:bg-stone-800"><LogOut className="h-4 w-4" />Sair</button></div></header>
    <section className="mx-auto max-w-6xl px-5 py-10"><div className="mb-8"><h2 className="font-serif text-3xl font-bold">Dashboard</h2><p className="mt-2 text-stone-400">Acesso unificado aos módulos administrativos.</p></div><div className="grid gap-5 md:grid-cols-2">{visibleModules.map(({ title, description, href, icon: Icon }) => <Link key={title} to={href} className="rounded-2xl border border-stone-800 bg-stone-900 p-6 transition-colors hover:border-amber-600/60"><Icon className="h-8 w-8 text-amber-500" /><h3 className="mt-5 font-serif text-xl font-bold">{title}</h3><p className="mt-2 text-sm text-stone-400">{description}</p><span className="mt-5 inline-flex text-xs font-bold uppercase tracking-wider text-amber-500">Acessar</span></Link>)}</div><div className="mt-8 flex items-center gap-2 text-xs text-stone-500"><Settings className="h-4 w-4" />As opções são exibidas conforme seu papel administrativo.</div></section>
  </main>;
}
