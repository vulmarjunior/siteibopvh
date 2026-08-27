import React from 'react';
import { Shield, BookOpen, Users, CheckCircle2, MessageSquareQuote, HeartHandshake } from 'lucide-react';

interface SentinelWatchTowerProps {
  todayData: {
    dayOfMonth: number;
    formattedDate: string;
    sentinels: { id: number; name: string }[];
    handovers: { id: number; authorName: string; message: string | null; verse: string | null; completedAt: string }[];
    isCompleted: boolean;
  } | null;
  recentHandovers: {
    id: number;
    dayOfMonth: number;
    date: string;
    authorName: string;
    message: string | null;
    verse: string | null;
    completedAt: string;
  }[];
  onOpenHandoverModal: () => void;
}

export const SentinelWatchTower: React.FC<SentinelWatchTowerProps> = ({
  todayData,
  recentHandovers,
  onOpenHandoverModal,
}) => {
  const latestHandover = recentHandovers.length > 0 ? recentHandovers[0] : null;

  return (
    <div className="mb-16">
      {/* Banner Principal da Intercessão do Dia */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-stone-850 to-stone-900 border border-amber-500/20 p-6 md:p-10 shadow-2xl">
        {/* Glow sutil */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Lado Esquerdo: Intercessores do Dia */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs uppercase tracking-widest font-bold">
                <HeartHandshake className="w-3.5 h-3.5 text-amber-500" />
                Intercessão de Hoje
              </span>
              <span className="text-stone-400 text-sm font-medium">
                {todayData?.formattedDate || 'Hoje'}
              </span>
            </div>

            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
                Intercessores do Dia {todayData?.dayOfMonth || ''}
              </h2>
              <p className="text-stone-300 text-sm md:text-base mt-2 leading-relaxed">
                "Perseverai na oração, vigiando com ações de graças. Suplicai, ao mesmo tempo, também por nós, para que Deus nos abra porta à palavra."
                <span className="text-amber-400 font-serif italic ml-1">— Colossenses 4:2-3</span>
              </p>
            </div>

            {/* Irmãos na escala hoje */}
            <div className="bg-stone-800/60 backdrop-blur-md rounded-2xl border border-white/5 p-4 md:p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-bold flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  Irmãos Escalados para Hoje
                </span>
                {todayData?.isCompleted && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    Intercessão Cumprida
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {todayData && todayData.sentinels.length > 0 ? (
                  todayData.sentinels.map((s) => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold text-xs md:text-sm shadow-sm"
                    >
                      <Shield className="w-3 h-3 text-amber-400" />
                      {s.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-stone-400 italic">
                    Nenhum irmão fixo escalado para hoje. Você pode consultar os motivos e orar pela congregação.
                  </span>
                )}
              </div>
            </div>

            {/* Botão de Ação: Registrar Oração & Transmitir a Escala */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onOpenHandoverModal}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 active:scale-[0.98] transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Registrar Oração de Hoje & Transmitir a Escala</span>
              </button>
            </div>
          </div>

          {/* Lado Direito: A Comunhão dos Santos / Saudação da Guarda Anterior */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-stone-800/80 backdrop-blur-md border border-white/10 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-xs uppercase tracking-widest font-bold text-amber-400 flex items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-amber-400" />
                  Comunhão dos Intercessores
                </span>
                <span className="text-[11px] text-stone-500 uppercase tracking-wider">
                  Saudação Fraterna
                </span>
              </div>

              {latestHandover ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs text-stone-300 font-bold">
                      Transmitido por {latestHandover.authorName}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      (Dia {latestHandover.dayOfMonth})
                    </span>
                  </div>

                  <blockquote className="text-sm text-stone-300 italic bg-stone-900/60 p-3.5 rounded-xl border border-white/5 leading-relaxed">
                    "{latestHandover.message || 'Intercedemos com alegria e gratidão pelo rebanho e pela pregação da Palavra. Que o Senhor fortaleça a escala de amanhã!'}"
                  </blockquote>

                  {latestHandover.verse && (
                    <div className="text-xs text-amber-400/90 font-semibold text-right">
                      — {latestHandover.verse}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic leading-relaxed">
                  A escala de intercessão de hoje está aberta. Ao concluir seus momentos devocionais, registre sua oração e deixe uma saudação bíblica aos irmãos do próximo dia.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentinelWatchTower;
