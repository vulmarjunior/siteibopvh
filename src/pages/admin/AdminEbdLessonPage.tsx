import { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileText,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';
import { EbdLessonContent } from '../../components/ebd/EbdLessonContent';
import '../../components/ebd/ebd-reader.css';
import {
  AdminEbdPageHeader,
  EbdFeedback,
  EbdStatusBadge,
  formatEbdDate,
} from '../../components/admin/ebd/AdminEbdUi';
import { ebdAdminRequest } from '../../lib/ebd/adminApi';
import { quarterLabel } from '../../lib/ebd/content';
import type {
  EbdAdminLessonDetail,
  EbdAdminPdfAsset,
} from '../../types/ebd-admin';
import type { EbdDailyReading, EbdDay, EbdQuestion, EbdSection } from '../../types/ebd';

const DAYS: EbdDay[] = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];

interface SectionForm {
  key: string;
  number: string;
  title: string;
  paragraphsText: string;
  referencesText: string;
}

interface LessonForm {
  title: string;
  baseText: string;
  startPage: string;
  endPage: string;
  introductionText: string;
  sections: SectionForm[];
  questionsText: string;
  readingsText: string;
}

function toForm(lesson: EbdAdminLessonDetail): LessonForm {
  return {
    title: lesson.title,
    baseText: lesson.baseText,
    startPage: String(lesson.startPage),
    endPage: String(lesson.endPage),
    introductionText: lesson.introduction.join('\n\n'),
    sections: lesson.sections.map((section, index) => ({
      key: `${section.number}-${index}`,
      number: String(section.number),
      title: section.title,
      paragraphsText: section.paragraphs.join('\n\n'),
      referencesText: (section.references || []).join('\n'),
    })),
    questionsText: lesson.questions.map((question) => question.text).join('\n'),
    readingsText: lesson.dailyReadings.map((reading) => `${reading.day} ${reading.reference}`).join('\n'),
  };
}

const splitParagraphs = (value: string): string[] =>
  value.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);

function parseSections(sections: SectionForm[]): { sections: EbdSection[]; errors: string[] } {
  const errors: string[] = [];
  const parsed: EbdSection[] = [];
  sections.forEach((section, index) => {
    const number = Number(section.number);
    const title = section.title.trim();
    const paragraphs = splitParagraphs(section.paragraphsText);
    const references = section.referencesText.split(/\n|;/).map((part) => part.trim()).filter(Boolean);
    if (!Number.isInteger(number) || number < 1) errors.push(`Seção ${index + 1}: informe um número válido.`);
    if (!title) errors.push(`Seção ${index + 1}: informe o título.`);
    if (paragraphs.length === 0) errors.push(`Seção ${index + 1}: informe pelo menos um parágrafo.`);
    if (Number.isInteger(number) && number > 0 && title && paragraphs.length > 0) {
      parsed.push({ number, title, paragraphs, ...(references.length ? { references } : {}) });
    }
  });
  return { sections: parsed.sort((a, b) => a.number - b.number), errors };
}

function parseQuestions(value: string): EbdQuestion[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((text, index) => ({ number: index + 1, text }));
}

function parseReadings(value: string): { readings: EbdDailyReading[]; errors: string[] } {
  const errors: string[] = [];
  const readings: EbdDailyReading[] = [];
  value.split('\n').forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const [rawDay, ...rest] = trimmed.split(/\s+/);
    const day = rawDay.toUpperCase();
    const reference = rest.join(' ').trim();
    if (!DAYS.includes(day as EbdDay)) {
      errors.push(`Leitura diária, linha ${index + 1}: use SEG, TER, QUA, QUI, SEX, SÁB ou DOM.`);
      return;
    }
    if (!reference) {
      errors.push(`Leitura diária, linha ${index + 1}: informe a referência.`);
      return;
    }
    readings.push({ day: day as EbdDay, reference });
  });
  return { readings, errors };
}

