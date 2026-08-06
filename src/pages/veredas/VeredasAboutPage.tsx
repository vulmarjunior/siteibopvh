import React from 'react';
import { ShieldCheck, BookOpen, Compass, HeartHandshake, AlertCircle } from 'lucide-react';
import { VeredasNavbar } from '../../components/veredas/VeredasNavbar';
import { VeredasFooter } from '../../components/veredas/VeredasFooter';
import { Helmet } from 'react-helmet-async';

export const VeredasAboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans flex flex-col">
      <Helmet>
        <title>Sobre o Veredas IBO — Política Editorial e Curadoria</title>
        <meta
          name="description"
          content="Conheça os princípios editoriais, o compromisso pastoral e a transparência sobre links comissionados da Plataforma Veredas IBO."
        />
      </Helmet>

      <VeredasNavbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
        
        {/* Header */}
        <div className="space-y-4 border-b border-stone-800 pb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950 border border-amber-800 text-amber-300 text-xs font-semibold uppercase tracking-widest">
            <Compass className="w-4 h-4 text-amber-400" />
            Curadoria Teológica Pastoral
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-100">
            Sobre o Veredas IBO
          </h1>
          <p className="font-serif text-lg text-stone-300 font-light leading-relaxed">
            Orientação bibliográfica e teológica para uma fé cristã madura, coerente e enraizada nas Escrituras.
          </p>
        </div>

        {/* 1. Princípios */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-stone-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-500" />
            Nossos Princípios Editoriais
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="bg-stone-900 border border-stone-800 p-5 rounded-xl space-y-2">
              <h3 className="font-bold text-amber-300 font-serif">1. Curadoria acima de Quantidade</h3>
              <p className="text-stone-400 leading-relaxed">
                Preferimos manter um catálogo enxuto e criteriosamente analisado pastoralmente, em vez de acumular milhares de títulos sem contextualização.
              </p>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-5 rounded-xl space-y-2">
              <h3 className="font-bold text-amber-300 font-serif">2. Transparência com Ressalvas</h3>
              <p className="text-stone-400 leading-relaxed">
                Nenhum livro fora da Bíblia é perfeito. Quando uma obra excelente possui pontos discordantes de nossa tradição, registramos ressalvas claras.
              </p>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-5 rounded-xl space-y-2">
              <h3 className="font-bold text-amber-300 font-serif">3. Legalidade e Respeito a Direitos</h3>
              <p className="text-stone-400 leading-relaxed">
                O Veredas IBO não armazena e não distribui cópias piratas. Direcionamos apenas para sites oficiais de editoras, autores ou acervos institucionais.
              </p>
            </div>
            <div className="bg-stone-900 border border-stone-800 p-5 rounded-xl space-y-2">
              <h3 className="font-bold text-amber-300 font-serif">4. Independência Comercial</h3>
              <p className="text-stone-400 leading-relaxed">
                Um livro não precisa estar à venda na Amazon para constar no acervo. Indicamos obras esgotadas, sebos, bibliotecas ou amostras gratuitas.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Links de Associado */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-6 sm:p-8 space-y-3">
          <h2 className="font-serif text-xl font-bold text-stone-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            Transparência sobre Links de Associado
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Alguns links de aquisição (como a Amazon) podem utilizar tags de associado. Caso você decida adquirir o livro por esse link, a igreja poderá receber uma pequena porcentagem de comissão enviada pela livraria.
          </p>
          <p className="text-xs text-amber-400 font-medium">
            Isso não acrescenta nenhum centavo ao preço final pago por você e ajuda a manter a estrutura tecnológica da igreja com custo zero.
          </p>
        </section>

      </main>

      <VeredasFooter />
    </div>
  );
};
