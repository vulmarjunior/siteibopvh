import React, { useState } from 'react';
import sermoesData from '../../data/sermoes.json';
import { Sermon } from '../../types/parousia';
import { getSermonStatus, getYoutubeEmbedUrl } from '../../lib/parousia-utils';
import { MessageCard } from './MessageCard';
import { VideoModal } from './VideoModal';

export const MensagensDisponiveis: React.FC = () => {
  const [sermonAtivo, setSermonAtivo] = useState<Sermon | null>(null);
  const sermoes: Sermon[] = sermoesData as Sermon[];

  const pregados = sermoes.filter(s => {
    const status = getSermonStatus(s);
    return status === 'pregado_materiais_em_breve' || status === 'disponivel';
  });

  const sermoesComVideo = pregados.filter(s => s.youtubeId || s.youtubeUrl);

  return (
    <section id="mensagens" className="py-24 px-6 bg-[#15181d] border-t border-gray-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Mensagens Disponíveis</h2>
          <p className="text-gray-400">
            Reveja as mensagens já pregadas na série.
          </p>
        </div>

        {pregados.length === 0 ? (
          <div className="text-center p-12 bg-[#0f1115] rounded-lg border border-gray-800">
            <p className="text-gray-400">As mensagens serão disponibilizadas aqui à medida que forem pregadas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sermoesComVideo.map(sermon => (
              <MessageCard
                key={sermon.numero}
                sermon={sermon}
                onClick={() => setSermonAtivo(sermon)}
              />
            ))}
          </div>
        )}

        <VideoModal
          isOpen={sermonAtivo !== null}
          embedUrl={sermonAtivo ? getYoutubeEmbedUrl(sermonAtivo.youtubeId, sermonAtivo.youtubeUrl) : ''}
          titulo={sermonAtivo ? `#${sermonAtivo.numero} - ${sermonAtivo.titulo}` : ''}
          onClose={() => setSermonAtivo(null)}
        />
      </div>
    </section>
  );
};
