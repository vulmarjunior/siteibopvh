import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, Download, Loader2, Pencil, Plus, Save, Settings, Shield, Trash2, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getAdminAccessToken } from '../../lib/admin/session';

type Reservation = { id: number; date: string; timeStart: string; timeEnd: string; name: string; email: string; prayerThemes: string | null; personalRequest?: string | null; reservedAt: string };
type Theme = { id: number; label: string; active: boolean; order: number };
type Config = { key: string; value: string };

function localDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseThemes(value: string | null): string[] {
  try { const parsed = JSON.parse(value || '[]'); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; }
}

export default function AdminPrayerPage() {
  const [tab, setTab] = useState<'reservations' | 'settings'>('reservations');
  const [date, setDate] = useState(localDate(new Date()));
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);
  const [canReadPersonalRequests, setCanReadPersonalRequests] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [newTheme, setNewTheme] = useState('');
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (path: string, init?: RequestInit) => {
    const token = await getAdminAccessToken();
    const response = await fetch(`/api/admin/prayer${path}`, { ...init, headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers || {}), Authorization: `Bearer ${token}` } });
    if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || 'Não foi possível concluir a operação.'); }
    return response;
  }, []);

  const loadReservations = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const payload = await (await request(`/reservations?date=${date}`)).json();
      setReservations(payload.reservations);
      setCanReadPersonalRequests(Boolean(payload.permissions?.canReadPersonalRequests));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao carregar reservas.'); }
    finally { setLoading(false); }
  }, [date, request]);

  const loadSettings = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [themeResponse, configResponse] = await Promise.all([request('/themes'), request('/config')]);
      setThemes(await themeResponse.json()); setConfigs(await configResponse.json());
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao carregar configurações.'); }
    finally { setLoading(false); }
  }, [request]);

  useEffect(() => { if (tab === 'reservations') void loadReservations(); else void loadSettings(); }, [tab, loadReservations, loadSettings]);

  async function saveReservation() {
    if (!editing) return;
    try {
      await request(`/reservations/${editing.id}`, { method: 'PATCH', body: JSON.stringify({ ...editing, prayerThemes: parseThemes(editing.prayerThemes) }) });
      setEditing(null); setNotice('Reserva atualizada com sucesso.'); await loadReservations();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao atualizar reserva.'); }
  }

  async function deleteReservation(item: Reservation) {
    if (!confirm(`Excluir a reserva de ${item.name}, em ${item.date} às ${item.timeStart}?`)) return;
    try { await request(`/reservations/${item.id}`, { method: 'DELETE' }); setNotice('Reserva excluída com sucesso.'); await loadReservations(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao excluir reserva.'); }
  }

  async function exportCsv() {
    try {
      const response = await request('/export.csv'); const blob = await response.blob(); const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'reservas_relogio.csv'; anchor.click(); URL.revokeObjectURL(url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao exportar reservas.'); }
  }

  async function addTheme() {
    if (!newTheme.trim()) return;
    try { await request('/themes', { method: 'POST', body: JSON.stringify({ label: newTheme }) }); setNewTheme(''); setNotice('Tema criado com sucesso.'); await loadSettings(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao criar tema.'); }
  }

  async function updateTheme(theme: Theme, changes: Partial<Theme>) {
    try { await request(`/themes/${theme.id}`, { method: 'PATCH', body: JSON.stringify(changes) }); setNotice('Tema atualizado com sucesso.'); await loadSettings(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao atualizar tema.'); }
  }

  async function deleteTheme(theme: Theme) {
    if (!confirm(`Excluir o tema “${theme.label}”?`)) return;
    try { await request(`/themes/${theme.id}`, { method: 'DELETE' }); setNotice('Tema excluído com sucesso.'); await loadSettings(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao excluir tema.'); }
  }

  async function saveConfig(config: Config) {
    try { await request(`/config/${encodeURIComponent(config.key)}`, { method: 'PUT', body: JSON.stringify({ value: config.value }) }); setNotice('Configuração salva com sucesso.'); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao salvar configuração.'); }
  }

  return <main className="min-h-screen bg-stone-950 text-stone-100">
    <Helmet><title>Relógio de Oração — Central Administrativa</title></Helmet>
    <header className="border-b border-stone-800 bg-stone-900"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5"><div className="flex items-center gap-4"><Link to="/admin" className="rounded-lg border border-stone-700 p-2 hover:bg-stone-800" aria-label="Voltar"><ArrowLeft className="h-5 w-5" /></Link><div><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-500">Central Administrativa</p><h1 className="font-serif text-2xl font-bold">Relógio de Oração</h1></div></div><button onClick={() => void exportCsv()} className="flex items-center gap-2 rounded-xl border border-stone-700 px-4 py-2 text-sm hover:bg-stone-800"><Download className="h-4 w-4" /> Exportar CSV</button></div></header>
    <section className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex gap-2"><button onClick={() => setTab('reservations')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${tab === 'reservations' ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-stone-300'}`}><CalendarDays className="h-4 w-4" />Reservas</button><button onClick={() => setTab('settings')} className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${tab === 'settings' ? 'bg-amber-500 text-stone-950' : 'bg-stone-900 text-stone-300'}`}><Settings className="h-4 w-4" />Configurações</button></div>
      {notice && <div className="mb-5 rounded-xl border border-emerald-800 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300">{notice}</div>}
      {error && <div className="mb-5 rounded-xl border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">{error}</div>}
      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div> : tab === 'reservations' ? <>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4"><label className="text-sm text-stone-400">Data<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 block rounded-xl border border-stone-700 bg-stone-900 px-4 py-2 text-stone-100" /></label><div className="flex items-center gap-2 text-xs text-stone-500"><Shield className="h-4 w-4" />{canReadPersonalRequests ? 'Acesso autorizado a pedidos pessoais' : 'Pedidos pessoais protegidos para este perfil'}</div></div>
        <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900">{reservations.length === 0 ? <p className="p-10 text-center text-stone-500">Nenhuma reserva nesta data.</p> : reservations.map((item) => <article key={item.id} className="border-b border-stone-800 p-5 last:border-0"><div className="flex flex-wrap justify-between gap-4"><div><p className="font-bold text-amber-500">{item.timeStart} – {item.timeEnd}</p><h2 className="mt-1 text-lg font-bold">{item.name}</h2><p className="text-sm text-stone-400">{item.email}</p>{parseThemes(item.prayerThemes).length > 0 && <p className="mt-2 text-sm text-stone-300">Temas: {parseThemes(item.prayerThemes).join(', ')}</p>}{canReadPersonalRequests && item.personalRequest && <div className="mt-3 rounded-xl border border-stone-700 bg-stone-950 p-3 text-sm"><strong>Pedido pessoal:</strong> {item.personalRequest}</div>}</div><div className="flex gap-2"><button onClick={() => setEditing(item)} className="rounded-lg border border-stone-700 p-2 hover:bg-stone-800" aria-label={`Editar reserva de ${item.name}`}><Pencil className="h-4 w-4" /></button><button onClick={() => void deleteReservation(item)} className="rounded-lg border border-red-900 p-2 text-red-400 hover:bg-red-950" aria-label={`Excluir reserva de ${item.name}`}><Trash2 className="h-4 w-4" /></button></div></div></article>)}</div>
      </> : <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-stone-800 bg-stone-900 p-5"><h2 className="font-serif text-xl font-bold">Temas de oração</h2><div className="mt-4 flex gap-2"><input value={newTheme} onChange={(event) => setNewTheme(event.target.value)} placeholder="Novo tema" className="min-w-0 flex-1 rounded-xl border border-stone-700 bg-stone-950 px-4 py-2" /><button onClick={() => void addTheme()} className="rounded-xl bg-amber-500 px-4 text-stone-950"><Plus className="h-5 w-5" /></button></div><div className="mt-4 space-y-2">{themes.map((theme) => <div key={theme.id} className="flex items-center gap-3 rounded-xl border border-stone-800 p-3"><input value={theme.label} onChange={(event) => setThemes((current) => current.map((item) => item.id === theme.id ? { ...item, label: event.target.value } : item))} className="min-w-0 flex-1 bg-transparent" /><button onClick={() => void updateTheme(theme, { label: theme.label })} aria-label="Salvar tema"><Save className="h-4 w-4 text-amber-500" /></button><button onClick={() => void updateTheme(theme, { active: !theme.active })} className={`rounded-full px-2 py-1 text-xs ${theme.active ? 'bg-emerald-950 text-emerald-300' : 'bg-stone-800 text-stone-400'}`}>{theme.active ? 'Ativo' : 'Inativo'}</button><button onClick={() => void deleteTheme(theme)} aria-label="Excluir tema"><Trash2 className="h-4 w-4 text-red-400" /></button></div>)}</div></section><section className="rounded-2xl border border-stone-800 bg-stone-900 p-5"><h2 className="font-serif text-xl font-bold">Parâmetros</h2><div className="mt-4 space-y-4">{configs.map((config) => <label key={config.key} className="block text-sm text-stone-400">{config.key}<div className="mt-1 flex gap-2"><input value={config.value} onChange={(event) => setConfigs((current) => current.map((item) => item.key === config.key ? { ...item, value: event.target.value } : item))} className="min-w-0 flex-1 rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-stone-100" /><button onClick={() => void saveConfig(config)} className="rounded-xl border border-stone-700 px-3 hover:bg-stone-800" aria-label={`Salvar ${config.key}`}><Save className="h-4 w-4" /></button></div></label>)}</div></section></div>}
    </section>
    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-xl rounded-2xl border border-stone-700 bg-stone-900 p-6"><div className="flex items-center justify-between"><h2 className="font-serif text-xl font-bold">Editar reserva</h2><button onClick={() => setEditing(null)} aria-label="Fechar"><X className="h-5 w-5" /></button></div><div className="mt-5 space-y-4"><label className="block text-sm text-stone-400">Nome<input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-stone-100" /></label><label className="block text-sm text-stone-400">E-mail<input type="email" value={editing.email} onChange={(event) => setEditing({ ...editing, email: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-stone-100" /></label><label className="block text-sm text-stone-400">Temas (separados por vírgula)<input value={parseThemes(editing.prayerThemes).join(', ')} onChange={(event) => setEditing({ ...editing, prayerThemes: JSON.stringify(event.target.value.split(',').map((value) => value.trim()).filter(Boolean)) })} className="mt-1 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-stone-100" /></label>{canReadPersonalRequests && <label className="block text-sm text-stone-400">Pedido pessoal<textarea value={editing.personalRequest || ''} onChange={(event) => setEditing({ ...editing, personalRequest: event.target.value })} rows={4} className="mt-1 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-stone-100" /></label>}<button onClick={() => void saveReservation()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 font-bold text-stone-950"><Save className="h-4 w-4" />Salvar alterações</button></div></div></div>}
  </main>;
}
