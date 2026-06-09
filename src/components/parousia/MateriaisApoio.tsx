import React from 'react';
import { Download, FileText, Image as ImageIcon } from 'lucide-react';

export const MateriaisApoio: React.FC = () => {
  const materiais = [
    {
      titulo: 'Cronograma da Série',
      desc: 'Lista completa das datas e textos bíblicos.',
      icon: <FileText className="w-6 h-6 text-[#d4af37]" />,
      url: '/docs/serie-da-ascensao-a-parousia/cronograma.pdf',
      status: 'Disponível'
    },
    {
      titulo: 'Guia de Leitura',
      desc: 'Plano de leitura devocional para acompanhar a série.',
      icon: <FileText className="w-6 h-6 text-[#d4af37]" />,
      url: '/docs/serie-da-ascensao-a-parousia/guia-leituras.pdf',
      status: 'Disponível'
    },
    {
      titulo: 'Arte para Feed (Quadrada)',
      desc: 'Imagem para você compartilhar no feed do Instagram ou WhatsApp.',
      icon: <ImageIcon className="w-6 h-6 text-[#d4af37]" />,
      url: '/images/serie-da-ascensao-a-parousia/arte-feed.png',
      status: 'Disponível'
    },
    {
      titulo: 'Arte para Story',
      desc: 'Imagem vertical para você compartilhar no seu Story.',
      icon: <ImageIcon className="w-6 h-6 text-[#d4af37]" />,
      url: '/images/serie-da-ascensao-a-parousia/arte-story.png',
      status: 'Disponível'
    }
  ];

  return (
    <section id="materiais" className="py-24 px-6 bg-[#0f1115]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Materiais de Apoio</h2>
          <p className="text-gray-400">Recursos adicionais para sua peregrinação e pequenos grupos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materiais.map((mat, idx) => (
            <div key={idx} className="bg-[#1a1d24] p-6 rounded-lg border border-gray-800 flex flex-col hover:border-gray-700 transition-colors">
              <div className="mb-4 bg-[#0f1115] w-12 h-12 rounded-full flex items-center justify-center border border-gray-800">
                {mat.icon}
              </div>
              <h3 className="text-lg text-white font-medium mb-2">{mat.titulo}</h3>
              <p className="text-sm text-gray-400 mb-6 flex-grow">{mat.desc}</p>
              
              {mat.status === 'Disponível' ? (
                <a 
                  href={mat.url}
                  download
                  className="flex items-center justify-center gap-2 w-full py-2 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Baixar material
                </a>
              ) : (
                <button 
                  disabled
                  className="flex items-center justify-center gap-2 w-full py-2 bg-[#0f1115] text-gray-600 rounded border border-gray-800 cursor-not-allowed text-sm font-medium"
                >
                  Em breve
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
