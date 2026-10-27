import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpenCheck, Loader2, Plus } from 'lucide-react';
import {
  AdminEbdPageHeader,
  EbdFeedback,
  formatEbdDate,
} from '../../components/admin/ebd/AdminEbdUi';
import { ebdAdminRequest } from '../../lib/ebd/adminApi';
import { editionLabel } from '../../lib/ebd/content';
import type { EbdAdminEditionSummary } from '../../types/ebd-admin';

const now = new Date();

export default function AdminEbdPage() {
  const navigate = useNavigate();
  const [editions, setEditions] = useState<EbdAdminEditionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    year: String(now.getFullYear()),
    quarter: String(Math.floor(now.getMonth() / 3) + 1),
    className: 'Adultos',
    publisher: 'Editora Cristã Evangélica',
    title: '',
    issue: '',
    volume: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ebdAdminRequest<{ editions: EbdAdminEditionSummary[] }>('/editions');
      setEditions(data.editions);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar as edições.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createEdition(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError('');
    setNotice('');
    try {
      const created = await ebdAdminRequest<{ edition: EbdAdminEditionSummary }>('/editions', {
        method: 'POST',
        body: JSON.stringify({
          year: Number(form.year),
          quarter: Number(form.quarter),
          className: form.className,
          publisher: form.publisher,
          title: form.title,
          issue: form.issue ? Number(form.issue) : null,
          volume: form.volume ? Number(form.volume) : null,
        }),
      });
      setNotice('Edição cadastrada. Envie o PDF e importe o JSON das lições.');
      setForm((current) => ({ ...current, title: '', issue: '', volume: '' }));
      navigate(`/admin/ebd/${created.edition.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar a edição.');
    } finally {
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <Helmet>
        <title>EBD Digital — Central Administrativa</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AdminEbdPageHeader
        title="EBD Digital"
        subtitle="Edições, ciclos de estudo e agenda das lições"
        actions={
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border border-white/30 px-3 py-2 text-xs font-bold uppercase tracking-wide"
          >
            Atualizar
          </button>
        }
      />

      <section className="mx-auto max-w-7xl px-5 py-8">
        <EbdFeedback error={error} notice={notice} />

        <div className="grid gap-6 lg:grid-cols-[22rem_minmax(0,1fr)]">
          <form onSubmit={createEdition} className="h-fit rounded-2xl bg-white p-5 shadow">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
              <Plus className="h-5 w-5 text-amber-600" aria-hidden="true" />
              Nova edição
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              A edição é a revista: editora, ano, trimestre editorial e turma. O ciclo de estudo é criado
              depois, na página da edição.
            </p>

            <div className="mt-4 grid gap-3">
              <label className="text-sm font-semibold">
                Editora
                <input
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                  value={form.publisher}
                  onChange={(event) => setForm((current) => ({ ...current, publisher: event.target.value }))}
                  required
                />
              </label>
              <label className="text-sm font-semibold">
                Título da revista
                <input
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold">
                  Ano editorial
                  <input
                    type="number"
                    min={1900}
                    max={2100}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                    value={form.year}
                    onChange={(event) => setForm((current) => ({ ...current, year: event.target.value }))}
                    required
                  />
                </label>
                <label className="text-sm font-semibold">
                  Trimestre editorial
                  <select
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                    value={form.quarter}
                    onChange={(event) => setForm((current) => ({ ...current, quarter: event.target.value }))}
                  >
                    <option value="1">1º</option>
                    <option value="2">2º</option>
                    <option value="3">3º</option>
                    <option value="4">4º</option>
                  </select>
                </label>
              </div>
              <label className="text-sm font-semibold">
                Turma
                <input
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                  value={form.className}
                  onChange={(event) => setForm((current) => ({ ...current, className: event.target.value }))}
                  required
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm font-semibold">
                  Edição (nº)
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                    value={form.issue}
                    onChange={(event) => setForm((current) => ({ ...current, issue: event.target.value }))}
                  />
                </label>
                <label className="text-sm font-semibold">
                  Volume
                  <input
                    type="number"
                    min={1}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                    value={form.volume}
                    onChange={(event) => setForm((current) => ({ ...current, volume: event.target.value }))}
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              Cadastrar edição
            </button>
          </form>

          <div className="space-y-4">
            {loading ? (
              <div className="grid place-items-center rounded-2xl bg-white py-16 shadow">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" aria-label="Carregando edições" />
              </div>
            ) : editions.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 shadow">
                <h2 className="font-serif text-xl font-bold">Nenhuma edição cadastrada</h2>
                <p className="mt-2 text-sm text-stone-600">
                  Cadastre a revista ao lado, envie o PDF e importe o JSON das lições extraído do próprio PDF.
                </p>
              </div>
            ) : (
              editions.map((edition) => (
                <article key={edition.id} className="rounded-2xl bg-white p-5 shadow">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                        {editionLabel(edition.year, edition.quarter)} • {edition.className}
                      </p>
                      <h2 className="mt-1 font-serif text-xl font-bold leading-tight">{edition.title}</h2>
                      <p className="mt-1 text-sm text-stone-600">
                        {edition.publisher}
                        {edition.issue ? ` • Edição ${edition.issue}` : ''}
                        {edition.volume ? ` • Volume ${edition.volume}` : ''}
                      </p>
                    </div>
                    <Link
                      to={`/admin/ebd/${edition.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white"
                    >
                      <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
                      Abrir edição
                    </Link>
                  </div>

                  <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                    <div className="rounded-xl bg-stone-100 p-2">
                      <dt className="text-[0.65rem] font-bold uppercase tracking-wide text-stone-500">Lições</dt>
                      <dd className="font-bold">{edition.lessonCount} <span className="font-normal text-stone-500">({edition.publishedLessonCount} publicadas)</span></dd>
                    </div>
                    <div className="rounded-xl bg-stone-100 p-2">
                      <dt className="text-[0.65rem] font-bold uppercase tracking-wide text-stone-500">PDF</dt>
                      <dd className="font-bold">{edition.latestPdfVersion > 0 ? `v${edition.latestPdfVersion}` : 'pendente'}</dd>
                    </div>
                    <div className="rounded-xl bg-stone-100 p-2">
                      <dt className="text-[0.65rem] font-bold uppercase tracking-wide text-stone-500">Ciclos</dt>
                      <dd className="font-bold">{edition.cycleCount} <span className="font-normal text-stone-500">({edition.publishedCycleCount} publicados)</span></dd>
                    </div>
                    <div className="rounded-xl bg-stone-100 p-2">
                      <dt className="text-[0.65rem] font-bold uppercase tracking-wide text-stone-500">Atualizada</dt>
                      <dd className="text-xs font-semibold">{formatEbdDate(edition.updatedAt)}</dd>
                    </div>
                  </dl>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
