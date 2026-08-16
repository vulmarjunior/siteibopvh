import React from 'react';
import { Sparkles } from 'lucide-react';

interface RecommendationBlockProps {
  content: string;
  contentLabel?: string;
  audience?: string | null;
}

export const RecommendationBlock: React.FC<RecommendationBlockProps> = ({ content, contentLabel, audience }) => {
  const paragraphs = content.trim().split(/\n\s*\n/).filter(Boolean);
  const heading = contentLabel ? `Por que indicamos ${contentLabel}?` : 'Por que indicamos?';

  return (
    <section className="rounded-2xl border border-amber-800/50 bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-900 p-6 shadow-xl sm:p-8">
      <div className="mx-auto max-w-[85ch]">
        <h2 className="flex items-center gap-2 font-serif text-xl font-bold text-amber-300">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-400" />
          {heading}
        </h2>

        <div lang="pt-BR" className="mt-5 space-y-4 text-left text-base leading-8 text-stone-200 hyphens-auto sm:text-[1.0625rem] md:text-justify md:[text-justify:inter-word]">
          {paragraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 24)}`} className="whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>

        {audience ? (
          <p className="mt-6 border-t border-amber-900/40 pt-4 text-sm leading-6 text-stone-300">
            <strong className="text-amber-400">Público recomendado:</strong> {audience}
          </p>
        ) : null}
      </div>
    </section>
  );
};
