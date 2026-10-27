import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpenCheck, FileJson, Loader2, Plus } from 'lucide-react';
import {
  AdminEbdPageHeader,
  EbdFeedback,
  formatEbdDate,
} from '../../components/admin/ebd/AdminEbdUi';
import { EbdAdminApiError, ebdAdminRequest } from '../../lib/ebd/adminApi';
import { editionLabel } from '../../lib/ebd/content';
import { validateEbdImport, type EbdImportPayload } from '../../lib/ebd/import';
import type { EbdAdminEditionSummary } from '../../types/ebd-admin';

export default function AdminEbdPage() {
  const navigate = useNavigate();
  const [editions, setEditions] = useState<EbdAdminEditionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [creating, setCreating] = useState(false);
  const [jsonName, setJsonName] = useState('');
  const [payload, setPayload] = useState<EbdImportPayload | null>(null);
  const [jsonErrors, setJsonErrors] = useState<string[]>([]);

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

  async function readJson(file: File) {
    setJsonName(file.name);
    setPayload(null);
    setJsonErrors([]);
    setError('');
    setNotice('');
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const validation = validateEbdImport(parsed);
      if (validation.ok === false) {
        setJsonErrors(validation.errors);
        setError('O JSON não segue o esquema de importação v1.0.0.');
        return;
      }
      setPayload(validation.data);
    } catch {
      setError('O arquivo selecionado não é um JSON válido.');
    }
  }

  async function createEdition() {
    if (!payload) return;
    setCreating(true);
    setError('');
    setNotice('');
    setJsonErrors([]);
    try {
      const created = await ebdAdminRequest<{ edition: { id: string } }>('/editions', {
        method: 'POST',
        body: JSON.stringify({ data: payload }),
      });
      setNotice('Edição criada a partir do JSON. Agora envie o PDF e importe as lições.');
      navigate(`/admin/ebd/${created.edition.id}`);
    } catch (cause) {
      if (cause instanceof EbdAdminApiError) setJsonErrors(cause.details);
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

        <div className="grid gap-6 lg:grid-cols-[24rem_minmax(0,1fr)]">
          <article className="h-fit rounded-2xl bg-white p-5 shadow">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
              <FileJson className="h-5 w-5 text-amber-600" aria-hidden="true" />
              Nova edição a partir do JSON
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              A edição é a revista e nasce do JSON extraído do PDF. O sistema lê editora, título,
              ano, trimestre, turma, edição e volume; o PDF é anexado depois, nesta mesma edição.
            </p>

            <div className="mt-4 grid gap-3">
              <label className="text-sm font-semibold">
                JSON de importação (v1.0.0)
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void readJson(file);
                  }}
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2 text-sm"
                />
              </label>

              {jsonName ? <p className="text-xs text-stone-500">Arquivo selecionado: {jsonName}</p> : null}

              {jsonErrors.length > 0 ? (
                <ul className="list-disc space-y-1 rounded-xl bg-red-50 p-3 pl-7 text-xs text-red-900">
                  {jsonErrors.map((detail) => <li key={detail}>{detail}</li>)}
                </ul>
              ) : null}

              {payload ? (
                <div className="rounded-xl bg-stone-100 p-3 text-sm">
                  <p className="font-bold">{payload.edition.title}</p>
                  <p className="text-stone-600">{payload.edition.publisher}</p>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <dt className="font-bold uppercase tracking-wide text-stone-500">Período editorial</dt>
                      <dd>{editionLabel(payload.edition.year, payload.edition.quarter)}</dd>
                    </div>
                    <div>
                      <dt className="font-bold uppercase tracking-wide text-stone-500">Turma</dt>
                      <dd>{payload.edition.class}</dd>
                    </div>
                    <div>
                      <dt className="font-bold uppercase tracking-wide text-stone-500">Edição / volume</dt>
                      <dd>{payload.edition.issue ?? '—'} / {payload.edition.volume ?? '—'}</dd>
                    </div>
                    <div>
                      <dt className="font-bold uppercase tracking-wide text-stone-500">Lições</dt>
                      <dd>{payload.lessons.length}</dd>
                    </div>
                  </dl>
                  <p className="mt-2 break-all text-xs text-stone-500">
                    PDF {payload.source.file_name} • {payload.source.size_bytes} bytes
                  </p>
                  <p className="mt-1 break-all text-xs text-stone-500">
                    SHA-256 {payload.source.sha256}
                  </p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void createEdition()}
                disabled={!payload || creating}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                Criar edição
              </button>

              <p className="text-xs text-stone-500">
                O esquema v1.0.0 é obrigatório. O hash e o tamanho do PDF continuam sendo conferidos
                como bloqueios na importação das lições.
              </p>
            </div>
          </article>

          <div className="space-y-4">
            {loading ? (
              <div className="grid place-items-center rounded-2xl bg-white py-16 shadow">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" aria-label="Carregando edições" />
              </div>
            ) : editions.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 shadow">
                <h2 className="font-serif text-xl font-bold">Nenhuma edição cadastrada</h2>
                <p className="mt-2 text-sm text-stone-600">
                  Selecione o JSON extraído do PDF ao lado. A edição será criada com a proveniência
                  editorial do próprio JSON; depois envie o PDF e importe as lições.
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
