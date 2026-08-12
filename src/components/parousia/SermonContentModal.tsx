import { ExternalLink, Headphones, Printer, X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Sermon } from '../../types/parousia';

export function SermonContentModal({ sermon, onClose }: { sermon: Sermon; onClose: () => void }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => { document.body.style.overflow = previous; window.removeEventListener('keydown', closeOnEscape); };
  }, [onClose]);
  const directAudio = sermon.audioUrl && /\.(mp3|m4a|aac|ogg|wav)(\?.*)?$/i.test(sermon.audioUrl);
  const siteName = document.querySelector<HTMLMetaElement>('meta[property="og:site_name"]')?.content || window.location.hostname;
  const canonicalUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.content || `${window.location.origin}${window.location.pathname}`;
  const sermonUrl = `${canonicalUrl.split('#')[0]}#${sermon.slug}`;
  const publicationYear = Number(sermon.data.slice(0, 4)) || new Date().getFullYear();

  return createPortal(<div className="sermon-print-overlay fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/85 p-0 backdrop-blur-sm md:p-8" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <article role="dialog" aria-modal="true" aria-labelledby="sermon-content-title" className="sermon-print-area min-h-full w-full max-w-4xl bg-white text-stone-900 shadow-2xl md:min-h-0 md:rounded-xl">
      <header className="print-hide sticky top-0 z-10 flex items-center justify-between border-b border-stone-200 bg-white/95 px-5 py-4 backdrop-blur"><span className="text-sm font-bold text-stone-500">Mensagem #{sermon.numero}</span><div className="flex gap-2"><button onClick={() => window.print()} className="flex items-center gap-2 rounded-lg border border-stone-300 px-3 py-2 text-sm hover:bg-stone-100"><Printer className="h-4 w-4" />Imprimir / salvar PDF</button><button onClick={onClose} className="rounded-lg p-2 hover:bg-stone-100" aria-label="Fechar"><X className="h-5 w-5" /></button></div></header>
      <div className="px-6 py-10 md:px-14 md:py-14">
        <p className="mb-2 text-sm font-bold uppercase tracking-[.15em] text-amber-700">{sermon.textoBiblico}</p>
        <h1 id="sermon-content-title" className="mb-3 font-serif text-3xl font-bold md:text-4xl">{sermon.titulo}</h1>
        {sermon.descricao && <p className="mb-8 border-b border-stone-200 pb-8 text-lg leading-relaxed text-stone-600">{sermon.descricao}</p>}
        {sermon.audioUrl && <div className="print-hide mb-8 rounded-xl border border-stone-200 bg-stone-50 p-4"><div className="mb-3 flex items-center gap-2 font-bold"><Headphones className="h-5 w-5 text-amber-700" />Áudio da mensagem</div>{directAudio ? <audio controls preload="metadata" className="w-full" src={sermon.audioUrl} /> : <a href={sermon.audioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-amber-700 hover:underline">Ouvir em nova janela <ExternalLink className="h-4 w-4" /></a>}</div>}
        {sermon.conteudoHtml ? <div className="editorial-content" dangerouslySetInnerHTML={{ __html: sermon.conteudoHtml }} /> : <p className="rounded-xl bg-stone-100 p-5 text-stone-500">O conteúdo completo deste sermão ainda não foi publicado.</p>}
        {sermon.materiais && sermon.materiais.length > 0 && <aside className="print-hide mt-10 border-t border-stone-200 pt-6"><h2 className="mb-3 font-bold">Materiais relacionados</h2><div className="flex flex-wrap gap-3">{sermon.materiais.map(material => <a key={`${material.tipo}-${material.url}`} href={material.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 text-sm hover:bg-stone-100">{material.titulo}<ExternalLink className="h-4 w-4" /></a>)}</div></aside>}
      </div>
      <footer className="sermon-print-footer" aria-hidden="true">
        <strong>© {publicationYear} {sermon.pregador || 'Autor não informado'} — {siteName}</strong>
        <span>Uso permitido mediante citação da autoria e da fonte</span>
        <span>{sermonUrl}</span>
      </footer>
    </article>
  </div>, document.body);
}
