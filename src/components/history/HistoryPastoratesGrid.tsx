import React, { useEffect, useState } from 'react';
import { Pastorate, HistoryItem } from '../../types/history';
import { Users, Calendar, Image as ImageIcon, Sparkles, Church, Clock } from 'lucide-react';

export const HistoryPastoratesGrid: React.FC = () => {
  const [pastorates, setPastorates] = useState<Pastorate[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [pRes, iRes] = await Promise.all([
          fetch('/api/history/pastorates'),
          fetch('/api/history/items'),
        ]);

        if (pRes.ok) {
          const pData = await pRes.json();
          if (active && Array.isArray(pData.pastorates)) {
            setPastorates(pData.pastorates);
          }
        }

        if (iRes.ok) {
          const iData = await iRes.json();
          if (active && Array.isArray(iData.items)) {
            setHistoryItems(iData.items);
          }
        }
      } catch (err) {
        console.error('Erro ao buscar dados históricos do memorial:', err);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="memorial-ibo" className="py-20 bg-stone-950 border-t border-stone-800 text-stone-100 relative">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Cabecalho da Secao */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Church className="w-3.5 h-3.5 text-amber-400" />
            <span>Memória Viva da Igreja</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-white font-bold tracking-tight">
            Memorial IBO: Pastorados & Eras
          </h2>
          <p className="text-stone-400 text-sm md:text-base mt-3 leading-relaxed">
            Honrando os servos de Deus que dedicaram suas vidas para guiar o rebanho da Igreja Batista Olaria desde a fundação em 1959.
          </p>
        </div>

        {/* Pastorados Cadastrados */}
        {pastorates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {pastorates.map((p) => (
              <div
                key={p.id}
                className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-6 shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    {p.photoUrl ? (
                      <img
                        src={p.photoUrl}
                        alt={p.pastorName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-500/40"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-stone-800 border-2 border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Users className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold font-serif text-white">
                        {p.pastorName}
                      </h3>
                      <span className="text-xs text-amber-400 font-medium block">
                        {p.role}
                      </span>
                      <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-stone-400" />
                        {p.startYear} – {p.endYear ? p.endYear : 'Presente'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-stone-300 leading-relaxed font-light mb-4 text-justify">
                    {p.biography}
                  </p>
                </div>

                {p.keyMilestones && (
                  <div className="pt-3 border-t border-stone-800 text-xs text-amber-300/90 font-medium">
                    <strong className="text-stone-300 block mb-1">Legado do Período:</strong>
                    <span>{p.keyMilestones}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Estado Informativo / Pesquisa em Andamento */
          <div className="bg-stone-900/60 border border-amber-500/20 rounded-2xl p-8 md:p-10 text-center max-w-2xl mx-auto mb-16 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-4">
              <Clock className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-serif font-bold text-white mb-2">
              Resgate Histórico em Andamento
            </h3>

            <p className="text-stone-300 text-xs md:text-sm leading-relaxed mb-6 font-light">
              A equipe pastoral e a comissão de memória da IBO estão catalogando as atas antigas, os nomes dos pastores pioneiros, líderes e marcos de cada década desde 1º de Junho de 1959. Conforme as informações e fotografias forem resgatadas nos arquivos da igreja, elas serão publicadas aqui.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-950 border border-stone-800 text-stone-400 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gestão contínua integrada pelo painel administrativo pastoral</span>
            </div>
          </div>
        )}

        {/* Itens do Acervo Historico (Atas e Fotografias) */}
        {historyItems.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl md:text-2xl font-serif font-bold text-white mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              <span>Acervo Fotográfico & Documental da IBO</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-lg group hover:border-amber-500/40 transition-all"
                >
                  {item.imageUrl ? (
                    <div className="h-48 overflow-hidden bg-stone-950">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-stone-950 flex items-center justify-center text-stone-600">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-center justify-between text-[11px] text-amber-400 font-mono mb-1">
                      <span>Ano: {item.year}</span>
                      <span className="text-stone-400 uppercase tracking-wider">{item.category}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                      {item.title}
                    </h4>

                    <p className="text-xs text-stone-300 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>

                    {item.source && (
                      <span className="block text-[10px] text-stone-400 italic mt-3">
                        Fonte: {item.source}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
