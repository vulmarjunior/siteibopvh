import { Archive, ArrowLeft, BookOpen, EyeOff, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { getAdminAccessToken } from '../../lib/admin/session';

interface SeriesItem { id: string; slug: string; title: string; subtitle: string | null; status: string; updatedAt: string; _count: { messages: number } }

export default function AdminSeriesManagementPage() {
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();
  useEffect(() => { void load(); }, []);

  async function request(url: string, init?: RequestInit) { const token = await getAdminAccessToken(); return fetch(url, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init?.headers } }); }
  async function load() { const response = await request('/api/admin/series'); if (response.ok) setSeries(await response.json()); else setError('Não foi possível carregar as séries.'); }
  async function createSeries(event: React.FormEvent) { event.preventDefault(); setSaving(true); setError(''); const response = await request('/api/admin/series', { method: 'POST', body: JSON.stringify({ title }) }); const body = await response.json(); setSaving(false); if (!response.ok) return setError(body.error); navigate(`/admin/series/${body.id}`); }
  async function changeStatus(item: SeriesItem, status: string) {
    setSaving(true); setError(''); setNotice('');
    const response = await request(`/api/admin/series/${item.id}`, { method: 'PATCH', body: JSON.stringify({ ...item, status }) });
    const body = await response.json(); setSaving(false);
    if (!response.ok) return setError(body.error);
    setNotice(status === 'ARCHIVED' ? 'Série arquivada.' : status === 'DRAFT' ? 'Série despublicada.' : 'Série restaurada como rascunho.');
    await load();
  }
  async function deleteSeries(item: SeriesItem) {
    const confirmation = window.prompt(`Esta ação apaga a série e suas ${item._count.messages} mensagens permanentemente.\n\nDigite exatamente: ${item.title}`);
    if (confirmation === null) return;
    setSaving(true); setError(''); setNotice('');
    const response = await request(`/api/admin/series/${item.id}`, { method: 'DELETE', body: JSON.stringify({ confirmation }) });
    const body = await response.json(); setSaving(false);
    if (!response.ok) return setError(body.error);
    setNotice('Série excluída permanentemente.'); await load();
  }

  const visible = series.filter(item => showArchived ? item.status === 'ARCHIVED' : item.status !== 'ARCHIVED');
  return <main className="min-h-screen bg-stone-950 text-stone-100">
    <Helmet><title>Séries — Central Administrativa IBO</title></Helmet>
    <header className="border-b border-stone-800 bg-stone-900"><div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-5"><Link to="/admin" className="rounded-lg p-2 hover:bg-stone-800"><ArrowLeft className="h-5 w-5" /></Link><div><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-500">Central Administrativa</p><h1 className="font-serif text-2xl font-bold">Séries e mensagens</h1></div></div></header>
    <section className="mx-auto max-w-6xl px-5 py-8">
      {error && <p className="mb-5 rounded-xl border border-red-800 bg-red-950/50 p-3 text-sm text-red-200">{error}</p>}
      {notice && <p className="mb-5 rounded-xl border border-emerald-800 bg-emerald-950/40 p-3 text-sm text-emerald-200">{notice}</p>}
      <form onSubmit={createSeries} className="mb-8 flex flex-col gap-3 rounded-2xl border border-stone-800 bg-stone-900 p-5 sm:flex-row"><input required value={title} onChange={event => setTitle(event.target.value)} placeholder="Nome da nova série" className="flex-1 rounded-xl border border-stone-700 bg-stone-950 px-4 py-3" /><button disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 font-bold text-stone-950"><Plus className="h-4 w-4" />{saving ? 'Aguarde...' : 'Criar série'}</button></form>
      <div className="mb-5 flex gap-2"><button onClick={() => setShowArchived(false)} className={`rounded-lg px-4 py-2 text-sm ${!showArchived ? 'bg-amber-600 font-bold text-stone-950' : 'bg-stone-800 text-stone-300'}`}>Ativas</button><button onClick={() => setShowArchived(true)} className={`rounded-lg px-4 py-2 text-sm ${showArchived ? 'bg-amber-600 font-bold text-stone-950' : 'bg-stone-800 text-stone-300'}`}>Arquivadas</button></div>
      {visible.length === 0 ? <p className="rounded-2xl border border-stone-800 bg-stone-900 p-8 text-center text-stone-500">Nenhuma série nesta seção.</p> : <div className="grid gap-4 md:grid-cols-2">{visible.map(item => <article key={item.id} className="rounded-2xl border border-stone-800 bg-stone-900 p-5"><Link to={`/admin/series/${item.id}`} className="block hover:text-amber-300"><div className="flex items-start justify-between gap-3"><BookOpen className="h-7 w-7 text-amber-500" /><span className="rounded-full bg-stone-800 px-3 py-1 text-xs">{item.status}</span></div><h2 className="mt-4 font-serif text-xl font-bold">{item.title}</h2><p className="mt-1 text-sm text-stone-500">{item._count.messages} mensagem(ns) · /{item.slug}</p></Link><div className="mt-5 flex flex-wrap gap-2 border-t border-stone-800 pt-4">{item.status === 'ARCHIVED' ? <><button disabled={saving} onClick={() => void changeStatus(item, 'DRAFT')} className="flex items-center gap-2 rounded-lg bg-stone-800 px-3 py-2 text-sm hover:bg-stone-700"><RotateCcw className="h-4 w-4" />Restaurar</button><button disabled={saving} onClick={() => void deleteSeries(item)} className="ml-auto flex items-center gap-2 rounded-lg border border-red-800 px-3 py-2 text-sm text-red-300 hover:bg-red-950"><Trash2 className="h-4 w-4" />Excluir permanentemente</button></> : <><button disabled={saving || item.status === 'DRAFT'} onClick={() => void changeStatus(item, 'DRAFT')} className="flex items-center gap-2 rounded-lg bg-stone-800 px-3 py-2 text-sm hover:bg-stone-700 disabled:opacity-40"><EyeOff className="h-4 w-4" />Despublicar</button><button disabled={saving} onClick={() => void changeStatus(item, 'ARCHIVED')} className="flex items-center gap-2 rounded-lg bg-stone-800 px-3 py-2 text-sm hover:bg-stone-700"><Archive className="h-4 w-4" />Arquivar</button></>}</div></article>)}</div>}
    </section>
  </main>;
}
