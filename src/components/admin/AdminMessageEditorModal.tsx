import { Save, X } from 'lucide-react';
import { useEffect } from 'react';
import { cleanPastedHtml, RichTextEditor } from './RichTextEditor';

export type ReadingDayForm = { dayLabel: string; biblicalText: string; description: string };
export type EditorialMessageForm = {
  id?: string; order: number; title: string; slug: string; scheduledFor: string;
  biblicalText: string; speaker: string; summary: string; contentHtml: string; status: string;
  videoUrl: string; audioUrl: string; materialTitle: string; materialUrl: string;
  readingTheme: string; readingDays: ReadingDayForm[]; sourceSystem: string; externalId: string;
};

const input = 'mt-1 w-full rounded-lg border border-stone-700 bg-stone-950 px-3 py-2 text-sm';

export function AdminMessageEditorModal({ value, saving, onChange, onClose, onSubmit }: {
  value: EditorialMessageForm; saving: boolean; onChange: (value: EditorialMessageForm) => void;
  onClose: () => void; onSubmit: (event: React.FormEvent, contentHtml: string) => void;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !saving) onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', closeOnEscape); };
  }, [onClose, saving]);

  const updateDay = (index: number, patch: Partial<ReadingDayForm>) => onChange({ ...value, readingDays: value.readingDays.map((day, current) => current === index ? { ...day, ...patch } : day) });
  return <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-0 backdrop-blur-sm md:p-6" onMouseDown={event => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <form onSubmit={event => onSubmit(event, cleanPastedHtml((event.currentTarget.querySelector('[contenteditable="true"]') as HTMLElement | null)?.innerHTML || value.contentHtml))} role="dialog" aria-modal="true" aria-labelledby="message-editor-title" className="flex h-full w-full max-w-5xl flex-col overflow-hidden bg-stone-900 shadow-2xl md:h-[calc(100vh-3rem)] md:rounded-2xl md:border md:border-amber-700/40">
      <header className="flex shrink-0 items-center justify-between border-b border-stone-800 px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-amber-500">{value.id ? `Mensagem ${String(value.order).padStart(2, '0')}` : 'Nova mensagem'}</p><h2 id="message-editor-title" className="font-serif text-xl font-bold">{value.id ? value.title : 'Cadastrar mensagem'}</h2></div><button type="button" onClick={onClose} disabled={saving} className="rounded-lg p-2 text-stone-400 hover:bg-stone-800 hover:text-white" aria-label="Fechar editor"><X className="h-5 w-5" /></button></header>
      <div className="flex-1 space-y-7 overflow-y-auto px-5 py-6">
        <section><h3 className="mb-3 text-sm font-bold text-amber-400">Informações da mensagem</h3><div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">Número*<input required type="number" min="1" className={input} value={value.order} onChange={event => onChange({ ...value, order: Number(event.target.value) })} /></label>
          <label className="text-sm">Data e horário*<input required type="datetime-local" className={input} value={value.scheduledFor} onChange={event => onChange({ ...value, scheduledFor: event.target.value })} /></label>
          <label className="text-sm md:col-span-2">Título*<input required className={input} value={value.title} onChange={event => onChange({ ...value, title: event.target.value })} /></label>
          <label className="text-sm">Texto bíblico*<input required className={input} value={value.biblicalText} onChange={event => onChange({ ...value, biblicalText: event.target.value })} /></label>
          <label className="text-sm">Pregador<input className={input} value={value.speaker} onChange={event => onChange({ ...value, speaker: event.target.value })} /></label>
          <label className="text-sm md:col-span-2">Resumo<textarea className={input} rows={2} value={value.summary} onChange={event => onChange({ ...value, summary: event.target.value })} /></label>
        </div></section>
        <section><div className="mb-3"><h3 className="text-sm font-bold text-amber-400">Conteúdo completo</h3><p className="mt-1 text-xs text-stone-500">Cole aqui o conteúdo produzido no TinyMCE do gestor de sermões.</p></div><RichTextEditor value={value.contentHtml} onChange={contentHtml => onChange({ ...value, contentHtml })} /></section>
        <section><h3 className="mb-3 text-sm font-bold text-amber-400">Mídias e material externo</h3><div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm">Vídeo por URL<input type="url" className={input} value={value.videoUrl} onChange={event => onChange({ ...value, videoUrl: event.target.value })} /></label>
          <label className="text-sm">Áudio por URL<input type="url" className={input} value={value.audioUrl} onChange={event => onChange({ ...value, audioUrl: event.target.value })} /></label>
          <label className="text-sm">Título do material<input className={input} value={value.materialTitle} onChange={event => onChange({ ...value, materialTitle: event.target.value })} /></label>
          <label className="text-sm">Material por URL<input type="url" className={input} value={value.materialUrl} onChange={event => onChange({ ...value, materialUrl: event.target.value })} /></label>
        </div></section>
        <section><h3 className="mb-3 text-sm font-bold text-amber-400">Plano de leitura</h3><label className="block text-sm">Tema<input className={input} value={value.readingTheme} onChange={event => onChange({ ...value, readingTheme: event.target.value })} /></label>{value.readingTheme && <div className="mt-4 space-y-3">{value.readingDays.map((day, index) => <div key={index} className="grid gap-3 rounded-xl border border-stone-800 bg-stone-950 p-3 md:grid-cols-3"><input aria-label="Dia" className={input} value={day.dayLabel} onChange={event => updateDay(index, { dayLabel: event.target.value })} /><input aria-label="Texto bíblico da leitura" className={input} value={day.biblicalText} onChange={event => updateDay(index, { biblicalText: event.target.value })} /><input aria-label="Descrição da leitura" className={input} value={day.description} onChange={event => updateDay(index, { description: event.target.value })} /></div>)}<button type="button" onClick={() => onChange({ ...value, readingDays: [...value.readingDays, { dayLabel: '', biblicalText: '', description: '' }] })} className="text-sm text-amber-400">+ Adicionar leitura</button></div>}</section>
        <label className="block max-w-xs text-sm">Status<select className={input} value={value.status} onChange={event => onChange({ ...value, status: event.target.value })}><option value="DRAFT">Rascunho</option><option value="SCHEDULED">Agendada</option><option value="PUBLISHED">Publicada</option><option value="ARCHIVED">Arquivada</option></select></label>
      </div>
      <footer className="flex shrink-0 justify-end gap-3 border-t border-stone-800 bg-stone-900 px-5 py-4"><button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-stone-700 px-5 py-2 text-sm">Cancelar</button><button disabled={saving} className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2 font-bold text-stone-950"><Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar mensagem'}</button></footer>
    </form>
  </div>;
}
