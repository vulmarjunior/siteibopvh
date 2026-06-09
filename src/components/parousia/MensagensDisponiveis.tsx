import React from 'react';
import sermoesData from '../../data/sermoes.json';
import { Sermon } from '../../types/parousia';
import { getSermonStatus, getYoutubeEmbedUrl } from '../../lib/parousia-utils';

export const MensagensDisponiveis: React.FC = () => {
  const sermoes: Sermon[] = sermoesData as Sermon[];
  
  const pregados = sermoes.filter(s => {
    const status = getSermonStatus(s);
    return status === 'pregado_materiais_em_breve' || status === 'disponivel';
  });

  const sermoesComVideo = pregados.filter(s => s.youtubeId || s.youtubeUrl);

  return (
    <section id="mensagens" className="py-24 px-6 bg-[#15181d] border-t border-gray-800">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
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
          <div className="space-y-12">
            {sermoesComVideo.map(sermon => {
              const embedUrl = getYoutubeEmbedUrl(sermon.youtubeId, sermon.youtubeUrl);
              return (
                <div key={sermon.numero} className="bg-[#0f1115] rounded-lg overflow-hidden border border-gray-800 shadow-xl">
                  <div className="aspect-video w-full bg-black">
                    {embedUrl ? (
                      <iframe 
                        className="w-full h-full"
                        src={embedUrl} 
                        title={sermon.titulo}
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin" 
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        Vídeo indisponível
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif text-white mb-2">#{sermon.numero} - {sermon.titulo}</h3>
                    <p className="text-gray-400 text-sm">{sermon.textoBiblico}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
