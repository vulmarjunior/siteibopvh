import { ArrowLeft, CalendarDays, ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { getAdminAccessToken } from '../../lib/admin/session';

export default function AdminSeriesPreviewPage() {
  const { id = '' } = useParams();
  const [series, setSeries] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getAdminAccessToken()
      .then((token) => fetch(`/api/admin/series/${id}`, { headers: { Authorization: `Bearer ${token}` } }))
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error || 'Não foi possível carregar a série.');
        if (active) setSeries(body);
      })
      .catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar a série.'); });
    return () => { active = false; };
  }, [id]);

  if (error) return <main className="min-h-screen bg-stone-950 p-8 text-red-200">{error}</main>;
  if (!series) return <main className="min-h-screen bg-stone-950 p-8 text-stone-300">Carregando visualização…</main>;

  return <main className="min-h-screen bg-stone-100 text-stone-900">
    <Helmet><title>Visualização — {series.title}</title></Helmet>
    <header className="border-b border-amber-200 bg-amber-50 px-5 py-4">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><Link to={`/admin/series/${id}`} className="rounded-lg border border-amber-300 p-2" aria-label="Voltar ao editor"><ArrowLeft className="h-5 w-5" /></Link><div><p className="text-xs font-bold uppercase tracking-widest text-amber-800">Visualização editorial protegida</p><p className="text-sm text-stone-600">Status atual: {series.status}</p></div></div>
        {series.slug === 'da-ascensao-a-parousia' && <Link to="/da-ascensao-a-parousia" target="_blank" className="flex items-center gap-2 rounded-lg bg-stone-900 px-4 py-2 text-sm font-bold text-white"><ExternalLink className="h-4 w-4" />Ver hotsite</Link>}
      </div>
    </header>
    <article className="mx-auto max-w-5xl px-5 py-12">
      <p className="text-sm font-bold uppercase tracking-[.2em] text-amber-700">Série de mensagens</p>
      <h1 className="mt-3 font-serif text-4xl font-bold md:text-5xl">{series.title}</h1>
      {series.subtitle && <p className="mt-3 text-xl text-stone-600">{series.subtitle}</p>}
      {series.description && <p className="mt-6 max-w-3xl leading-7 text-stone-700">{series.description}</p>}
      <section className="mt-12" aria-labelledby="preview-messages"><h2 id="preview-messages" className="font-serif text-2xl font-bold">Mensagens cadastradas</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">{series.messages?.length ? series.messages.map((message: any) => <section key={message.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-wider text-amber-700">Mensagem {String(message.order).padStart(2, '0')}</span><span className="rounded-full bg-stone-100 px-3 py-1 text-xs">{message.status}</span></div><h3 className="mt-3 font-serif text-xl font-bold">{message.title}</h3><p className="mt-2 flex items-center gap-2 text-sm text-stone-500"><CalendarDays className="h-4 w-4" />{new Date(message.scheduledFor).toLocaleDateString('pt-BR')} · {message.biblicalText}</p>{message.summary && <p className="mt-4 text-sm leading-6 text-stone-600">{message.summary}</p>}</section>) : <p className="mt-5 rounded-2xl border border-dashed border-stone-300 p-8 text-center text-stone-500">Nenhuma mensagem cadastrada nesta série.</p>}</div>
      </section>
    </article>
  </main>;
}
