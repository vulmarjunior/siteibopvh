import { Bold, Eye, Heading2, Italic, Link, List, ListOrdered, Quote } from 'lucide-react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function cleanPastedHtml(value: string): string {
  const documentNode = new DOMParser().parseFromString(value, 'text/html');
  documentNode.querySelectorAll('script, style, iframe, object, embed, form, input, button').forEach(node => node.remove());
  documentNode.body.querySelectorAll('*').forEach(element => {
    [...element.attributes].forEach(attribute => {
      const name = attribute.name.toLowerCase();
      const dangerousUrl = ['href', 'src'].includes(name) && /^\s*(javascript|data):/i.test(attribute.value);
      if (name.startsWith('on') || name === 'style' || name === 'class' || name === 'id' || dangerousUrl) element.removeAttribute(attribute.name);
    });
  });
  return documentNode.body.innerHTML.trim();
}

export interface RichTextEditorHandle {
  getHtml: () => string;
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(function RichTextEditor({ value, onChange }, ref) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState(false);

  useImperativeHandle(ref, () => ({
    getHtml: () => cleanPastedHtml(editorRef.current?.innerHTML || value),
  }), [value]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) editorRef.current.innerHTML = value;
  }, [value, preview]);

  function command(name: string, argument?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, argument);
    onChange(cleanPastedHtml(editorRef.current?.innerHTML || ''));
  }

  function addLink() {
    const url = window.prompt('Endereço do link:');
    if (url && /^https?:\/\//i.test(url)) command('createLink', url);
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();
    const html = event.clipboardData.getData('text/html');
    const plain = event.clipboardData.getData('text/plain');
    const content = html ? cleanPastedHtml(html) : plain.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br>');
    document.execCommand('insertHTML', false, html ? content : `<p>${content}</p>`);
    onChange(cleanPastedHtml(editorRef.current?.innerHTML || ''));
  }

  const buttonClass = 'rounded-md p-2 text-stone-300 hover:bg-stone-700 hover:text-white';
  return (
    <div className="overflow-hidden rounded-xl border border-stone-700 bg-stone-950">
      <div className="flex flex-wrap items-center gap-1 border-b border-stone-700 bg-stone-900 p-2">
        <button type="button" className={buttonClass} title="Título" aria-label="Título" onClick={() => command('formatBlock', 'h2')}><Heading2 className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} title="Negrito" aria-label="Negrito" onClick={() => command('bold')}><Bold className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} title="Itálico" aria-label="Itálico" onClick={() => command('italic')}><Italic className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} title="Citação" aria-label="Citação" onClick={() => command('formatBlock', 'blockquote')}><Quote className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} title="Lista" aria-label="Lista" onClick={() => command('insertUnorderedList')}><List className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} title="Lista numerada" aria-label="Lista numerada" onClick={() => command('insertOrderedList')}><ListOrdered className="h-4 w-4" /></button>
        <button type="button" className={buttonClass} title="Link" aria-label="Link" onClick={addLink}><Link className="h-4 w-4" /></button>
        <span className="mx-1 h-5 w-px bg-stone-700" />
        <button type="button" className={`${buttonClass} flex items-center gap-2 px-3 text-xs ${preview ? 'bg-amber-700 text-white' : ''}`} onClick={() => setPreview(current => !current)}><Eye className="h-4 w-4" />{preview ? 'Editar' : 'Prévia'}</button>
      </div>
      {preview ? (
        <article className="editorial-content min-h-64 bg-white p-6 text-stone-900" dangerouslySetInnerHTML={{ __html: cleanPastedHtml(value) }} />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label="Conteúdo completo do sermão"
          aria-multiline="true"
          className="editorial-content min-h-64 bg-white p-6 text-stone-900 outline-none"
          onInput={event => onChange(cleanPastedHtml(event.currentTarget.innerHTML))}
          onPaste={handlePaste}
        />
      )}
      <p className="border-t border-stone-700 bg-stone-900 px-3 py-2 text-xs text-stone-500">Cole diretamente do gestor de sermões. Formatações incompatíveis serão removidas automaticamente.</p>
    </div>
  );
});
