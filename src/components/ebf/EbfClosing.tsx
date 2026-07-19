import { Heart, Map, Grid3x3, Home } from 'lucide-react';

interface Props {
  onBackToMap: () => void;
  onShowAll: () => void;
}

export default function EbfClosing({ onBackToMap, onShowAll }: Props) {
  return (
    <section className="py-20 px-5 bg-gradient-to-b from-emerald-900 to-emerald-950 text-white">
      <div className="max-w-3xl mx-auto text-center">
        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-16 bg-amber-500/40" />
          <Heart className="w-5 h-5 text-amber-400 fill-amber-400" />
          <div className="h-px w-16 bg-amber-500/40" />
        </div>

        <h2 className="font-serif text-3xl md:text-4xl font-black mb-6">
          Aventura <span className="text-amber-300">Concluída</span>
        </h2>

        <p className="text-emerald-100 text-lg leading-relaxed mb-4">
          Durante esta aventura, seguimos pistas, enfrentamos desafios e construímos muitas memórias.
        </p>
        <p className="text-emerald-100 text-lg leading-relaxed mb-8">
          Mas aprendemos que o maior tesouro não está escondido em uma ilha ou dentro de um baú.
          <strong className="text-amber-300"> O maior tesouro é conhecer e seguir Jesus.</strong>
        </p>

        {/* Thanks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-sm">
          <div className="bg-emerald-800/50 rounded-xl p-4">
            <p className="text-amber-300 font-bold">Agradecemos</p>
            <p className="text-emerald-200 mt-1">A todas as crianças participantes</p>
          </div>
          <div className="bg-emerald-800/50 rounded-xl p-4">
            <p className="text-amber-300 font-bold">Agradecemos</p>
            <p className="text-emerald-200 mt-1">Às famílias que confiaram seus filhos</p>
          </div>
          <div className="bg-emerald-800/50 rounded-xl p-4">
            <p className="text-amber-300 font-bold">Agradecemos</p>
            <p className="text-emerald-200 mt-1">Aos voluntários dedicados</p>
          </div>
        </div>

        {/* Verse */}
        <p className="text-amber-200 italic mb-10 font-serif text-lg">
          "Porque onde estiver o vosso tesouro, aí estará também o vosso coração." — Mateus 6.21
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={onBackToMap}
            className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-amber-950 rounded-full font-bold hover:bg-amber-400 transition-colors"
          >
            <Map className="w-4 h-4" /> Voltar ao mapa
          </button>
          <button
            onClick={onShowAll}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-colors"
          >
            <Grid3x3 className="w-4 h-4" /> Ver todas as fotos
          </button>
          <a
            href="/ebf"
            className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-full font-bold hover:bg-white/20 transition-colors"
          >
            <Home className="w-4 h-4" /> Página inicial da EBF
          </a>
        </div>
      </div>
    </section>
  );
}
