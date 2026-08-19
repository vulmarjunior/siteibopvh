import { ArrowLeft, ExternalLink, Plus, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { AdminMessageEditorModal, type EditorialMessageForm } from '../../components/admin/AdminMessageEditorModal';
import { getAdminAccessToken } from '../../lib/admin/session';

const firstReading = { dayLabel: 'Segunda', biblicalText: '', description: '' };
const emptyMessage = (order: number): EditorialMessageForm => ({ order, title: '', slug: '', scheduledFor: '', biblicalText: '', speaker: '', summary: '', contentHtml: '', status: 'DRAFT', videoUrl: '', audioUrl: '', materialTitle: '', materialUrl: '', readingTheme: '', readingDays: [firstReading], sourceSystem: '', externalId: '' });
const toLocalDate = (value?: string) => value ? new Date(value).toISOString().slice(0, 16) : '';
const input = 'mt-1 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm';

export default function AdminSeriesEditorModalPage() {
  const { id = '' } = useParams();
  const [series, setSeries] = useState<any>(null);
  const [editing, setEditing] = useState<EditorialMessageForm | null>(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => { void load(); }, [id]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function request(url: string, init?: RequestInit) { const token = await getAdminAccessToken(); return fetch(url, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init?.headers } }); }
  async function load() { const response = await request(`/api/admin/series/${id}`); if (response.ok) setSeries(await response.json()); }
  async function saveSeries() {
    setSaving(true);
    try {
      const payload = {
        title: series.title,
        slug: series.slug,
        subtitle: series.subtitle,
        description: series.description,
        startsAt: series.startsAt,
        endsAt: series.endsAt,
        status: series.status,
        defaultThumbnailUrl: series.defaultThumbnailUrl,
        capabilities: series.capabilities,
      };
      const response = await request(`/api/admin/series/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      const body = await response.json().catch(() => ({}));
      setNotice(response.ok ? 'Série salva.' : body.error || `Não foi possível salvar a série (${response.status}).`);
      if (response.ok) void load();
    } catch {
      setNotice('Não foi possível salvar a série. Verifique a conexão e tente novamente.');
    } finally {
      setSaving(false);
    }
  }
  function editMessage(item: any): EditorialMessageForm {
    const video = item.media?.find((media: any) => media.type === 'VIDEO');
    const audio = item.media?.find((media: any) => media.type === 'AUDIO');
    const image = item.media?.find((media: any) => media.type === 'IMAGE');
    const material = item.materials?.[0];
    return {
      id: item.id, order: item.order, title: item.title, slug: item.slug,
      scheduledFor: toLocalDate(item.scheduledFor), biblicalText: item.biblicalText,
      speaker: item.speaker || '', summary: item.summary || '', contentHtml: item.contentHtml || '',
      status: item.status, videoUrl: video?.url || '', audioUrl: audio?.url || '',
      materialTitle: material?.title || '', materialUrl: material?.url || '',
      thumbnailUrl: item.thumbnailUrl || image?.url || '',
      readingTheme: item.readingPlan?.theme || '',
      readingDays: item.readingPlan?.days?.map((day: any) => ({ dayLabel: day.dayLabel, biblicalText: day.biblicalText, description: day.description || '' })) || [firstReading],
      sourceSystem: item.sourceSystem || '', externalId: item.externalId || ''
    };
  }
  async function saveMessage(event: React.FormEvent, contentHtml: string) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    const submitted = { ...editing, contentHtml };
    const url = editing.id ? `/api/admin/series/${id}/messages/${editing.id}` : `/api/admin/series/${id}/messages`;
    const response = await request(url, { method: editing.id ? 'PUT' : 'POST', body: JSON.stringify(submitted) });
    const body = await response.json();
    setSaving(false);
    if (!response.ok) { setNotice(body.error || 'Não foi possível salvar a mensagem.'); return; }
    if (contentHtml && !body.contentHtml) {
      setNotice('O servidor não confirmou o texto. O editor permanecerá aberto para você não perder o conteúdo.');
      return;
    }
    setNotice(contentHtml ? 'Mensagem e texto salvos.' : 'Mensagem salva.');
    setEditing(null);
    void load();
  }
  if (!series) return <main className="min-h-screen bg-stone-950 p-8 text-stone-300">Carregando...</main>;

  return <main className="min-h-screen bg-stone-950 text-stone-100">
    <Helmet><title>{series.title} — Editor de séries</title></Helmet>
    <header className="border-b border-stone-800 bg-stone-900"><div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-5"><Link to="/admin/series" className="p-2"><ArrowLeft className="h-5 w-5" /></Link><div><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-500">Editor de séries</p><h1 className="font-serif text-2xl font-bold">{series.title}</h1></div></div></header>
    <section className="mx-auto max-w-6xl space-y-6 px-5 py-8">
      {notice && <div role="status" aria-live="polite" className={`fixed right-4 top-4 z-[70] max-w-sm rounded-xl border px-5 py-4 text-sm font-medium shadow-2xl ${/não|erro|servidor/i.test(notice) ? 'border-red-500/40 bg-red-950 text-red-100' : 'border-emerald-500/40 bg-emerald-950 text-emerald-100'}`}>{notice}</div>}
      <section className="rounded-2xl border border-stone-800 bg-stone-900 p-5"><h2 className="mb-4 font-serif text-xl font-bold">Dados da série</h2><div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">Título<input className={input} value={series.title} onChange={event => setSeries({ ...series, title: event.target.value })} /></label><label className="text-sm">Endereço<input className={input} value={series.slug} onChange={event => setSeries({ ...series, slug: event.target.value })} /></label>
        <label className="text-sm md:col-span-2">Subtítulo<input className={input} value={series.subtitle || ''} onChange={event => setSeries({ ...series, subtitle: event.target.value })} /></label><label className="text-sm md:col-span-2">Descrição<textarea className={input} rows={3} value={series.description || ''} onChange={event => setSeries({ ...series, description: event.target.value })} /></label>
        <label className="text-sm">Início<input type="datetime-local" className={input} value={toLocalDate(series.startsAt)} onChange={event => setSeries({ ...series, startsAt: event.target.value })} /></label><label className="text-sm">Encerramento<input type="datetime-local" className={input} value={toLocalDate(series.endsAt)} onChange={event => setSeries({ ...series, endsAt: event.target.value })} /></label>
        <label className="text-sm">Status<select className={input} value={series.status} onChange={event => setSeries({ ...series, status: event.target.value })}><option value="DRAFT">Rascunho</option><option value="SCHEDULED">Agendada</option><option value="PUBLISHED">Publicada</option><option value="ENDED">Encerrada</option><option value="ARCHIVED">Arquivada</option></select></label><label className="text-sm">Thumbnail padrão<input className={input} value={series.defaultThumbnailUrl || ''} onChange={event => setSeries({ ...series, defaultThumbnailUrl: event.target.value })} /></label>
      </div><fieldset className="mt-5"><legend className="mb-2 text-sm font-bold">Recursos utilizados</legend><div className="flex flex-wrap gap-4 text-sm">{[['video', 'Vídeo'], ['audio', 'Áudio'], ['materials', 'Materiais'], ['readingPlan', 'Plano de leitura'], ['sections', 'Seções']].map(([key, label]) => <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={Boolean(series.capabilities?.[key])} onChange={event => setSeries({ ...series, capabilities: { ...series.capabilities, [key]: event.target.checked } })} />{label}</label>)}</div></fieldset><div className="mt-5 flex flex-wrap gap-3"><button onClick={() => void saveSeries()} disabled={saving} className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 font-bold text-stone-950 disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Salvando…' : 'Salvar série'}</button><Link to={`/admin/series/${id}/preview`} target="_blank" className="flex items-center gap-2 rounded-xl border border-stone-700 px-4 py-2 hover:bg-stone-800"><ExternalLink className="h-4 w-4" />Visualizar conteúdo</Link>{series.slug === 'da-ascensao-a-parousia' && <Link to="/da-ascensao-a-parousia" target="_blank" className="flex items-center gap-2 rounded-xl border border-amber-700 px-4 py-2 text-amber-300 hover:bg-stone-800"><ExternalLink className="h-4 w-4" />Ver hotsite</Link>}</div></section>
      <section className="rounded-2xl border border-stone-800 bg-stone-900 p-5"><div className="flex items-center justify-between gap-4"><div><h2 className="font-serif text-xl font-bold">Programação</h2><p className="text-sm text-stone-500">Selecione uma mensagem para editá-la sem sair da lista.</p></div><button onClick={() => setEditing(emptyMessage((series.messages?.length || 0) + 1))} className="flex shrink-0 items-center gap-2 rounded-xl bg-stone-800 px-4 py-2 text-sm"><Plus className="h-4 w-4" />Mensagem</button></div><div className="mt-5 space-y-3">{series.messages.map((item: any) => <button key={item.id} onClick={() => setEditing(editMessage(item))} className="flex w-full items-center justify-between rounded-xl border border-stone-800 bg-stone-950 p-4 text-left hover:border-amber-700"><div><strong>{String(item.order).padStart(2, '0')} · {item.title}</strong><p className="mt-1 text-xs text-stone-500">{new Date(item.scheduledFor).toLocaleDateString('pt-BR')} · {item.biblicalText}</p></div><span className="text-xs text-amber-400">{item.status}</span></button>)}</div></section>
    </section>
    {editing && <AdminMessageEditorModal value={editing} saving={saving} onChange={setEditing} onClose={() => setEditing(null)} onSubmit={saveMessage} />}
  </main>;
}
