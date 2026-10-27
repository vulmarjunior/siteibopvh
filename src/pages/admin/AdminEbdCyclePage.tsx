import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Send,
  Upload,
} from 'lucide-react';
import {
  AdminEbdPageHeader,
  EbdFeedback,
  EbdStatusBadge,
  formatEbdDate,
} from '../../components/admin/ebd/AdminEbdUi';
import { ebdAdminRequest } from '../../lib/ebd/adminApi';
import { editionLabel } from '../../lib/ebd/content';
import {
  formatCivilDateWithWeekday,
  WEEKDAY_OPTIONS,
  weekdayLabel,
} from '../../lib/ebd/schedule';
import type {
  EbdAdminAuditEntry,
  EbdAdminCycleDetail,
  EbdScheduleKind,
} from '../../types/ebd-admin';

interface RowForm {
  kind: EbdScheduleKind;
  date: string;
}

const KIND_LABELS: Record<EbdScheduleKind, string> = {
  RULE: 'Pela regra',
  RESCHEDULED: 'Ajustada manualmente',
  NO_MEETING: 'Sem encontro na semana',
};

function rowsFromCycle(cycle: EbdAdminCycleDetail): Record<number, RowForm> {
  const result: Record<number, RowForm> = {};
  for (const lesson of cycle.lessons) {
    result[lesson.lessonNumber] = {
      kind: lesson.exceptionKind,
      date: lesson.scheduledOn ?? lesson.date ?? cycle.startsOn,
    };
  }
  return result;
}

