import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpenCheck, Loader2, Plus } from 'lucide-react';
import {
  AdminEbdPageHeader,
  EbdFeedback,
  EbdStatusBadge,
  formatEbdDate,
} from '../../components/admin/ebd/AdminEbdUi';
import { ebdAdminRequest } from '../../lib/ebd/adminApi';
import type { EbdAdminQuarterDetail, EbdAdminQuarterSummary } from '../../types/ebd-admin';

const now = new Date();

export default function AdminEbdPage() {
  const navigate = useNavigate();
  const [quarters, setQuarters] = useState<EbdAdminQuarterSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    year: String(now.getFullYear()),
    quarter: String(Math.floor(now.getMonth() / 3) + 1),
    className: 'Adultos',
    publisher: 'Convenção Batista Fluminense',
    title: 'Revista de Jovens e Adultos',
    issue: '',
    volume: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await ebdAdminRequest<{ quarters: EbdAdminQuarterSummary[] }>('/quarters');
      setQuarters(data.quarters);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os trimestres.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createQuarter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setError('');
    setNotice('');
    try {
      const data = await ebdAdminRequest<{ quarter: EbdAdminQuarterDetail }>('/quarters', {
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
      setNotice('Trimestre criado como rascunho. Agora envie o PDF e importe o JSON.');
      navigate(`/admin/ebd/${data.quarter.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar o trimestre.');
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
        subtitle="Trimestres, PDFs e lições da Escola Bíblica Dominical"
        actions={
          <Link
            to="/ebd"
            className="rounded-lg border border-white/30 px-3 py-2 text-xs font-bold text-white hover:bg-white/10"
            target="_blank"
            rel="noreferrer"
          >
            Abrir área pública
          </Link>
        }
      />

      <section className="mx-auto max-w-7xl p-5">
        <EbdFeedback error={error} notice={notice} />

        <div className="grid gap-5 lg:grid-cols-[22rem_minmax(0,1fr)] lg:items-start">
          <form onSubmit={createQuarter} className="rounded-2xl bg-white p-5 shadow">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
              <Plus className="h-5 w-5 text-amber-600" aria-hidden="true" />
              Novo trimestre
            </h2>
            <p className="mt-1 text-xs text-stone-500">Crie o trimestre como rascunho e depois envie o PDF e o JSON.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-bold text-stone-600">
                Ano
                <input
                  type="number"
                  min={1900}
                  max={2100}
                  required
                  value={form.year}
                  onChange={(event) => setForm({ ...form, year: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 font-normal"
                />
              </label>
              <label className="text-sm font-bold text-stone-600">
                Trimestre
                <select
                  value={form.quarter}
                  onChange={(event) => setForm({ ...form, quarter: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 font-normal"
                >
                  <option value="1">1º</option>
                  <option value="2">2º</option>
                  <option value="3">3º</option>
                  <option value="4">4º</option>
                </select>
              </label>
            </div>

            <label className="mt-3 block text-sm font-bold text-stone-600">
              Turma
              <input
                required
                value={form.className}
                onChange={(event) => setForm({ ...form, className: event.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 font-normal"
              />
            </label>
            <label className="mt-3 block text-sm font-bold text-stone-600">
              Editora
              <input
                required
                value={form.publisher}
                onChange={(event) => setForm({ ...form, publisher: event.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 font-normal"
              />
            </label>
            <label className="mt-3 block text-sm font-bold text-stone-600">
              Título da revista
              <input
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 font-normal"
              />
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-bold text-stone-600">
                Edição
                <input
                  type="number"
                  min={1}
                  value={form.issue}
                  onChange={(event) => setForm({ ...form, issue: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 font-normal"
                />
              </label>
              <label className="text-sm font-bold text-stone-600">
                Volume
                <input
                  type="number"
                  min={1}
                  value={form.volume}
                  onChange={(event) => setForm({ ...form, volume: event.target.value })}
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 font-normal"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
              Criar trimestre
            </button>
          </form>

          <div className="rounded-2xl bg-white p-5 shadow">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-bold">Trimestres cadastrados</h2>
              <span className="text-xs text-stone-500">{quarters.length} registro(s)</span>
            </div>

            {loading ? (
              <div className="grid place-items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" aria-label="Carregando trimestres" />
              </div>
            ) : quarters.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-stone-300 p-8 text-center text-sm text-stone-500">
                <BookOpenCheck className="mx-auto mb-3 h-8 w-8 text-amber-600" aria-hidden="true" />
                Nenhum trimestre cadastrado. Crie o primeiro ao lado.
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[52rem] text-left text-sm">
                  <thead>
                    <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
                      <th className="p-2">Trimestre</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Lições</th>
                      <th className="p-2">PDF</th>
                      <th className="p-2">Atualizado</th>
                      <th className="p-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {quarters.map((quarter) => (
                      <tr key={quarter.id} className="border-b border-stone-100 align-top">
                        <td className="p-2">
                          <strong className="block font-serif text-base">
                            {quarter.quarter}º trimestre de {quarter.year} — {quarter.className}
                          </strong>
                          <span className="text-xs text-stone-500">{quarter.title}</span>
                        </td>
                        <td className="p-2">
                          <EbdStatusBadge status={quarter.status} />
                          {quarter.publishedAt ? (
                            <span className="mt-1 block text-[0.68rem] text-stone-500">
                              {formatEbdDate(quarter.publishedAt)}
                            </span>
                          ) : null}
                        </td>
                        <td className="p-2 text-xs">
                          {quarter.publishedLessonCount}/{quarter.lessonCount} publicadas
                        </td>
                        <td className="p-2 text-xs">
                          {quarter.pdfAssetCount > 0 ? `v${quarter.latestPdfVersion} (${quarter.pdfAssetCount})` : '—'}
                        </td>
                        <td className="p-2 text-xs text-stone-500">{formatEbdDate(quarter.updatedAt)}</td>
                        <td className="p-2 text-right">
                          <Link
                            to={`/admin/ebd/${quarter.id}`}
                            className="inline-flex min-h-9 items-center rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800"
                          >
                            Gerenciar
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
