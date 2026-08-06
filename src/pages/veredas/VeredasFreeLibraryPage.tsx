import React, { useEffect, useState } from 'react';
import { Sparkles, Download, BookOpen, ExternalLink, ArrowLeft } from 'lucide-react';
import { VeredasNavbar } from '../../components/veredas/VeredasNavbar';
import { VeredasFooter } from '../../components/veredas/VeredasFooter';
import { BookCard } from '../../components/veredas/BookCard';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export const VeredasFreeLibraryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFreeItems() {
      setLoading(true);
      try {
        const res = await fetch('/api/veredas/items?gratuito=true&limit=30');
        const data = await res.json();
        if (data.items) {
          setItems(data.items);
        }
      } catch (err) {
        console.error('Error loading free library:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFreeItems();
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans flex flex-col">
      <Helmet>
        <title>Biblioteca Gratuita Legítima — Veredas IBO</title>
        <meta
          name="description"
          content="Acervo de livros, capítulos, amostras e materiais teológicos gratuitos distribuídos legitimamente por editoras, autores e pela IBO."
        />
      </Helmet>

      <VeredasNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 border border-emerald-800/60 rounded-2xl p-8 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
            <Sparkles className="w-4 h-4" /> Acesso Gratuito e Legítimo
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-100 leading-tight">
            Biblioteca Gratuita Veredas
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-3xl leading-relaxed">
            Reunimos links para obras completas, amostras de capítulos, apostilas e PDFs autorizados.
            Distinguimos claramente o que é um <strong className="text-emerald-400">livro completo</strong> de uma <strong className="text-amber-400">amostra parcial</strong> para transparência total com o leitor.
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 bg-stone-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <BookCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center text-stone-400 space-y-3">
            <BookOpen className="w-10 h-10 text-emerald-500/50 mx-auto" />
            <p className="font-serif text-base text-stone-200">Nenhum livro com acesso gratuito cadastrado no momento.</p>
            <p className="text-xs text-stone-500">Novas indicações são adicionadas periodicamente pela curadoria.</p>
          </div>
        )}

      </main>

      <VeredasFooter />
    </div>
  );
};
