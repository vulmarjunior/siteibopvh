import { Mail, RefreshCw, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getAdminAccessToken } from '../../lib/admin/session';

type Series = { id: string; title: string; slug: string };
type Dashboard = {
  series: Series & { emailEnabled: boolean };
  selection: { number: string; title: string; theme: string; days: unknown[] } | null;
  subscribers: { id: number; email: string; name: string | null; active: boolean; subscribedAt: string; unsubscribedAt: string | null }[];
  runs: { id: string; status: string; recipientCount: number; sentCount: number; failedCount: number; startedAt: string; message: { order: number; title: string } }[];
};

export default function AdminSeriesEmailPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [seriesId, setSeriesId] = useState('');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [preview, setPreview] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function request(url: string, init?: RequestInit) {
    const token = await getAdminAccessToken();
    return fetch(url, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init?.headers } });
  }
  async function loadSeries() { const response = await request('/api/admin/series'); if (response.ok) { const rows = await response.json(); setSeries(rows); if (!seriesId && rows[0]) setSeriesId(rows[0].id); } }
  async function loadDashboard() { if (!seriesId) return; const response = await request(`/api/admin/series-email/${seriesId}`); const body = await response.json(); if (response.ok) setDashboard(body); else setNotice(body.error); }
  useEffect(() => { void loadSeries(); }, []);
  useEffect(() => { setPreview(''); void loadDashboard(); }, [seriesId]);

  async function toggleEnabled() { if (!dashboard) return; setBusy(true); const response = await request(`/api/admin/series-email/${seriesId}/config`, { method: 'PATCH', body: JSON.stringify({ emailEnabled: !dashboard.series.emailEnabled }) }); setBusy(false); if (response.ok) { setNotice(!dashboard.series.emailEnabled ? 'Envio semanal habilitado.' : 'Envio semanal desabilitado.'); void loadDashboard(); } }
  async function showPreview() { setBusy(true); const response = await request(`/api/admin/series-email/${seriesId}/preview`); const body = await response.json(); setBusy(false); if (response.ok) setPreview(body.html); else setNotice(body.error); }
  async function sendTest(event: React.FormEvent) { event.preventDefault(); setBusy(true); const response = await request(`/api/admin/series-email/${seriesId}/test`, { method: 'POST', body: JSON.stringify({ email: testEmail }) }); const body = await response.json(); setBusy(false); setNotice(response.ok ? body.message : body.error); }
  async function toggleSubscriber(id: number, active: boolean) { setBusy(true); const response = await request(`/api/admin/series-email/${seriesId}/subscribers/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) }); setBusy(false); if (response.ok) { setNotice(active ? 'Assinante reativado.' : 'Assinante desativado.'); void loadDashboard(); } }

  return <main className="min-h-screen bg-stone-950 px-5 py-8 text-stone-100"><Helmet><title>E-mails — Central Administrativa</title></Helmet><div className="mx-auto max-w-6xl space-y-6">
    <header><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-500">Central Administrativa</p><h1 className="mt-2 flex items-center gap-3 font-serif text-3xl font-bold"><Mail className="text-amber-500" />E-mails das séries</h1></header>
    {notice && <div role="status" className="fixed right-4 top-4 z-50 rounded-xl border border-amber-600/40 bg-stone-900 px-5 py-4 shadow-xl">{notice}</div>}
    <section className="rounded-2xl border border-stone-800 bg-stone-900 p-5"><label className="text-sm">Série<select className="ml-3 rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" value={seriesId} onChange={event => setSeriesId(event.target.value)}>{series.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label></section>
    {dashboard && <>
      <section className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-stone-800 bg-stone-900 p-5"><p className="text-sm text-stone-400">Envio automático</p><p className={`mt-2 font-bold ${dashboard.series.emailEnabled ? 'text-emerald-400' : 'text-stone-500'}`}>{dashboard.series.emailEnabled ? 'Habilitado' : 'Desabilitado'}</p><button disabled={busy} onClick={toggleEnabled} className="mt-4 rounded-lg border border-stone-700 px-3 py-2 text-sm">{dashboard.series.emailEnabled ? 'Desabilitar' : 'Habilitar'}</button></div><div className="rounded-2xl border border-stone-800 bg-stone-900 p-5"><p className="text-sm text-stone-400">Assinantes</p><p className="mt-2 text-2xl font-bold">{dashboard.subscribers.filter(item => item.active).length} ativos</p></div><div className="rounded-2xl border border-stone-800 bg-stone-900 p-5"><p className="text-sm text-stone-400">Leitura vigente</p><p className="mt-2 font-bold">{dashboard.selection ? `#${dashboard.selection.number} ${dashboard.selection.title}` : 'Indisponível'}</p></div></section>
      <section className="rounded-2xl border border-stone-800 bg-stone-900 p-5"><div className="flex flex-wrap items-end gap-4"><button disabled={busy} onClick={showPreview} className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 font-bold text-stone-950"><RefreshCw className="h-4 w-4" />Gerar preview</button><form onSubmit={sendTest} className="flex flex-1 flex-wrap items-end gap-2"><label className="min-w-64 flex-1 text-sm">Destinatário do teste<input required type="email" className="mt-1 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2" value={testEmail} onChange={event => setTestEmail(event.target.value)} /></label><button disabled={busy} className="flex items-center gap-2 rounded-xl border border-amber-600 px-4 py-2 text-amber-400"><Send className="h-4 w-4" />Enviar teste</button></form></div>{preview && <iframe title="Preview do e-mail" srcDoc={preview} className="mt-6 h-[700px] w-full rounded-xl bg-white" />}</section>
      <section className="rounded-2xl border border-stone-800 bg-stone-900 p-5"><h2 className="font-serif text-xl font-bold">Assinantes</h2><div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-stone-500"><tr><th className="p-2">Nome</th><th className="p-2">E-mail</th><th className="p-2">Estado</th><th className="p-2"></th></tr></thead><tbody>{dashboard.subscribers.map(item => <tr key={item.id} className="border-t border-stone-800"><td className="p-2">{item.name || '—'}</td><td className="p-2">{item.email}</td><td className="p-2">{item.active ? 'Ativo' : 'Inativo'}</td><td className="p-2 text-right"><button disabled={busy} onClick={() => toggleSubscriber(item.id, !item.active)} className="text-amber-400">{item.active ? 'Desativar' : 'Reativar'}</button></td></tr>)}</tbody></table></div></section>
      <section className="rounded-2xl border border-stone-800 bg-stone-900 p-5"><h2 className="font-serif text-xl font-bold">Últimas execuções</h2><div className="mt-4 space-y-3">{dashboard.runs.length ? dashboard.runs.map(run => <div key={run.id} className="flex flex-wrap justify-between gap-3 rounded-xl border border-stone-800 bg-stone-950 p-4"><div><strong>#{String(run.message.order).padStart(2, '0')} {run.message.title}</strong><p className="text-xs text-stone-500">{new Date(run.startedAt).toLocaleString('pt-BR')}</p></div><span className="text-sm">{run.status} · {run.sentCount} enviados · {run.failedCount} falhas</span></div>) : <p className="text-sm text-stone-500">Nenhuma execução registrada.</p>}</div></section>
    </>}
  </div></main>;
}