export default function AdminEbdLessonPage() {
  const { lessonId = '' } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<EbdAdminLessonDetail | null>(null);
  const [latestPdf, setLatestPdf] = useState<EbdAdminPdfAsset | null>(null);
  const [form, setForm] = useState<LessonForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    setError('');
    try {
      const data = await ebdAdminRequest<{ lesson: EbdAdminLessonDetail; latestPdf: EbdAdminPdfAsset | null }>(`/lessons/${lessonId}`);
      setLesson(data.lesson);
      setLatestPdf(data.latestPdf);
      setForm(toForm(data.lesson));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar a lição.');
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void load();
  }, [load]);

  const preview = useMemo(() => {
    if (!form) return null;
    const sectionResult = parseSections(form.sections);
    const readingResult = parseReadings(form.readingsText);
    return {
      introduction: splitParagraphs(form.introductionText),
      sections: sectionResult.sections,
      questions: parseQuestions(form.questionsText),
      dailyReadings: readingResult.readings,
      errors: [...sectionResult.errors, ...readingResult.errors],
    };
  }, [form]);

  function addSection() {
    if (!form) return;
    const nextNumber = form.sections.reduce((max, section) => Math.max(max, Number(section.number) || 0), 0) + 1;
    setForm({
      ...form,
      sections: [
        ...form.sections,
        {
          key: crypto.randomUUID(),
          number: String(nextNumber),
          title: '',
          paragraphsText: '',
          referencesText: '',
        },
      ],
    });
  }

  function removeSection(key: string) {
    if (!form) return;
    setForm({ ...form, sections: form.sections.filter((section) => section.key !== key) });
  }

  function updateSection(key: string, patch: Partial<SectionForm>) {
    if (!form) return;
    setForm({
      ...form,
      sections: form.sections.map((section) => (section.key === key ? { ...section, ...patch } : section)),
    });
  }

  async function save() {
    if (!lesson || !form || !preview) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const startPage = Number(form.startPage);
      const endPage = Number(form.endPage);
      if (!form.title.trim() || !form.baseText.trim()) throw new Error('Título e texto base são obrigatórios.');
      if (!Number.isInteger(startPage) || startPage < 1 || !Number.isInteger(endPage) || endPage < startPage) {
        throw new Error('Informe um intervalo de páginas válido.');
      }
      if (preview.sections.length === 0) throw new Error('A lição precisa de pelo menos uma seção válida.');
      if (preview.errors.length > 0) throw new Error(preview.errors.join(' '));

      await ebdAdminRequest(`/lessons/${lesson.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: form.title.trim(),
          baseText: form.baseText.trim(),
          startPage,
          endPage,
          introduction: preview.introduction,
          sections: preview.sections,
          questions: preview.questions,
          dailyReadings: preview.dailyReadings,
        }),
      });
      setNotice('Lição salva como rascunho. Revise a prévia e publique quando estiver pronta.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar a lição.');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish() {
    if (!lesson) return;
    const action = lesson.status === 'PUBLISHED' ? 'unpublish' : 'publish';
    setStatusBusy(true);
    setError('');
    setNotice('');
    try {
      await ebdAdminRequest(`/lessons/${lesson.id}/${action}`, { method: 'POST' });
      setNotice(action === 'publish' ? 'Lição publicada.' : 'Lição despublicada.');
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível alterar a publicação.');
    } finally {
      setStatusBusy(false);
    }
  }

  if (loading && !lesson) {
    return (
      <main className="min-h-screen bg-stone-100 p-8">
        <div className="grid place-items-center py-24"><Loader2 className="h-9 w-9 animate-spin text-amber-600" aria-label="Carregando lição" /></div>
      </main>
    );
  }

  if (!lesson || !form) {
    return (
      <main className="min-h-screen bg-stone-100 p-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow">
          <h1 className="font-serif text-2xl font-bold">Lição indisponível</h1>
          <p className="mt-2 text-sm text-stone-600">{error || 'Lição não encontrada.'}</p>
          <Link to="/admin/ebd" className="mt-4 inline-flex rounded-xl bg-stone-900 px-4 py-2 text-sm font-bold text-white">Voltar à EBD</Link>
        </div>
      </main>
    );
  }

  const pdfUrl = latestPdf ? `/api/ebd/admin/quarters/${lesson.quarterId}/pdf?assetId=${latestPdf.id}` : null;

  return (
    <main className="min-h-screen bg-stone-100 text-stone-900">
      <Helmet>
        <title>{`Lição ${lesson.number} — EBD Digital`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminEbdPageHeader
        title={`Lição ${lesson.number} — ${lesson.title}`}
        subtitle={`${quarterLabel(lesson.quarter.year, lesson.quarter.quarter)} • ${lesson.quarter.className} • ${lesson.baseText}`}
        backTo={`/admin/ebd/${lesson.quarterId}`}
        backLabel="Voltar ao trimestre"
        actions={<EbdStatusBadge status={lesson.status} />}
      />

      <section className="mx-auto max-w-7xl space-y-5 p-5">
        <EbdFeedback error={error} notice={notice} />

        <div className="rounded-2xl bg-white p-5 shadow">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-stone-500">
              Última atualização: {formatEbdDate(lesson.updatedAt)} • Revisada por: {lesson.reviewedBy || '—'}
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-stone-900 px-3 py-2 text-xs font-bold text-white hover:bg-stone-800 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
                {saving ? 'Salvando…' : 'Salvar revisão'}
              </button>
              <button
                type="button"
                onClick={() => void togglePublish()}
                disabled={statusBusy}
                className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold disabled:opacity-50 ${lesson.status === 'PUBLISHED' ? 'border border-stone-300 hover:bg-stone-50' : 'bg-emerald-700 text-white hover:bg-emerald-800'}`}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                {lesson.status === 'PUBLISHED' ? 'Despublicar' : 'Publicar lição'}
              </button>
              <Link to={`/admin/ebd/${lesson.quarterId}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-stone-300 px-3 py-2 text-xs font-bold hover:bg-stone-50">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Trimestre
              </Link>
            </div>
          </div>
          <p className="mt-2 text-xs text-stone-500">
            Salvar uma alteração volta a lição para <strong>rascunho</strong> e exige nova publicação.
          </p>
        </div>

        <section className="rounded-2xl bg-white p-5 shadow" aria-labelledby="conteudo-titulo">
          <h2 id="conteudo-titulo" className="font-serif text-xl font-bold">Conteúdo estruturado</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-bold text-stone-700">
              Título da lição
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 font-normal"
              />
            </label>
            <label className="text-sm font-bold text-stone-700">
              Texto base
              <input
                value={form.baseText}
                onChange={(event) => setForm({ ...form, baseText: event.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 font-normal"
              />
            </label>
            <label className="text-sm font-bold text-stone-700">
              Página inicial
              <input
                type="number"
                min={1}
                value={form.startPage}
                onChange={(event) => setForm({ ...form, startPage: event.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 font-normal"
              />
            </label>
            <label className="text-sm font-bold text-stone-700">
              Página final
              <input
                type="number"
                min={1}
                value={form.endPage}
                onChange={(event) => setForm({ ...form, endPage: event.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 font-normal"
              />
            </label>
          </div>

          <label className="mt-4 block text-sm font-bold text-stone-700">
            Introdução
            <span className="ml-1 font-normal text-stone-500">(parágrafos separados por linha em branco)</span>
            <textarea
              rows={6}
              value={form.introductionText}
              onChange={(event) => setForm({ ...form, introductionText: event.target.value })}
              className="mt-1 w-full rounded-xl border border-stone-300 p-3 font-normal leading-relaxed"
            />
          </label>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-serif text-lg font-bold">Seções</h3>
            <button type="button" onClick={addSection} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-bold hover:bg-stone-50">
              <Plus className="h-4 w-4" aria-hidden="true" /> Adicionar seção
            </button>
          </div>

          <div className="mt-3 space-y-4">
            {form.sections.map((section, index) => (
              <fieldset key={section.key} className="rounded-xl border border-stone-200 p-3">
                <legend className="px-1 text-xs font-bold uppercase tracking-wide text-stone-500">Seção {index + 1}</legend>
                <div className="grid gap-2 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-end">
                  <label className="text-sm font-bold text-stone-700">
                    Número
                    <input
                      type="number"
                      min={1}
                      value={section.number}
                      onChange={(event) => updateSection(section.key, { number: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-stone-300 p-2 font-normal"
                    />
                  </label>
                  <label className="text-sm font-bold text-stone-700">
                    Título da seção
                    <input
                      value={section.title}
                      onChange={(event) => updateSection(section.key, { title: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-stone-300 p-2 font-normal"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeSection(section.key)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Remover
                  </button>
                </div>
                <label className="mt-2 block text-sm font-bold text-stone-700">
                  Parágrafos
                  <span className="ml-1 font-normal text-stone-500">(linha em branco separa parágrafos)</span>
                  <textarea
                    rows={6}
                    value={section.paragraphsText}
                    onChange={(event) => updateSection(section.key, { paragraphsText: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-stone-300 p-2 font-normal leading-relaxed"
                  />
                </label>
                <label className="mt-2 block text-sm font-bold text-stone-700">
                  Referências
                  <span className="ml-1 font-normal text-stone-500">(uma por linha ou separadas por ponto e vírgula)</span>
                  <textarea
                    rows={2}
                    value={section.referencesText}
                    onChange={(event) => updateSection(section.key, { referencesText: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-stone-300 p-2 font-normal"
                  />
                </label>
              </fieldset>
            ))}
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            <label className="text-sm font-bold text-stone-700">
              Para pensar e agir
              <span className="ml-1 font-normal text-stone-500">(uma pergunta por linha)</span>
              <textarea
                rows={6}
                value={form.questionsText}
                onChange={(event) => setForm({ ...form, questionsText: event.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 p-3 font-normal leading-relaxed"
              />
            </label>
            <label className="text-sm font-bold text-stone-700">
              Leitura diária
              <span className="ml-1 font-normal text-stone-500">(uma linha por dia: SEG Referência)</span>
              <textarea
                rows={6}
                value={form.readingsText}
                onChange={(event) => setForm({ ...form, readingsText: event.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 p-3 font-normal leading-relaxed"
              />
            </label>
          </div>

          {preview?.errors.length ? (
            <ul className="mt-3 list-disc rounded-xl bg-amber-50 p-3 pl-7 text-xs text-amber-900">
              {preview.errors.map((message) => <li key={message}>{message}</li>)}
            </ul>
          ) : null}

          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white hover:bg-stone-800 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {saving ? 'Salvando…' : 'Salvar revisão'}
          </button>
        </section>

        <div className="grid gap-5 xl:grid-cols-2 xl:items-start">
          <section className="rounded-2xl bg-white p-5 shadow" aria-labelledby="previa-titulo">
            <h2 id="previa-titulo" className="flex items-center gap-2 font-serif text-xl font-bold">
              <Eye className="h-5 w-5 text-amber-600" aria-hidden="true" /> Prévia do texto
            </h2>
            <div className="ebd-reader mt-3 rounded-xl border border-stone-200 p-4" data-theme="light">
              {preview ? (
                <div className="ebd-article" style={{ fontSize: '1rem' }}>
                  <EbdLessonContent
                    introduction={preview.introduction}
                    sections={preview.sections}
                    questions={preview.questions}
                    dailyReadings={preview.dailyReadings}
                    sectionIdPrefix="preview-secao"
                  />
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow" aria-labelledby="pdf-original-titulo">
            <h2 id="pdf-original-titulo" className="flex items-center gap-2 font-serif text-xl font-bold">
              <FileText className="h-5 w-5 text-amber-600" aria-hidden="true" /> PDF original
            </h2>
            {pdfUrl ? (
              <>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-stone-500">v{latestPdf?.version} • {latestPdf?.fileName}</p>
                  <a href={pdfUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-amber-700 underline">
                    Abrir em nova aba
                  </a>
                </div>
                <iframe
                  title="PDF original da revista"
                  src={pdfUrl}
                  className="mt-2 h-[70vh] w-full rounded-xl border border-stone-200"
                />
              </>
            ) : (
              <p className="mt-3 text-sm text-stone-500">
                Nenhum PDF registrado para este trimestre. Volte ao trimestre e envie o PDF.
              </p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
