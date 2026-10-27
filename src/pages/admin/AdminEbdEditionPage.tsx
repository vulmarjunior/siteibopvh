import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  FileJson,
  FileText,
  Loader2,
  Lock,
  Pencil,
  Plus,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { supabaseClient } from '../../lib/veredas/supabaseClient';
import {
  AdminEbdPageHeader,
  EbdFeedback,
  EbdStatusBadge,
  formatEbdBytes,
  formatEbdDate,
} from '../../components/admin/ebd/AdminEbdUi';
import {
  EbdAdminApiError,
  ebdAdminRequest,
  ebdAdminUploadLocal,
  sha256File,
} from '../../lib/ebd/adminApi';
import { editionLabel } from '../../lib/ebd/content';
import { validateEbdImport, type EbdImportEdition } from '../../lib/ebd/import';
import {
  canEditEditionMetadata,
  editionDivergences,
} from '../../lib/ebd/provenance';
import {
  formatCivilDateWithWeekday,
  weekdayLabel,
  WEEKDAY_OPTIONS,
} from '../../lib/ebd/schedule';
import type {
  EbdAdminAuditEntry,
  EbdAdminEditionDetail,
  EbdAdminImportResponse,
  EbdAdminUploadTarget,
  EbdSchedulePreview,
} from '../../types/ebd-admin';

interface ImportPreview {
  fileName: string;
  sha256: string;
  lessons: number;
  edition: string;
}

const today = new Date().toISOString().slice(0, 10);

