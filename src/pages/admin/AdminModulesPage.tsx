import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getAdminAccessToken } from '../../lib/admin/session';
import { invalidateSiteModulesCache } from '../../lib/modules/siteModulesClient';

type ModuleStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'ARCHIVED';
type DirectAccess = 'AVAILABLE' | 'CLOSING_PAGE' | 'UNAVAILABLE';

interface SiteModule {
  id: string; name: string; path: string; status: ModuleStatus;
  visibleOnHome: boolean; visibleInNavigation: boolean;
  directAccess: DirectAccess; publicOperationsOpen: boolean; permanent: boolean;
  editions: { id: string; name: string; year: number | null; status: ModuleStatus }[];
}

const statusLabels: Record<ModuleStatus, string> = {
  DRAFT: 'Rascunho', SCHEDULED: 'Agendado', ACTIVE: 'Ativo', ENDED: 'Encerrado', ARCHIVED: 'Arquivado',
};

export default function AdminModulesPage() {
  const [modules, setModules] = useState<SiteModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => { void loadModules(); }, []);

  async function authorizedFetch(url: string, init?: RequestInit) {
    const token = await getAdminAccessToken();
    return fetch(url, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init?.headers } });
  }

  async function loadModules() {
    try {
      const response = await authorizedFetch('/api/admin/modules');
      if (!response.ok) throw new Error('Não foi possível carregar os módulos.');
      setModules(await response.json());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao carregar os módulos.');
    } finally { setLoading(false); }
  }

  function updateModule(id: string, changes: Partial<SiteModule>) {
    setModules(current => current.map(module => module.id === id ? { ...module, ...changes } : module));
  }

  async function saveModule(module: SiteModule) {
    setSaving(module.id); setMessage('');
    try {
      const response = await authorizedFetch(`/api/admin/modules/${module.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: module.status, visibleOnHome: module.visibleOnHome, visibleInNavigation: module.visibleInNavigation, directAccess: module.directAccess, publicOperationsOpen: module.publicOperationsOpen }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Não foi possível salvar.');
      }
      invalidateSiteModulesCache();
      setMessage(`${module.name} atualizado com sucesso.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao salvar.');
    } finally { setSaving(null); }
  }

  return <main className="min-h-screen bg-stone-950 text-stone-100">
    <Helmet><title>Módulos do portal — Central Administrativa IBO</title></Helmet>
    <header className="border-b border-stone-800 bg-stone-900"><div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-5"><Link to="/admin" aria-label="Voltar ao painel" className="rounded-lg p-2 hover:bg-stone-800"><ArrowLeft className="h-5 w-5" /></Link><div><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-500">Central Administrativa</p><h1 className="font-serif text-2xl font-bold">Módulos do portal</h1></div></div></header>
    <section className="mx-auto max-w-6xl px-5 py-8">
      <p className="mb-6 max-w-3xl text-sm text-stone-400">Controle o ciclo de vida das áreas do site. As alterações desta tela estão ligadas somente ao ambiente configurado localmente.</p>
      {message && <div className="mb-5 rounded-xl border border-amber-700/40 bg-amber-950/30 px-4 py-3 text-sm text-amber-200">{message}</div>}
      {loading ? <div className="flex items-center gap-2 text-stone-400"><Loader2 className="h-5 w-5 animate-spin" />Carregando módulos...</div> : <div className="space-y-4">{modules.map(module => <article key={module.id} className="rounded-2xl border border-stone-800 bg-stone-900 p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-serif text-xl font-bold">{module.name}</h2><p className="mt-1 text-xs text-stone-500">{module.path} {module.permanent && '· permanente'}</p></div><button disabled={saving === module.id} onClick={() => void saveModule(module)} className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-500 disabled:opacity-50">{saving === module.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Salvar</button></div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-stone-300">Situação<select value={module.status} onChange={event => updateModule(module.id, { status: event.target.value as ModuleStatus })} className="mt-2 w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="text-sm text-stone-300">Ao acessar o endereço<select value={module.directAccess} onChange={event => updateModule(module.id, { directAccess: event.target.value as DirectAccess })} className="mt-2 w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2"><option value="AVAILABLE">Página disponível</option><option value="CLOSING_PAGE">Página de encerramento</option><option value="UNAVAILABLE">Indisponível</option></select></label>
        </div>
        <div className="mt-5 grid gap-3 text-sm md:grid-cols-3"><label className="flex items-center gap-3"><input type="checkbox" checked={module.visibleOnHome} onChange={event => updateModule(module.id, { visibleOnHome: event.target.checked })} className="h-4 w-4 accent-amber-500" />Exibir na página inicial</label><label className="flex items-center gap-3"><input type="checkbox" checked={module.visibleInNavigation} onChange={event => updateModule(module.id, { visibleInNavigation: event.target.checked })} className="h-4 w-4 accent-amber-500" />Exibir no menu</label><label className="flex items-center gap-3"><input type="checkbox" checked={module.publicOperationsOpen} onChange={event => updateModule(module.id, { publicOperationsOpen: event.target.checked })} className="h-4 w-4 accent-amber-500" />Inscrições/operações abertas</label></div>
        {module.editions.length > 0 && <p className="mt-5 border-t border-stone-800 pt-4 text-xs text-stone-400">Edições: {module.editions.map(edition => `${edition.name} (${statusLabels[edition.status]})`).join(', ')}</p>}
      </article>)}</div>}
    </section>
  </main>;
}
