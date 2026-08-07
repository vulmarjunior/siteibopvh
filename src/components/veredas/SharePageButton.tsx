import React, { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

interface SharePageButtonProps {
  title: string;
}

export const SharePageButton: React.FC<SharePageButtonProps> = ({ title }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = 'https://ibopvh.com.br' + window.location.pathname;
    const shareData = {
      title,
      text: 'Confira esta indicação do Veredas IBO.',
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      console.error('Não foi possível compartilhar a página:', error);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      className="inline-flex items-center gap-1.5 rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-xs font-semibold text-stone-300 transition-colors hover:border-amber-700 hover:text-amber-400"
      aria-label={`Compartilhar ${title}`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? 'Link copiado' : 'Compartilhar'}
    </button>
  );
};