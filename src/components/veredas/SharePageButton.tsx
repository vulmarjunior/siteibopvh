import React, { useEffect, useRef, useState } from 'react';
import { Check, Copy, Facebook, Mail, MessageCircle, MoreHorizontal, Send, Share2, X } from 'lucide-react';

interface SharePageButtonProps {
  title: string;
  contentType?: 'Livro' | 'Vídeo' | 'Conferência' | 'Curso' | string;
  imageUrl?: string | null;
}

const siteUrl = 'https://ibopvh.com.br';

export const SharePageButton: React.FC<SharePageButtonProps> = ({ title, contentType, imageUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const url = typeof window === 'undefined' ? siteUrl : `${siteUrl}${window.location.pathname}`;
  const shareText = `Encontrei esta indicação no Veredas IBO: “${title}”. Confira por que este conteúdo foi recomendado:`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      triggerButtonRef.current?.focus();
    };
  }, [isOpen]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      console.error('Não foi possível copiar o link:', error);
    }
  };

  const openNativeShare = async () => {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title, text: shareText, url });
      setIsOpen(false);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Não foi possível compartilhar a página:', error);
    }
  };

  const secondaryActions = [
    { id: 'copy', label: copied ? 'Link copiado' : 'Copiar link', icon: copied ? Check : Copy, onClick: () => void copyLink() },
    { id: 'telegram', label: 'Telegram', icon: Send, href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
    { id: 'facebook', label: 'Facebook', icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { id: 'email', label: 'E-mail', icon: Mail, href: `mailto:?subject=${encodeURIComponent(`Indicação Veredas IBO: ${title}`)}&body=${encodeURIComponent(`${shareText}\n\n${url}`)}` },
  ];

  return (
    <>
      <button ref={triggerButtonRef} type="button" onClick={() => setIsOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-300 transition-colors hover:border-amber-700 hover:text-amber-400" aria-label={`Indicar ${title} a alguém`} aria-haspopup="dialog" aria-expanded={isOpen}>
        <Share2 className="h-4 w-4" /> Indicar a alguém
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(event) => { if (event.currentTarget === event.target) setIsOpen(false); }}>
          <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="share-dialog-title" className="w-full max-w-lg overflow-hidden rounded-t-3xl border border-stone-700 bg-stone-900 shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between gap-4 border-b border-stone-800 px-5 py-4 sm:px-6">
              <div>
                <h2 id="share-dialog-title" className="font-serif text-xl font-bold text-amber-100">Compartilhe esta indicação</h2>
                <p className="mt-1 text-xs text-stone-400">Ajude alguém a encontrar um bom caminho de leitura e aprendizado.</p>
              </div>
              <button ref={closeButtonRef} type="button" onClick={() => setIsOpen(false)} className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-800 hover:text-stone-100" aria-label="Fechar opções de compartilhamento"><X className="h-5 w-5" /></button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center gap-4 rounded-2xl border border-amber-900/50 bg-gradient-to-br from-amber-950/40 to-stone-950 p-4">
                <div className="flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-stone-700 bg-stone-800">
                  {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : <Share2 className="h-7 w-7 text-amber-500" />}
                </div>
                <div className="min-w-0">
                  {contentType ? <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">{contentType}</p> : null}
                  <p className="mt-1 line-clamp-2 font-serif text-base font-bold leading-snug text-stone-100">{title}</p>
                  <p className="mt-1 text-xs text-stone-400">Indicação Veredas IBO</p>
                </div>
              </div>

              <a href={`https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${url}`)}`} target="_blank" rel="noopener noreferrer" onClick={() => setIsOpen(false)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition-colors hover:bg-emerald-500">
                <MessageCircle className="h-5 w-5" /> Enviar pelo WhatsApp
              </a>

              <div className="grid grid-cols-4 gap-2">
                {secondaryActions.map(({ id, label, icon: Icon, href, onClick }) => {
                  const className = 'flex min-w-0 flex-col items-center gap-2 rounded-xl border border-stone-700 bg-stone-950 px-1 py-3 text-[11px] font-medium text-stone-300 transition-colors hover:border-amber-700 hover:text-amber-400';
                  const content = <><Icon className="h-5 w-5" /><span className="w-full truncate text-center">{label}</span></>;
                  return href ? <a key={id} href={href} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" onClick={() => setIsOpen(false)} className={className}>{content}</a> : <button key={id} type="button" onClick={onClick} className={className}>{content}</button>;
                })}
              </div>

              <button type="button" onClick={() => void openNativeShare()} className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-700 px-4 py-3 text-xs font-semibold text-stone-300 transition-colors hover:border-amber-700 hover:text-amber-400">
                <MoreHorizontal className="h-4 w-4" /> {navigator.share ? 'Mais opções do dispositivo' : 'Copiar link para compartilhar'}
              </button>
              {copied ? <p role="status" className="text-center text-xs font-medium text-emerald-400">Link copiado. Agora você pode enviar onde quiser.</p> : null}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
};
