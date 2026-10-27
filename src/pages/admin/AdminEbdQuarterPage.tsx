import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import {
  Archive,
  CheckCircle2,
  FileJson,
  FileText,
  Loader2,
  RefreshCw,
  Send,
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
import type {
  EbdAdminAuditEntry,
  EbdAdminImportResponse,
  EbdAdminQuarterDetail,
  EbdAdminUploadTarget,
} from '../../types/ebd-admin';

interface ImportPreview {
  fileName: string;
  sha256: string;
  lessons: number;
  edition: string;
}

export default function AdminEbdQuarterPage() {
  const { quarterId = '' } = useParams<{ quarterId: string }>();
  const [quarter, setQuarter] = useState<EbdAdminQuarterDetail | null>(null);
  const [audit, setAudit] = useState<EbdAdminAuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<unknown>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importAssetId, setImportAssetId] = useState('');
  const [importBusy, setImportBusy] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [statusBusy, setStatusBusy] = useState(false);

  const load = useCallback(async () => {
    if (!quarterId) return;
    setLoading(true);
    setError('');
    try {
      const data = await ebdAdminRequest<{ quarter: EbdAdminQuarterDetail }>(`/quarters/${quarterId}`);
      setQuarter(data.quarter);
      setImportAssetId((current) => (
        data.quarter.pdfAssets.some((asset) => asset.id === current)
          ? current
          : data.quarter.pdfAssets[0]?.id || ''
      ));
      const auditData = await ebdAdminRequest<{ audit: EbdAdminAuditEntry[] }>(`/quarters/${quarterId}/audit`).catch(() => ({ audit: [] }));
      setAudit(auditData.audit);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar o trimestre.');
    } finally {
      setLoading(false);
    }
  }, [quarterId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function uploadPdf() {
    if (!quarter || !pdfFile) return;
    setPdfBusy(true);
    setError('');
    setNotice('');
    setPdfProgress('Calculando hash do PDF…');
    try {
      if (pdfFile.size > 50 * 1024 * 1024) throw new Error('O PDF deve ter no máximo 50 MB.');
      const digest = await sha256File(pdfFile);
      setPdfProgress('Preparando upload…');
      const target = await ebdAdminRequest<EbdAdminUploadTarget>(`/quarters/${quarter.id}/pdf-upload`, {
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
      const result = await ebdAdminRequest<{ asset: { id: string } }>(`/quarters/${quarter.id}/pdf-assets`, {
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
    setWarnings([]);
    setError('');
    try {
      const parsed: unknown = JSON.parse(await file.text());
      setJsonData(parsed);
      const source = (parsed as { source?: { file_name?: unknown; sha256?: unknown } })?.source;
      const edition = (parsed as { edition?: { year?: unknown; quarter?: unknown; class?: unknown } })?.edition;
      const lessons = (parsed as { lessons?: unknown[] })?.lessons;
      setImportPreview({
        fileName: typeof source?.file_name === 'string' ? source.file_name : file.name,
        sha256: typeof source?.sha256 === 'string' ? source.sha256 : '',
        lessons: Array.isArray(lessons) ? lessons.length : 0,
        edition: edition ? `${String(edition.year || '—')} • ${String(edition.quarter || '—')}º trimestre • ${String(edition.class || '—')}` : '—',
      });
    } catch {
      setJsonData(null);
      setImportPreview(null);
      setJsonFile(null);
      setError('O arquivo selecionado não é um JSON válido.');
    }
  }

  async function importJson() {
    if (!quarter || !jsonData) return;
    setImportBusy(true);
    setError('');
    setNotice('');
    setWarnings([]);
    try {
      const result = await ebdAdminRequest<EbdAdminImportResponse>(`/quarters/${quarter.id}/import`, {
        method: 'POST',
        body: JSON.stringify({
          assetId: importAssetId || undefined,
          data: jsonData,
        }),
      });
      setWarnings(result.warnings);
      setNotice(`${result.imported} lição(ões) importada(s). Revise o conteúdo antes de publicar.`);
      await load();
    } catch (cause) {
      const details = cause instanceof EbdAdminApiError ? cause.details : [];
      if (details.length > 0) setWarnings(details);
      setError(cause instanceof Error ? cause.message : 'Não foi possível importar o JSON.');
    } finally {
      setImportBusy(false);
    }
  }

  async function quarterAction(action: 'publish' | 'unpublish' | 'archive') {
    if (!quarter) return;
    if (action === 'publish' && !window.confirm('Publicar o trimestre e todas as lições válidas? O conteúdo ficará visível em /ebd.')) return;
    if (action === 'unpublish' && !window.confirm('Despublicar o trimestre? A área pública deixará de exibir estas lições.')) return;
    if (action === 'archive' && !window.confirm('Arquivar este trimestre? Ele sairá da área pública e ficará preservado no histórico.')) return;

    setStatusBusy(true);
    setError('');
    setNotice('');
    try {
      await ebdAdminRequest(`/quarters/${quarter.id}/${action}`, { method: 'POST' });
      setNotice(action === 'publish' ? 'Trimestre publicado.' : action === 'unpublish' ? 'Trimestre despublicado.' : 'Trimestre arquivado.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível alterar o status.');
    } finally {
      setStatusBusy(false);
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

  if (loading && !quarter) {
    return (
      <main className="min-h-screen bg-stone-100 p-8">
        <div className="grid place-items-center py-24"><Loader2 className="h-9 w-9 animate-spin text-amber-600" aria-label="Carregando trimestre" /></div>
      </main>
    );
  }

  if (!quarter) {
    return (
      <main className="min-h-screen bg-stone-100 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
          <h1 className="font-serif text-2xl font-bold">Trimestre indisponível</h1>
          <p className="mt-2 text-sm text-stone-600">{error || 'Trimestre não encontrado.'}</p>
          <Link to="/admin/ebd" className="mt-4 inline-flex rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white">Voltar à EBD</Link>
        </div>
      </main>
    );
  }

  const latestAsset = quarter.pdfAssets[0];
  const publishedCount = quarter.lessons.filter((lesson) => lesson.status === 'PUBLISHED').length;

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <Helmet>
        <title>{`${quarter.quarter}º trimestre de ${quarter.year} — EBD Digital`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminEbdPageHeader
        title={`${quarter.quarter}º trimestre de ${quarter.year} — ${quarter.className}`}
        subtitle={`${quarter.title} • ${quarter.publisher}`}
        backTo="/admin/ebd"
        backLabel="Voltar aos trimestres da EBD"
        actions={<EbdStatusBadge status={quarter.status} />}
      />

      <section className="mx-auto max-w-7xl space-y-5 p-5">
        <EbdFeedback error={error} notice={notice} />

        <div className="rounded-2xl bg-white p-5 shadow">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="text-sm text-stone-600">
              <p>
                <strong className="text-stone-900">Lições:</strong> {quarter.lessons.length} •{' '}
                <strong className="text-stone-900">Publicadas:</strong> {publishedCount} •{' '}
                <strong className="text-stone-900">PDFs:</strong> {quarter.pdfAssets.length}
                {latestAsset ? ` (versão atual v${latestAsset.version})` : ''}
              </p>
              <p className="mt-1">
                <strong className="text-stone-900">Publicado em:</strong> {formatEbdDate(quarter.publishedAt)} •{' '}
                <strong className="text-stone-900">Por:</strong> {quarter.publishedBy || '—'}
              </p>
              <p className="mt-1">
                <strong className="text-stone-900">Origem:</strong> {quarter.sourceFileName || 'PDF ainda não importado'} •{' '}
                <strong className="text-stone-900">Páginas:</strong> {quarter.sourcePageCount || '—'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void quarterAction('publish')}
                disabled={statusBusy || quarter.lessons.length === 0}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Publicar trimestre
              </button>
              <button
                type="button"
                onClick={() => void quarterAction('unpublish')}
                disabled={statusBusy || quarter.status !== 'PUBLISHED'}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold hover:bg-stone-50 disabled:opacity-50"
              >
                Despublicar
              </button>
              <button
                type="button"
                onClick={() => void quarterAction('archive')}
                disabled={statusBusy || quarter.status === 'ARCHIVED'}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold hover:bg-stone-50 disabled:opacity-50"
              >
                <Archive className="h-4 w-4" aria-hidden="true" /> Arquivar
              </button>
              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold hover:bg-stone-50"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" /> Atualizar
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
          <section className="rounded-2xl bg-white p-5 shadow" aria-labelledby="pdf-titulo">
            <h2 id="pdf-titulo" className="flex items-center gap-2 font-serif text-xl font-bold">
              <FileText className="h-5 w-5 text-amber-600" aria-hidden="true" /> PDF original
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              O PDF é enviado direto ao Storage por URL assinada. Cada envio cria uma nova versão e preserva as anteriores.
            </p>

            <div className="mt-4 rounded-xl border border-dashed border-stone-300 p-4">
              <label className="block text-sm font-bold text-stone-700">
                Nova versão do PDF (até 50 MB)
                <input
                  key={pdfFile ? `${pdfFile.name}-${pdfFile.size}` : 'pdf-input-empty'}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) => setPdfFile(event.target.files?.[0] || null)}
                  className="mt-2 block w-full text-sm"
                />
              </label>
              {pdfFile ? (
                <p className="mt-2 text-xs text-stone-500">{pdfFile.name} • {formatEbdBytes(pdfFile.size)}</p>
              ) : null}
              <button
                type="button"
                onClick={() => void uploadPdf()}
                disabled={!pdfFile || pdfBusy}
                className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50"
              >
                {pdfBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
                {pdfBusy ? 'Enviando…' : 'Enviar PDF'}
              </button>
              {pdfProgress ? <p className="mt-2 text-xs text-stone-600" role="status">{pdfProgress}</p> : null}
            </div>

            {quarter.pdfAssets.length === 0 ? (
              <p className="mt-4 text-sm text-stone-500">Nenhum PDF registrado ainda.</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {quarter.pdfAssets.map((asset) => (
                  <li key={asset.id} className="rounded-xl border border-stone-200 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <strong>Versão {asset.version}</strong>
                      <a
                        href={`/api/ebd/admin/quarters/${quarter.id}/pdf?assetId=${asset.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-amber-700 underline"
                      >
                        Abrir PDF
                      </a>
                    </div>
                    <p className="mt-1 text-xs text-stone-500">
                      {asset.fileName} • {formatEbdBytes(asset.sizeBytes)} • {asset.pageCount || '—'} páginas
                    </p>
                    <p className="mt-1 break-all text-[0.68rem] text-stone-400">
                      SHA-256: {asset.sha256}
                    </p>
                    <p className="mt-1 text-[0.68rem] text-stone-400">
                      Enviado por {asset.uploadedBy || '—'} em {formatEbdDate(asset.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl bg-white p-5 shadow" aria-labelledby="import-titulo">
            <h2 id="import-titulo" className="flex items-center gap-2 font-serif text-xl font-bold">
              <FileJson className="h-5 w-5 text-amber-600" aria-hidden="true" /> Importar JSON
            </h2>
            <p className="mt-1 text-xs text-stone-500">
              O JSON precisa ter o mesmo SHA-256 e tamanho do PDF registrado. Importações divergentes são recusadas.
            </p>

            <label className="mt-4 block text-sm font-bold text-stone-700">
              JSON extraído localmente
              <input
                type="file"
                accept="application/json,.json"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void readJson(file);
                }}
                className="mt-2 block w-full text-sm"
              />
            </label>
            {jsonFile && importPreview ? (
              <div className="mt-3 rounded-xl bg-stone-50 p-3 text-xs text-stone-600">
                <p><strong>{importPreview.fileName}</strong> • {importPreview.lessons} lição(ões) • {importPreview.edition}</p>
                <p className="mt-1 break-all">SHA-256 do JSON: {importPreview.sha256 || '—'}</p>
              </div>
            ) : null}

            <label className="mt-3 block text-sm font-bold text-stone-700">
              PDF de referência
              <select
                value={importAssetId}
                onChange={(event) => setImportAssetId(event.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-sm"
                disabled={quarter.pdfAssets.length === 0}
              >
                {quarter.pdfAssets.length === 0 ? <option value="">Envie o PDF primeiro</option> : null}
                {quarter.pdfAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    v{asset.version} — {asset.fileName} — {formatEbdBytes(asset.sizeBytes)}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => void importJson()}
              disabled={!jsonData || importBusy || !importAssetId}
              className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-stone-900 px-3 py-2 text-xs font-bold text-white hover:bg-stone-800 disabled:opacity-50"
            >
              {importBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
              {importBusy ? 'Importando…' : 'Importar JSON'}
            </button>

            {warnings.length > 0 ? (
              <ul className="mt-3 list-disc space-y-1 rounded-xl bg-amber-50 p-3 pl-7 text-xs text-amber-900" role="status">
                {warnings.map((warning) => <li key={warning}>{warning}</li>)}
              </ul>
            ) : null}
          </section>
        </div>

        <section className="rounded-2xl bg-white p-5 shadow" aria-labelledby="licoes-titulo">
          <h2 id="licoes-titulo" className="font-serif text-xl font-bold">Lições do trimestre</h2>
          {quarter.lessons.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">Nenhuma lição importada. Envie o PDF e importe o JSON.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[48rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-500">
                    <th className="p-2">Lição</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Páginas</th>
                    <th className="p-2">Atualizada</th>
                    <th className="p-2" />
                  </tr>
                </thead>
                <tbody>
                  {quarter.lessons.map((lesson) => (
                    <tr key={lesson.id} className="border-b border-stone-100 align-top">
                      <td className="p-2">
                        <strong className="block font-serif text-base">Lição {lesson.number} — {lesson.title}</strong>
                        <span className="text-xs text-stone-500">Texto base: {lesson.baseText}</span>
                      </td>
                      <td className="p-2"><EbdStatusBadge status={lesson.status} /></td>
                      <td className="p-2 text-xs">{lesson.startPage}–{lesson.endPage}</td>
                      <td className="p-2 text-xs text-stone-500">{formatEbdDate(lesson.updatedAt)}</td>
                      <td className="p-2">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link
                            to={`/admin/ebd/licoes/${lesson.id}`}
                            className="inline-flex min-h-9 items-center rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-stone-800"
                          >
                            Revisar
                          </Link>
                          {lesson.status === 'PUBLISHED' ? (
                            <button
                              type="button"
                              onClick={() => void lessonAction(lesson.id, 'unpublish')}
                              disabled={statusBusy}
                              className="inline-flex min-h-9 items-center rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-bold hover:bg-stone-50 disabled:opacity-50"
                            >
                              Despublicar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void lessonAction(lesson.id, 'publish')}
                              disabled={statusBusy}
                              className="inline-flex min-h-9 items-center rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
                            >
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
        </section>

        <section className="rounded-2xl bg-white p-5 shadow" aria-labelledby="auditoria-titulo">
          <h2 id="auditoria-titulo" className="font-serif text-xl font-bold">Auditoria recente</h2>
          {audit.length === 0 ? (
            <p className="mt-2 text-sm text-stone-500">Nenhuma ação registrada ainda.</p>
          ) : (
            <ul className="mt-3 divide-y divide-stone-100 text-sm">
              {audit.slice(0, 15).map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span className="font-mono text-xs font-bold text-stone-700">{entry.acao}</span>
                  <span className="text-xs text-stone-500">
                    {entry.usuarioEmail || '—'} • {formatEbdDate(entry.criadoEm)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