export default function AdminEbdCyclePage() {
  const { cycleId = '' } = useParams<{ cycleId: string }>();
  const [cycle, setCycle] = useState<EbdAdminCycleDetail | null>(null);
  const [audit, setAudit] = useState<EbdAdminAuditEntry[]>([]);
  const [rows, setRows] = useState<Record<number, RowForm>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyLesson, setBusyLesson] = useState<number | null>(null);
  const [statusBusy, setStatusBusy] = useState(false);
  const [reanchor, setReanchor] = useState({ startsOn: '', weekday: '0' });
  const [reanchorBusy, setReanchorBusy] = useState(false);

  const applyCycle = useCallback((next: EbdAdminCycleDetail) => {
    setCycle(next);
    setRows(rowsFromCycle(next));
    setReanchor({ startsOn: next.startsOn, weekday: String(next.weekday) });
  }, []);

  const load = useCallback(async () => {
    if (!cycleId) return;
    setLoading(true);
    setError('');
    try {
      const data = await ebdAdminRequest<{ cycle: EbdAdminCycleDetail }>(`/cycles/${cycleId}`);
      applyCycle(data.cycle);
      const auditData = await ebdAdminRequest<{ audit: EbdAdminAuditEntry[] }>(`/cycles/${cycleId}/audit`).catch(() => ({ audit: [] }));
      setAudit(auditData.audit);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar o ciclo.');
    } finally {
      setLoading(false);
    }
  }, [cycleId, applyCycle]);

  useEffect(() => {
    void load();
  }, [load]);

  const divergences = useMemo(
    () => (cycle ? cycle.lessons.filter((lesson) => lesson.divergesFromRule) : []),
    [cycle],
  );

  const collisions = useMemo(
    () => (cycle ? cycle.lessons.filter((lesson) => lesson.sharesDateWith.length > 0) : []),
    [cycle],
  );

  async function saveSchedule(lessonNumber: number, kindOverride?: EbdScheduleKind) {
    if (!cycle) return;
    const form = rows[lessonNumber];
    const kind = kindOverride ?? form?.kind ?? 'RULE';
    if (kind === 'RESCHEDULED' && !form?.date) {
      setError('Informe a data do ajuste manual.');
      return;
    }
    setBusyLesson(lessonNumber);
    setError('');
    setNotice('');
    try {
      const data = await ebdAdminRequest<{ cycle: EbdAdminCycleDetail }>(`/cycles/${cycle.id}/schedule/${lessonNumber}`, {
        method: 'POST',
        body: JSON.stringify({
          kind,
          scheduledOn: kind === 'RESCHEDULED' ? form.date : undefined,
        }),
      });
      applyCycle(data.cycle);
      setNotice(`Agenda da lição ${lessonNumber} atualizada.`);
      await refreshAudit();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível ajustar a lição.');
    } finally {
      setBusyLesson(null);
    }
  }

  async function refreshAudit() {
    const auditData = await ebdAdminRequest<{ audit: EbdAdminAuditEntry[] }>(`/cycles/${cycleId}/audit`).catch(() => ({ audit: [] }));
    setAudit(auditData.audit);
  }

  async function doReanchor() {
    if (!cycle) return;
    if (!window.confirm('Reancorar o ciclo a partir desta data? As lições voltam à regra semanal e os ajustes manuais são preservados, sinalizados como divergência para revisão.')) {
      return;
    }
    setReanchorBusy(true);
    setError('');
    setNotice('');
    try {
      const data = await ebdAdminRequest<{ cycle: EbdAdminCycleDetail }>(`/cycles/${cycle.id}/reanchor`, {
        method: 'POST',
        body: JSON.stringify({
          startsOn: reanchor.startsOn,
          weekday: Number(reanchor.weekday),
        }),
      });
      applyCycle(data.cycle);
      setNotice('Ciclo reancorado. Revise as divergências sinalizadas.');
      await refreshAudit();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível reancorar o ciclo.');
    } finally {
      setReanchorBusy(false);
    }
  }

  async function cycleAction(action: 'publish' | 'unpublish' | 'archive') {
    if (!cycle) return;
    if (action === 'publish' && !window.confirm('Publicar o ciclo e as lições válidas? O conteúdo ficará visível em /ebd.')) return;
    if (action === 'unpublish' && !window.confirm('Despublicar o ciclo? A área pública deixará de exibir este período.')) return;
    if (action === 'archive' && !window.confirm('Arquivar este ciclo? Ele sairá da área pública e ficará preservado no histórico.')) return;

    setStatusBusy(true);
    setError('');
    setNotice('');
    try {
      const data = await ebdAdminRequest<{ cycle: EbdAdminCycleDetail }>(`/cycles/${cycle.id}/${action}`, { method: 'POST' });
      applyCycle(data.cycle);
      setNotice(action === 'publish' ? 'Ciclo publicado.' : action === 'unpublish' ? 'Ciclo despublicado.' : 'Ciclo arquivado.');
      await refreshAudit();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível alterar o status do ciclo.');
    } finally {
      setStatusBusy(false);
    }
  }

  if (loading && !cycle) {
    return (
      <main className="min-h-screen bg-stone-100 p-8">
        <div className="grid place-items-center py-24"><Loader2 className="h-9 w-9 animate-spin text-amber-600" aria-label="Carregando ciclo" /></div>
      </main>
    );
  }

  if (!cycle) {
    return (
      <main className="min-h-screen bg-stone-100 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
          <h1 className="font-serif text-2xl font-bold">Ciclo indisponível</h1>
          <p className="mt-2 text-sm text-stone-600">{error || 'Ciclo não encontrado.'}</p>
          <Link to="/admin/ebd" className="mt-4 inline-flex rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white">Voltar à EBD</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-100">
      <Helmet>
        <title>{cycle.periodLabel} — Agenda da EBD</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <AdminEbdPageHeader
        title={cycle.periodLabel}
        subtitle={`${cycle.className} • ${cycle.lessons.length} lições • início em ${formatCivilDateWithWeekday(cycle.startsOn)} • encontros de ${weekdayLabel(cycle.weekday).toLowerCase()}`}
        backTo={`/admin/ebd/${cycle.editionId}`}
        backLabel="Edição da revista"
        actions={
          <>
            <EbdStatusBadge status={cycle.status} />
            <button
              type="button"
              onClick={() => void load()}
              className="rounded-lg border border-white/30 px-3 py-2 text-xs font-bold uppercase tracking-wide"
            >
              Atualizar
            </button>
          </>
        }
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <EbdFeedback error={error} notice={notice} />

          {divergences.length > 0 || collisions.length > 0 ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Revisar a agenda
              </p>
              {divergences.length > 0 ? (
                <p className="mt-1">
                  {divergences.length} ajuste(s) manual(is) feito(s) sob uma âncora anterior: lição(ões){' '}
                  {divergences.map((lesson) => lesson.number).join(', ')}. Ajuste ou volte à regra em cada linha.
                </p>
              ) : null}
              {collisions.length > 0 ? (
                <p className="mt-1">
                  Duas ou mais lições caíram na mesma data:{' '}
                  {collisions.map((lesson) => `${lesson.number} (${formatCivilDateWithWeekday(lesson.date ?? '')})`).join('; ')}.
                </p>
              ) : null}
            </div>
          ) : null}

          <article className="rounded-2xl bg-white p-5 shadow">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
                <CalendarDays className="h-5 w-5 text-amber-600" aria-hidden="true" />
                Agenda das lições
              </h2>
              <span className="text-xs text-stone-500">revisão da âncora: {cycle.anchorRevision}</span>
            </div>
            <p className="mt-1 text-sm text-stone-600">
              A data é calculada pela regra a partir da âncora. <strong>Ajustar somente esta lição</strong> cria
              uma exceção que não move as demais. <strong>Sem encontro</strong> desloca a lição e as seguintes em
              uma semana.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[52rem] text-sm">
                <thead className="text-left text-xs font-bold uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="py-2 pr-3">Lição</th>
                    <th className="py-2 pr-3">Data</th>
                    <th className="py-2 pr-3">Exceção</th>
                    <th className="py-2 pr-3">Ajuste</th>
                  </tr>
                </thead>
                <tbody>
                  {cycle.lessons.map((lesson) => {
                    const form = rows[lesson.lessonNumber] ?? { kind: lesson.exceptionKind, date: lesson.date ?? '' };
                    const busy = busyLesson === lesson.lessonNumber;
                    return (
                      <tr
                        key={lesson.id}
                        className={`border-t border-stone-200 align-top ${lesson.divergesFromRule ? 'bg-amber-50' : ''}`}
                      >
                        <td className="py-3 pr-3">
                          <p className="font-bold">{lesson.number}. {lesson.title}</p>
                          <p className="text-xs text-stone-500">{lesson.baseText} • p. {lesson.startPage}–{lesson.endPage}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <EbdStatusBadge status={lesson.status} />
                            <Link to={`/admin/ebd/licoes/${lesson.id}`} className="text-xs font-bold underline">
                              editar conteúdo
                            </Link>
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <p className="font-semibold">{lesson.date ? formatCivilDateWithWeekday(lesson.date) : '—'}</p>
                          {lesson.exceptionKind !== 'RULE' && lesson.ruleDate ? (
                            <p className="text-xs text-stone-500">regra: {formatCivilDateWithWeekday(lesson.ruleDate)}</p>
                          ) : null}
                          {lesson.sharesDateWith.length > 0 ? (
                            <p className="text-xs font-bold text-red-700">mesma data da lição {lesson.sharesDateWith.join(', ')}</p>
                          ) : null}
                          {lesson.divergesFromRule ? (
                            <p className="text-xs font-bold text-amber-800">divergente após reancoragem</p>
                          ) : null}
                        </td>
                        <td className="py-3 pr-3">
                          <select
                            value={form.kind}
                            onChange={(event) => {
                              const kind = event.target.value as EbdScheduleKind;
                              setRows((current) => ({
                                ...current,
                                [lesson.lessonNumber]: {
                                  kind,
                                  date: current[lesson.lessonNumber]?.date ?? lesson.date ?? cycle.startsOn,
                                },
                              }));
                            }}
                            className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-xs"
                          >
                            {(Object.keys(KIND_LABELS) as EbdScheduleKind[]).map((kind) => (
                              <option key={kind} value={kind}>{KIND_LABELS[kind]}</option>
                            ))}
                          </select>
                          {form.kind === 'RESCHEDULED' ? (
                            <input
                              type="date"
                              value={form.date}
                              onChange={(event) => {
                                const date = event.target.value;
                                setRows((current) => ({
                                  ...current,
                                  [lesson.lessonNumber]: { ...current[lesson.lessonNumber], date },
                                }));
                              }}
                              className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 text-xs"
                            />
                          ) : null}
                        </td>
                        <td className="py-3 pr-3">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void saveSchedule(lesson.lessonNumber)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                          >
                            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Send className="h-3.5 w-3.5" aria-hidden="true" />}
                            Ajustar somente esta lição
                          </button>
                          {lesson.exceptionKind !== 'RULE' ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void saveSchedule(lesson.lessonNumber, 'RULE')}
                              className="mt-1 inline-flex items-center gap-1 rounded-lg border border-stone-300 px-2 py-1 text-xs font-bold disabled:opacity-60"
                            >
                              <RotateCcw className="h-3 w-3" aria-hidden="true" />
                              Voltar à regra
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="font-serif text-xl font-bold">Reancorar o ciclo</h2>
            <p className="mt-1 text-sm text-stone-600">
              Muda a data de início (e o dia da semana) de todo o ciclo. A regra é recalculada; os ajustes manuais
              sobrevivem e passam a aparecer como divergência para você decidir lição a lição.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="text-sm font-semibold">
                Nova data de início
                <input
                  type="date"
                  value={reanchor.startsOn}
                  onChange={(event) => setReanchor((current) => ({ ...current, startsOn: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm font-semibold">
                Dia da semana
                <select
                  value={reanchor.weekday}
                  onChange={(event) => setReanchor((current) => ({ ...current, weekday: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm"
                >
                  {WEEKDAY_OPTIONS.map((option) => (
                    <option key={option.value} value={String(option.value)}>{option.label}</option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                disabled={reanchorBusy}
                onClick={() => void doReanchor()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {reanchorBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
                Reancorar o ciclo a partir desta data
              </button>
            </div>
          </article>
        </div>

        <aside className="space-y-4">
          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="font-serif text-lg font-bold">Publicação</h2>
            <p className="mt-1 text-sm text-stone-600">
              {cycle.status === 'PUBLISHED'
                ? 'O ciclo está no ar em /ebd.'
                : 'O ciclo está fora da área pública até ser publicado.'}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {cycle.status !== 'PUBLISHED' ? (
                <button
                  type="button"
                  disabled={statusBusy}
                  onClick={() => void cycleAction('publish')}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
                >
                  {statusBusy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                  Publicar ciclo
                </button>
              ) : (
                <button
                  type="button"
                  disabled={statusBusy}
                  onClick={() => void cycleAction('unpublish')}
                  className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold disabled:opacity-60"
                >
                  Despublicar
                </button>
              )}
              <button
                type="button"
                disabled={statusBusy}
                onClick={() => void cycleAction('archive')}
                className="rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold disabled:opacity-60"
              >
                Arquivar
              </button>
            </div>
            <Link to="/ebd" className="mt-3 inline-flex items-center gap-1 text-xs font-bold underline">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Ver área pública
            </Link>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="font-serif text-lg font-bold">Proveniência editorial</h2>
            <p className="mt-1 text-sm font-bold">{cycle.edition.title}</p>
            <p className="text-sm text-stone-600">
              {cycle.edition.publisher} • {editionLabel(cycle.edition.year, cycle.edition.quarter)}
              {cycle.edition.issue ? ` • Edição ${cycle.edition.issue}` : ''}
              {cycle.edition.volume ? ` • Volume ${cycle.edition.volume}` : ''}
            </p>
            <p className="mt-2 break-all text-xs text-stone-500">Slug público: {cycle.slug}</p>
            <p className="text-xs text-stone-500">Primeira data: {formatCivilDateWithWeekday(cycle.firstDate)}</p>
            <p className="text-xs text-stone-500">Última data: {formatCivilDateWithWeekday(cycle.lastDate)}</p>
          </article>

          <article className="rounded-2xl bg-white p-5 shadow">
            <h2 className="font-serif text-lg font-bold">Auditoria da agenda</h2>
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
