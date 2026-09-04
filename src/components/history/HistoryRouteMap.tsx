import React from 'react';
import { Globe2, ArrowRight } from 'lucide-react';

interface RouteStop {
  id: string;
  milestoneId: string;
  year: string;
  city: string;
  region: string;
  badge: string;
  summary: string;
  icon: string;
}

const ROUTE_STOPS: RouteStop[] = [
  {
    id: 'stop-1',
    milestoneId: '1609-amsterdam',
    year: '1609 / 1612',
    city: 'Amsterdã & Londres',
    region: 'Holanda & Inglaterra',
    badge: 'Nascedouro',
    summary: 'Credobatismo de crentes regenerados e o clamor pioneiro pela liberdade de consciência perante o Estado.',
    icon: '⛵',
  },
  {
    id: 'stop-2',
    milestoneId: '1638-providence',
    year: '1638',
    city: 'Providence',
    region: 'Rhode Island, América',
    badge: 'Novo Mundo',
    summary: 'Roger Williams funda a Primeira Igreja Batista na América com refúgio aos perseguidos por causas religiosas.',
    icon: '⚓',
  },
  {
    id: 'stop-3',
    milestoneId: '1792-carey',
    year: '1792',
    city: 'Kettering',
    region: 'Inglaterra ➔ Índia',
    badge: 'Missões Globais',
    summary: 'William Carey inaugura as Missões Modernas: "Esperai grandes coisas de Deus; praticai grandes coisas para Deus".',
    icon: '🔥',
  },
  {
    id: 'stop-4',
    milestoneId: '1881-1882-salvador',
    year: '1882',
    city: 'Salvador',
    region: 'Bahia, Brasil',
    badge: 'Pioneirismo Nacional',
    summary: 'Organização da Primeira Igreja Batista do Brasil em língua portuguesa com Bagby, Taylor e Teixeira de Albuquerque.',
    icon: '🇧🇷',
  },
  {
    id: 'stop-5',
    milestoneId: '1919-porto-velho',
    year: '1919 / 1921',
    city: 'Porto Velho',
    region: 'Guaporé / Rondônia',
    badge: 'Trilhos do Madeira',
    summary: 'Eurico Nelson, o Apóstolo da Amazônia, aporta em Porto Velho nos tempos da Ferrovia Madeira-Mamoré.',
    icon: '🚂',
  },
  {
    id: 'stop-6',
    milestoneId: '1959-ibo-fundacao',
    year: '1959',
    city: 'Bairro Olaria',
    region: 'Porto Velho, RO',
    badge: 'Fundação da IBO',
    summary: '1º de Junho de 1959: Organização da Igreja Batista Olaria na Rua Júlio de Castilho (Jeremias 18).',
    icon: '🏺',
  },
];

interface HistoryRouteMapProps {
  onSelectMilestone: (milestoneId: string) => void;
}

export const HistoryRouteMap: React.FC<HistoryRouteMapProps> = ({ onSelectMilestone }) => {
  return (
    <section id="mapa-rota" className="py-16 bg-stone-900 border-y border-stone-800 relative">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Globe2 className="w-3.5 h-3.5 text-amber-400" />
            <span>A Rota das Águas e da Fé</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-white font-bold tracking-tight">
            Do Tâmisa às Margens do Madeira
          </h2>
          <p className="text-stone-400 text-sm md:text-base max-w-2xl mx-auto mt-2">
            Acompanhe o caminho geográfico e espiritual da mensagem da graça ao longo de 350 anos até a nossa congregação.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ROUTE_STOPS.map((stop, index) => (
            <div
              key={stop.id}
              onClick={() => onSelectMilestone(stop.milestoneId)}
              className="group cursor-pointer p-5 rounded-xl bg-stone-950/70 hover:bg-stone-950 border border-stone-800 hover:border-amber-500/40 transition-all duration-300 transform hover:-translate-y-1 shadow-md hover:shadow-amber-950/20 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent group-hover:via-amber-400 transition-all" />

              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-lg bg-stone-900 border border-stone-700 flex items-center justify-center text-lg shadow-inner group-hover:scale-110 transition-transform">
                    {stop.icon}
                  </span>
                  <div>
                    <span className="text-[11px] font-mono text-amber-400 font-bold tracking-wider block">
                      {stop.year}
                    </span>
                    <h3 className="text-base font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                      {stop.city}
                    </h3>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-stone-900 text-stone-300 border border-stone-700">
                  Etapa {index + 1}
                </span>
              </div>

              <p className="text-xs text-amber-200/80 font-medium mb-2">
                📍 {stop.region}
              </p>

              <p className="text-xs text-stone-400 leading-relaxed">
                {stop.summary}
              </p>

              <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400 group-hover:text-amber-300 transition-colors">
                <span className="font-medium text-[11px]">Ver no relato</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