export default function AdminEbdEditionPage() {
  const { editionId = '' } = useParams<{ editionId: string }>();
  const navigate = useNavigate();
  const [edition, setEdition] = useState<EbdAdminEditionDetail | null>(null);
  const [audit, setAudit] = useState<EbdAdminAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<unknown>(null);
  const [jsonEdition, setJsonEdition] = useState<EbdImportEdition | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importAssetId, setImportAssetId] = useState('');
  const [importBusy, setImportBusy] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [statusBusy, setStatusBusy] = useState(false);
  const [metadataForm, setMetadataForm] = useState({ year: '', quarter: '', className: '' });
  const [metadataBusy, setMetadataBusy] = useState(false);
  const [cycleForm, setCycleForm] = useState({ startsOn: today, weekday: '0', className: '' });
  const [preview, setPreview] = useState<EbdSchedulePreview | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [cycleBusy, setCycleBusy] = useState(false);

  const load = useCallback(async () => {
    if (!editionId) return;
    setLoading(true);
    setError('');
    try {
      const data = await ebdAdminRequest<{ edition: EbdAdminEditionDetail }>(`/editions/${editionId}`);
      setEdition(data.edition);
      setImportAssetId((current) => (
        data.edition.pdfAssets.some((asset) => asset.id === current)
          ? current
          : data.edition.pdfAssets[0]?.id || ''
      ));
      setCycleForm((current) => ({ ...current, className: current.className || data.edition.className }));
      setMetadataForm({
        year: String(data.edition.year),
        quarter: String(data.edition.quarter),
        className: data.edition.className,
      });
      const auditData = await ebdAdminRequest<{ audit: EbdAdminAuditEntry[] }>(`/editions/${editionId}/audit`).catch(() => ({ audit: [] }));
      setAudit(auditData.audit);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar a edição.');
    } finally {
      setLoading(false);
    }
  }, [editionId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPreview(null);
  }, [cycleForm.startsOn, cycleForm.weekday]);

  const divergences = useMemo(
    () => (edition && jsonEdition ? editionDivergences(jsonEdition, edition) : []),
    [edition, jsonEdition],
  );

  async function uploadPdf() {
    if (!edition || !pdfFile) return;
    setPdfBusy(true);
    setError('');
    setNotice('');
    setPdfProgress('Calculando hash do PDF…');
    try {
      if (pdfFile.size > 50 * 1024 * 1024) throw new Error('O PDF deve ter no máximo 50 MB.');
      const digest = await sha256File(pdfFile);
      setPdfProgress('Preparando upload…');
      const target = await ebdAdminRequest<EbdAdminUploadTarget>(`/editions/${edition.id}/pdf-upload`, {
        method: 'POST',
        body: JSON.stringify({
          fileName: pdfFile.name,
          sizeBytes: pdfFile.size,
          sha256: digest,
          pageCount: 0,
        }),
      });

      setPdfProgress(target.mode === 'local' ? 'Enviando o PDF para o armazenamento local…' : 'Enviando o PDF direto ao Supabase Storage…');
      if (target.mode === 'local') {
        await ebdAdminUploadLocal(target.uploadUrl, target.token, pdfFile);
      } else {
        const { error: uploadError } = await supabaseClient.storage
          .from(target.bucket)
          .uploadToSignedUrl(target.path, target.token, pdfFile, {
            contentType: 'application/pdf',
            upsert: false,
          });
        if (uploadError) throw new Error(uploadError.message);
      }

      setPdfProgress('Registrando a versão do PDF…');
      const result = await ebdAdminRequest<{ asset: { id: string } }>(`/editions/${edition.id}/pdf-assets`, {
        method: 'POST',
        body: JSON.stringify({
          version: target.version,
          path: target.path,
          fileName: pdfFile.name,
          sizeBytes: pdfFile.size,
          sha256: digest,
          pageCount: 0,
        }),
      });
      setImportAssetId(result.asset.id);
      setPdfFile(null);
      setPdfProgress('');
      setNotice(`PDF v${target.version} registrado. Agora importe o JSON extraído deste PDF.`);
      await load();
    } catch (cause) {
      setPdfProgress('');
      setError(cause instanceof Error ? cause.message : 'Não foi possível enviar o PDF.');
    } finally {
      setPdfBusy(false);
    }
  }

  async function readJson(file: File) {
    setJsonFile(file);
    setJsonData(null);
    setJsonEdition(null);
    setImportPreview(null);
    setWarnings([]);
    setError('');
    setNotice('');
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const validation = validateEbdImport(parsed);
      if (validation.ok === false) {
        setWarnings(validation.errors);
        setError('O JSON não segue o esquema de importação v1.0.0.');
        return;
      }
      const data = validation.data;
      setJsonData(data);
      setJsonEdition(data.edition);
      setImportPreview({
        fileName: data.source.file_name,
        sha256: data.source.sha256,
        lessons: data.lessons.length,
        edition: `${data.edition.year} • ${data.edition.quarter}º trimestre • ${data.edition.class}`,
      });
    } catch {
      setJsonFile(null);
      setError('O arquivo selecionado não é um JSON válido.');
    }
  }

  async function importJson() {
    if (!edition || !jsonData) return;
    setImportBusy(true);
    setError('');
    setNotice('');
    setWarnings([]);
    try {
      const result = await ebdAdminRequest<EbdAdminImportResponse>(`/editions/${edition.id}/import`, {
        method: 'POST',
        body: JSON.stringify({
          assetId: importAssetId || undefined,
          data: jsonData,
        }),
      });
      setWarnings(result.warnings);
      setNotice(`${result.imported} lição(ões) importada(s). Revise o conteúdo antes de criar e publicar o ciclo.`);
      await load();
    } catch (cause) {
      const details = cause instanceof EbdAdminApiError ? cause.details : [];
      if (details.length > 0) setWarnings(details);
      setError(cause instanceof Error ? cause.message : 'Não foi possível importar o JSON.');
    } finally {
      setImportBusy(false);
    }
  }

  async function saveMetadata(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!edition) return;
    const year = Number(metadataForm.year);
    const quarter = Number(metadataForm.quarter);
    const className = metadataForm.className.trim();
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      setError('Informe um ano editorial válido.');
      return;
    }
    if (!Number.isInteger(quarter) || quarter < 1 || quarter > 4) {
      setError('Informe o trimestre editorial de 1 a 4.');
      return;
    }
    if (!className) {
      setError('Informe a turma da edição.');
      return;
    }

    setMetadataBusy(true);
    setError('');
    setNotice('');
    try {
      await ebdAdminRequest(`/editions/${edition.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ year, quarter, className }),
      });
      setNotice('Metadados editoriais corrigidos. Slug e caminho do PDF passam a usar estes valores.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível corrigir os metadados.');
    } finally {
      setMetadataBusy(false);
    }
  }

  async function lessonAction(lessonId: string, action: 'publish' | 'unpublish') {
    setStatusBusy(true);
    setError('');
    setNotice('');
    try {
      await ebdAdminRequest(`/lessons/${lessonId}/${action}`, { method: 'POST' });
      setNotice(action === 'publish' ? 'Lição publicada.' : 'Lição despublicada.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível alterar a lição.');
    } finally {
      setStatusBusy(false);
    }
  }

  async function previewCycle() {
    if (!edition) return;
    const lessonCount = edition.lessons.filter((lesson) => lesson.status !== 'ARCHIVED').length || 13;
    setPreviewBusy(true);
    setError('');
    try {
      const data = await ebdAdminRequest<{ schedule: EbdSchedulePreview }>('/cycles/preview', {
        method: 'POST',
        body: JSON.stringify({
          startsOn: cycleForm.startsOn,
          weekday: Number(cycleForm.weekday),
          lessonCount,
        }),
      });
      setPreview(data.schedule);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível calcular a prévia.');
    } finally {
      setPreviewBusy(false);
    }
  }

  async function createCycle(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!edition) return;
    setCycleBusy(true);
    setError('');
    setNotice('');
    try {
      const data = await ebdAdminRequest<{ cycle: { id: string } }>('/cycles', {
        method: 'POST',
        body: JSON.stringify({
          editionId: edition.id,
          className: cycleForm.className || edition.className,
          startsOn: cycleForm.startsOn,
          weekday: Number(cycleForm.weekday),
        }),
      });
      setNotice('Ciclo criado como rascunho. Confira a agenda antes de publicar.');
      navigate(`/admin/ebd/ciclo/${data.cycle.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar o ciclo.');
    } finally {
      setCycleBusy(false);
    }
  }

  if (loading && !edition) {
    return (
      <main className="min-h-screen bg-stone-100 p-8 text-stone-900">
        <div className="grid place-items-center py-24"><Loader2 className="h-9 w-9 animate-spin text-amber-600" aria-label="Carregando edição" /></div>
      </main>
    );
  }

  if (!edition) {
    return (
      <main className="min-h-screen bg-stone-100 p-8 text-stone-900">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
          <h1 className="font-serif text-2xl font-bold">Edição indisponível</h1>
          <p className="mt-2 text-sm text-stone-600">{error || 'Edição não encontrada.'}</p>
          <Link to="/admin/ebd" className="mt-4 inline-flex rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white">Voltar à EBD</Link>
        </div>
      </main>
    );
  }

  const latestAsset = edition.pdfAssets[0];
  const publishedCount = edition.lessons.filter((lesson) => lesson.status === 'PUBLISHED').length;
  const activeLessons = edition.lessons.filter((lesson) => lesson.status !== 'ARCHIVED');
  const metadataEditable = canEditEditionMetadata({
    pdfAssets: edition.pdfAssets.length,
    lessons: edition.lessons.length,
    cycles: edition.cycles.length,
  });

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <Helmet>
        <title>{edition.title} — EBD Digital</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AdminEbdPageHeader
        title={edition.title}
        subtitle={`${edition.publisher} • ${editionLabel(edition.year, edition.quarter)} • ${edition.className}`}
        backTo="/admin/ebd"
        backLabel="Edições da EBD"
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

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <EbdFeedback error={error} notice={notice} />

          <article className="rounded-2xl bg-white p-5 shadow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
                <FileText className="h-5 w-5 text-amber-600" aria-hidden="true" />
                PDF da revista
              </h2>
              <span className="text-xs font-bold uppercase tracking-wide text-stone-500">
                {latestAsset ? `Versão atual v${latestAsset.version}` : 'Nenhum PDF registrado'}
              </span>
            </div>

            {latestAsset ? (
              <p className="mt-2 text-sm text-stone-600">
                {latestAsset.fileName} • {formatEbdBytes(latestAsset.sizeBytes)} • {latestAsset.pageCount} páginas •{' '}
                {formatEbdDate(latestAsset.createdAt)}
              </p>
            ) : (
              <p className="mt-2 text-sm text-stone-600">Envie o PDF da revista para liberar a importação do JSON.</p>
            )}

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
                className="w-full rounded-xl border border-stone-300 p-2 text-sm"
              />
              <button
                type="button"
                onClick={() => void uploadPdf()}
                disabled={!pdfFile || pdfBusy}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {pdfBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
                Enviar PDF
              </button>
            </div>
            {pdfProgress ? <p className="mt-2 text-xs text-stone-600">{pdfProgress}</p> : null}
            <p className="mt-2 text-xs text-stone-500">
              O upload é assinado e o SHA-256 do arquivo precisa conferir com o JSON extraído dele.
            </p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
              <FileJson className="h-5 w-5 text-amber-600" aria-hidden="true" />
              Importar lições (JSON v1.0.0)
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              O JSON de importação não muda: <code>edition.*</code> e <code>source.*</code> são proveniência editorial.
              Esquema v1.0.0, hash SHA-256 e tamanho do PDF continuam como bloqueios.
            </p>

            <div className="mt-4 grid gap-3">
              <label className="text-sm font-semibold">
                Versão do PDF de origem
                <select
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                  value={importAssetId}
                  onChange={(event) => setImportAssetId(event.target.value)}
                >
                  {edition.pdfAssets.length === 0 ? <option value="">Nenhum PDF registrado</option> : null}
                  {edition.pdfAssets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      v{asset.version} • {asset.fileName}
                    </option>
                  ))}
                </select>
              </label>

              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void readJson(file);
                }}
                className="w-full rounded-xl border border-stone-300 p-2 text-sm"
              />

              {importPreview ? (
                <div className="rounded-xl bg-stone-100 p-3 text-sm">
                  <p className="font-bold">{importPreview.fileName}</p>
                  <p className="text-stone-600">
                    {importPreview.lessons} lições • {importPreview.edition}
                  </p>
                  <p className="mt-1 break-all text-xs text-stone-500">SHA-256 {importPreview.sha256 || '—'}</p>
                </div>
              ) : null}

              {divergences.length > 0 ? (
                <div role="note" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
                  <p className="font-bold">Divergência informativa entre o JSON e a edição</p>
                  <p className="mt-1 text-xs">
                    O import <strong>não é bloqueado</strong> por estes campos. Editora, título,
                    edição e volume passam a valer os valores do JSON; ano, trimestre e turma
                    permanecem os da edição.
                  </p>
                  <table className="mt-2 w-full text-xs">
                    <thead>
                      <tr className="text-left font-bold uppercase tracking-wide text-amber-800">
                        <th className="py-1 pr-2">Campo</th>
                        <th className="py-1 pr-2">JSON</th>
                        <th className="py-1">Edição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {divergences.map((item) => (
                        <tr key={item.field} className="border-t border-amber-200">
                          <td className="py-1 pr-2">{item.label}</td>
                          <td className="py-1 pr-2">{item.json}</td>
                          <td className="py-1">{item.edition}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void importJson()}
                disabled={!jsonData || !importAssetId || importBusy}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {importBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileJson className="h-4 w-4" aria-hidden="true" />}
                Importar lições
              </button>
            </div>

            {jsonFile ? <p className="mt-2 text-xs text-stone-500">Arquivo selecionado: {jsonFile.name}</p> : null}
            {warnings.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 rounded-xl bg-amber-50 p-3 pl-7 text-xs text-amber-900">
                {warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            ) : null}
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
                <CalendarDays className="h-5 w-5 text-amber-600" aria-hidden="true" />
                Ciclos de estudo
              </h2>
              <span className="text-xs text-stone-500">{activeLessons.length} lições disponíveis</span>
            </div>

            {edition.cycles.length === 0 ? (
              <p className="mt-2 text-sm text-stone-600">Nenhum ciclo criado. A mesma revista pode ser usada por turmas e períodos diferentes.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {edition.cycles.map((cycle) => (
                  <li key={cycle.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 p-3">
                    <div className="min-w-0">
                      <p className="font-bold">{cycle.periodLabel} • {cycle.className}</p>
                      <p className="text-xs text-stone-500">
                        {cycle.lessonCount} lições • início em {formatCivilDateWithWeekday(cycle.startsOn)} • revisão {cycle.anchorRevision} • {cycle.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <EbdStatusBadge status={cycle.status} />
                      <Link
                        to={`/admin/ebd/ciclo/${cycle.id}`}
                        className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
                      >
                        Abrir agenda
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={createCycle} className="mt-5 rounded-xl border border-stone-200 p-4">
              <h3 className="flex items-center gap-2 font-bold">
                <Plus className="h-4 w-4 text-amber-600" aria-hidden="true" />
                Criar ciclo
              </h3>
              <p className="mt-1 text-sm text-stone-600">
                A lição 1 cai no primeiro {weekdayLabel(Number(cycleForm.weekday)).toLowerCase()} a partir da data de início.
                Reancorar depois muda a data de início; a agenda pode ser ajustada lição a lição.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="text-sm font-semibold">
                  Data de início
                  <input
                    type="date"
                    value={cycleForm.startsOn}
                    onChange={(event) => setCycleForm((current) => ({ ...current, startsOn: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                    required
                  />
                </label>
                <label className="text-sm font-semibold">
                  Dia da semana
                  <select
                    value={cycleForm.weekday}
                    onChange={(event) => setCycleForm((current) => ({ ...current, weekday: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                  >
                    {WEEKDAY_OPTIONS.map((option) => (
                      <option key={option.value} value={String(option.value)}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Turma do ciclo
                  <input
                    value={cycleForm.className}
                    onChange={(event) => setCycleForm((current) => ({ ...current, className: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                    required
                  />
                </label>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void previewCycle()}
                  disabled={previewBusy}
                  className="inline-flex items-center gap-2 rounded-xl border border-stone-300 px-4 py-2 text-sm font-bold disabled:opacity-60"
                >
                  {previewBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
                  Prévia das datas
                </button>
                <button
                  type="submit"
                  disabled={cycleBusy || preview === null}
                  className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  {cycleBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                  Criar ciclo
                </button>
              </div>
              {preview === null ? (
                <p className="mt-2 text-xs text-stone-500">Gere a prévia para conferir o período antes de criar o ciclo.</p>
              ) : (
                <div className="mt-3 rounded-xl bg-stone-100 p-3">
                  <p className="text-sm font-bold">{preview.periodLabel}</p>
                  <p className="text-xs text-stone-500">
                    {preview.entries.length} lições • {formatCivilDateWithWeekday(preview.firstDate)} a {formatCivilDateWithWeekday(preview.lastDate)}
                  </p>
                  <ol className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                    {preview.entries.map((entry) => (
                      <li key={entry.lessonNumber} className="flex justify-between gap-2">
                        <span>Lição {entry.lessonNumber}</span>
                        <span className="font-semibold">{formatCivilDateWithWeekday(entry.date)}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </form>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-serif text-xl font-bold">Lições da edição</h2>
              <span className="text-xs text-stone-500">{publishedCount} de {edition.lessons.length} publicadas</span>
            </div>
            {edition.lessons.length === 0 ? (
              <p className="mt-2 text-sm text-stone-600">Importe o JSON para criar as lições.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[42rem] text-sm">
                  <thead className="text-left text-xs font-bold uppercase tracking-wide text-stone-500">
                    <tr>
                      <th className="py-2 pr-3">Lição</th>
                      <th className="py-2 pr-3">Páginas</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {edition.lessons.map((lesson) => (
                      <tr key={lesson.id} className="border-t border-stone-200 align-top">
                        <td className="py-2 pr-3">
                          <p className="font-bold">{lesson.number}. {lesson.title}</p>
                          <p className="text-xs text-stone-500">{lesson.baseText}</p>
                        </td>
                        <td className="py-2 pr-3 text-stone-600">{lesson.startPage}–{lesson.endPage}</td>
                        <td className="py-2 pr-3"><EbdStatusBadge status={lesson.status} /></td>
                        <td className="py-2 pr-3">
                          <div className="flex flex-wrap gap-1.5">
                            <Link
                              to={`/admin/ebd/licoes/${lesson.id}`}
                              className="rounded-lg border border-stone-300 px-2 py-1 text-xs font-bold"
                            >
                              Editar
                            </Link>
                            {lesson.status === 'PUBLISHED' ? (
                              <button
                                type="button"
                                disabled={statusBusy}
                                onClick={() => void lessonAction(lesson.id, 'unpublish')}
                                className="rounded-lg border border-stone-300 px-2 py-1 text-xs font-bold disabled:opacity-60"
                              >
                                Despublicar
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={statusBusy}
                                onClick={() => void lessonAction(lesson.id, 'publish')}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-2 py-1 text-xs font-bold text-white disabled:opacity-60"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                                Publicar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        </div>

        <aside className="space-y-4">
          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="font-serif text-lg font-bold">Proveniência editorial</h2>
            <dl className="mt-2 space-y-1 text-sm">
              <div><dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Editora</dt><dd>{edition.publisher}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Período editorial</dt><dd>{editionLabel(edition.year, edition.quarter)}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Turma</dt><dd>{edition.className}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Edição / volume</dt><dd>{edition.issue ?? '—'} / {edition.volume ?? '—'}</dd></div>
              <div><dt className="text-xs font-bold uppercase tracking-wide text-stone-500">Origem</dt><dd className="break-all text-xs">{edition.sourceFileName ?? '—'}</dd></div>
            </dl>

            {metadataEditable ? (
              <form onSubmit={saveMetadata} className="mt-4 rounded-xl border border-stone-200 p-3">
                <p className="flex items-center gap-2 text-sm font-bold">
                  <Pencil className="h-4 w-4 text-amber-600" aria-hidden="true" />
                  Corrigir metadados
                </p>
                <p className="mt-1 text-xs text-stone-600">
                  Enquanto a edição não tiver PDF, lições nem ciclos, ano, trimestre e turma podem ser
                  corrigidos. Depois disso, ficam bloqueados.
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <label className="text-xs font-semibold">
                    Ano editorial
                    <input
                      type="number"
                      min={1900}
                      max={2100}
                      value={metadataForm.year}
                      onChange={(event) => setMetadataForm((current) => ({ ...current, year: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                      required
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    Trimestre
                    <select
                      value={metadataForm.quarter}
                      onChange={(event) => setMetadataForm((current) => ({ ...current, quarter: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                    >
                      <option value="1">1º</option>
                      <option value="2">2º</option>
                      <option value="3">3º</option>
                      <option value="4">4º</option>
                    </select>
                  </label>
                  <label className="col-span-2 text-xs font-semibold">
                    Turma
                    <input
                      value={metadataForm.className}
                      onChange={(event) => setMetadataForm((current) => ({ ...current, className: event.target.value }))}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                      required
                    />
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={metadataBusy}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                >
                  {metadataBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Pencil className="h-3.5 w-3.5" aria-hidden="true" />}
                  Salvar metadados
                </button>
              </form>
            ) : (
              <p className="mt-4 flex items-start gap-2 rounded-xl bg-stone-100 p-3 text-xs text-stone-600">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Ano, trimestre e turma ficam bloqueados depois do primeiro PDF, lição ou ciclo.
                A proveniência acima continua visível.
              </p>
            )}
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="font-serif text-lg font-bold">Auditoria recente</h2>
            {audit.length === 0 ? (
              <p className="mt-2 text-sm text-stone-600">Sem eventos registrados.</p>
            ) : (
              <ul className="mt-2 space-y-2 text-xs">
                {audit.map((entry) => (
                  <li key={entry.id} className="rounded-lg bg-stone-100 p-2">
                    <p className="font-bold">{entry.acao}</p>
                    <p className="text-stone-500">{entry.usuarioEmail ?? '—'} • {formatEbdDate(entry.criadoEm)}</p>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </aside>
      </section>
    </main>
  );
}
