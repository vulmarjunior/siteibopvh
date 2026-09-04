import React, { useState } from 'react';
import { X, BookOpen, Scroll, Shield, Quote } from 'lucide-react';
import { HISTORIAN_DOCUMENTS } from '../../data/baptistHistoryData';

interface HistoryHistorianChestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryHistorianChestModal: React.FC<HistoryHistorianChestModalProps> = ({ isOpen, onClose }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(HISTORIAN_DOCUMENTS[0].id);

  if (!isOpen) return null;

  const currentDoc = HISTORIAN_DOCUMENTS.find((d) => d.id === selectedDocId) || HISTORIAN_DOCUMENTS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-900 border border-amber-500/30 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100 relative">
        {/* Cabecalho do Modal */}
        <div className="p-5 md:p-6 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Scroll className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-serif font-bold text-white">
                Baú do Historiador
              </h3>
              <p className="text-xs text-amber-300/80 font-medium">
                Documentos e fontes primárias dos pioneiros batistas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Navegacao Lateral e Leitura */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Menu Lateral de Documentos */}
          <div className="w-full md:w-1/3 bg-stone-950/60 p-4 border-b md:border-b-0 md:border-r border-stone-800 overflow-y-auto max-h-48 md:max-h-none">
            <p className="text-[11px] uppercase tracking-widest text-stone-400 font-bold mb-3">
              Selecione o Documento:
            </p>
            <div className="space-y-2">
              {HISTORIAN_DOCUMENTS.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all text-xs flex flex-col gap-1 border ${
                    selectedDocId === doc.id
                      ? 'bg-amber-600/20 border-amber-500/50 text-amber-200'
                      : 'bg-stone-900/60 border-stone-800 hover:bg-stone-800 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 font-mono">{doc.year}</span>
                    <span className="text-[10px] text-stone-400">{doc.location}</span>
                  </div>
                  <span className="font-serif font-semibold line-clamp-1">{doc.title}</span>
                  <span className="text-[10px] text-stone-400">{doc.author}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Area de Leitura do Documento Selecionado */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-stone-900/95 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {currentDoc.year}
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-stone-800 text-stone-300">
                  {currentDoc.documentType}
                </span>
              </div>
              <h4 className="text-xl md:text-2xl font-serif font-bold text-white">
                {currentDoc.title}
              </h4>
              <p className="text-xs text-amber-300 font-medium mt-1">
                Autor: {currentDoc.author} • Localidade: {currentDoc.location}
              </p>
            </div>

            {/* Fac-simile em Pergaminho / Bloco de Citacao Antigo */}
            <div className="p-5 md:p-6 rounded-2xl bg-amber-950/20 border-2 border-amber-500/30 text-amber-100 shadow-inner relative">
              <Quote className="w-8 h-8 text-amber-500/20 absolute top-4 right-4" />
              <p className="font-serif text-sm md:text-base leading-relaxed italic text-justify">
                &ldquo;{currentDoc.excerpt}&rdquo;
              </p>
            </div>

            {/* Contexto Historico */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
                <h5 className="text-xs uppercase tracking-wider font-bold text-stone-300 mb-1 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  Contexto Histórico
                </h5>
                <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
                  {currentDoc.historicalContext}
                </p>
              </div>

              {/* Impacto Teologico */}
              <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
                <h5 className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-1 flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  Legado Teológico Permanente
                </h5>
                <p className="text-xs md:text-sm text-stone-300 leading-relaxed">
                  {currentDoc.theologicalImpact}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rodape do Modal */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Acervo Histórico e Confessional da IBO</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold transition-colors"
          >
            Fechar Leitura
          </button>
        </div>
      </div>
    </div>
  );
};
