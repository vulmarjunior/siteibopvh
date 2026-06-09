import React from 'react';
import { ArrowRight } from 'lucide-react';

const IdentitySection: React.FC = () => {
  return (
    <section id="identidade" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            {/* Decorative element */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-olaria-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>

            <div className="relative z-10">
              {/* 
                    TIPOGRAFIA: H2 Headline
                    - Manter estrutura de 2 linhas em Desktop.
                    - Máx 60 caracteres totais.
                */}
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 leading-tight mb-6">
                Uma Igreja Firmada na Palavra, <span className="text-olaria italic">Centrada em Cristo.</span>
              </h2>
              <div className="w-20 h-1 bg-olaria mb-8"></div>

              {/* 
                    TIPOGRAFIA: Parágrafos de Identidade
                    - Essencial para SEO e retenção.
                    - Máx 180 caracteres por parágrafo para legibilidade (max-width controlado).
                */}
              <p className="text-lg text-stone-600 leading-relaxed mb-6 font-sans">
                Somos uma comunidade de fé histórica em Porto Velho, dedicada a moldar discípulos para o Reino.
              </p>
              <p className="text-lg text-stone-600 leading-relaxed mb-10 font-sans">
                Comprometidos com a pregação expositiva das Escrituras, a adoração reverente e a glória de Deus em todas as esferas da vida, cremos que a igreja local é a família de Deus na terra — o lugar onde pecadores encontram graça e o senhorio de Cristo é manifestado através do amor mútuo.
              </p>

              <a
                href="#documentos"
                className="inline-flex items-center gap-2 text-olaria font-bold uppercase tracking-wider hover:text-olaria-600 transition-colors border-b-2 border-olaria hover:border-olaria-600 pb-1"
              >
                Conheça Nossa Declaração de Fé
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="relative h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="/images/pulpitoibo.jpg"
              alt="Púlpito IBO"
              className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IdentitySection;