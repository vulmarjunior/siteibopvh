import React, { useState, useEffect } from 'react';
import { Play, Download, Image as ImageIcon, Share2, BookOpen, CheckCircle2, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { Sermon } from '../../types/parousia';
import { getSermonStatus, getYoutubeWatchUrl, SermonStatus } from '../../lib/parousia-utils';
import { StatusBadge } from './StatusBadge';

interface SermonCardProps {
  sermon: Sermon;
}

export const SermonCard: React.FC<SermonCardProps> = ({ sermon }) => {
  const [showLeituras, setShowLeituras] = useState(false);
  const [leiturasConcluidas, setLeiturasConcluidas] = useState<Record<string, boolean>>({});

  const status = getSermonStatus(sermon);
  
  // Format date correctly from YYYY-MM-DD
  const dateObj = new Date(`${sermon.data}T00:00:00`);
  const formattedDate = dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const watchUrl = getYoutubeWatchUrl(sermon.youtubeId, sermon.youtubeUrl);
  const thumbUrl = sermon.artes?.thumb || '/images/serie-da-ascensao-a-parousia/thumb-padrao.jpg';

  // Load saved state
  useEffect(() => {
    if (sermon.leituras) {
      const saved = localStorage.getItem(`parousia-leituras-${sermon.numero}`);
      if (saved) {
        try {
          setLeiturasConcluidas(JSON.parse(saved));
        } catch (e) {
          // ignore parsing error
        }
      }
    }
  }, [sermon.numero, sermon.leituras]);

  const toggleLeitura = (dia: string) => {
    const newState = {
      ...leiturasConcluidas,
      [dia]: !leiturasConcluidas[dia]
    };
    setLeiturasConcluidas(newState);
    localStorage.setItem(`parousia-leituras-${sermon.numero}`, JSON.stringify(newState));
  };

  const handleShareWhatsApp = () => {
    const text = `Olá! Quero te convidar para acompanhar uma mensagem da série “Da Ascensão à Parousia”.\n\nTema: ${sermon.titulo}\nTexto: ${sermon.textoBiblico}\n\nVeja aqui:\n${window.location.origin}/da-ascensao-a-parousia`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-[#1a1d24] rounded-lg overflow-hidden border border-gray-800 flex flex-col h-full transition-transform hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full bg-gray-900 border-b border-gray-800">
        <img 
          src={thumbUrl} 
          alt={sermon.titulo}
          className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
          loading="lazy"
        />
        <div className="absolute top-4 left-4">
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3 text-sm text-gray-400">
          <span className="font-mono text-[#d4af37]">#{sermon.numero}</span>
          <span>{formattedDate}</span>
        </div>

        <h3 className="text-xl font-serif text-white mb-2">{sermon.titulo}</h3>
        <p className="text-sm font-medium text-gray-400 mb-4">{sermon.textoBiblico} • {sermon.movimento}</p>
        
        <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
          {sermon.descricao}
        </p>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-800/50 mt-auto">
          {watchUrl && (
            <a 
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d4af37]/10 text-[#d4af37] text-sm rounded hover:bg-[#d4af37]/20 transition-colors"
            >
              <Play className="w-4 h-4" />
              Assistir
            </a>
          )}
          
          {sermon.pdfUrl && (
            <a 
              href={sermon.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Esboço
            </a>
          )}

          {sermon.leituras && (
            <button 
              onClick={() => setShowLeituras(!showLeituras)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${showLeituras ? 'bg-[#d4af37] text-[#0f1115]' : 'bg-gray-800 text-[#d4af37] hover:bg-gray-700'}`}
            >
              <BookOpen className="w-4 h-4" />
              Roteiro de Leitura
              {showLeituras ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          <button 
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 text-gray-300 text-sm rounded hover:text-white hover:bg-gray-700 transition-colors ml-auto"
            title="Compartilhar"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {status === 'pregado_materiais_em_breve' && (
           <p className="text-xs text-gray-500 mt-4 italic text-center">
             Os materiais deste sermão serão disponibilizados em breve.
           </p>
        )}

        {/* Leituras Devocionais (Accordion) */}
        {showLeituras && sermon.leituras && (
          <div className="mt-6 pt-4 border-t border-gray-800">
            <h4 className="text-[#d4af37] font-serif text-lg mb-1">{sermon.leituras.tema}</h4>
            <p className="text-xs text-gray-500 mb-4">Acompanhe a leitura diária durante a semana</p>
            
            <div className="space-y-3">
              {sermon.leituras.dias.map((leitura, idx) => {
                const isChecked = !!leiturasConcluidas[leitura.dia];
                return (
                  <div 
                    key={idx}
                    onClick={() => toggleLeitura(leitura.dia)}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isChecked ? 'bg-[#d4af37]/10 border-[#d4af37]/30' : 'bg-[#0f1115] border-gray-800 hover:border-gray-700'}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-[#d4af37]" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className={`text-sm font-bold mb-1 transition-colors ${isChecked ? 'text-[#d4af37]' : 'text-gray-300'}`}>
                        {leitura.dia}: {leitura.texto}
                      </p>
                      <p className={`text-xs leading-relaxed transition-colors ${isChecked ? 'text-gray-400' : 'text-gray-500'}`}>
                        {leitura.descricao}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
