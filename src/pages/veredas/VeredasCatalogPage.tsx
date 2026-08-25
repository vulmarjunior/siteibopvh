import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { BookOpen, Film, GraduationCap, Flame, Search, Filter, Sparkles } from 'lucide-react';
import { VeredasNavbar } from '../../components/veredas/VeredasNavbar';
import { VeredasFooter } from '../../components/veredas/VeredasFooter';
import { BookCard } from '../../components/veredas/BookCard';
import { VideoCard } from '../../components/veredas/VideoCard';
import { CourseCard } from '../../components/veredas/CourseCard';
import { ConferenceCard } from '../../components/veredas/ConferenceCard';
import { Helmet } from 'react-helmet-async';

export const VeredasCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType =
    searchParams.get('tipo') ||
    (window.location.pathname.includes('conferencias')
      ? 'CONFERENCIA'
      : window.location.pathname.includes('cursos')
      ? 'CURSO'
      : window.location.pathname.includes('videos')
      ? 'VIDEO'
      : 'LIVRO');

  const [tipo, setTipo] = useState<'LIVRO' | 'VIDEO' | 'CURSO' | 'CONFERENCIA'>(initialType as any);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [categoria, setCategoria] = useState(searchParams.get('categoria') || '');
  const [nivel, setNivel] = useState(searchParams.get('nivel') || '');
  const [gratuito, setGratuito] = useState(searchParams.get('gratuito') === 'true');

  const [items, setItems] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    fetch('/api/veredas/categorias')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCategorias(data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    async function loadItems() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('tipo', tipo);
        if (query) params.set('q', query);
        if (categoria) params.set('categoria', categoria);
        if (nivel) params.set('nivel', nivel);
        if (gratuito) params.set('gratuito', 'true');

        const res = await fetch(`/api/veredas/items?${params.toString()}`);
        const data = await res.json();

        if (data.items) {
          setItems(data.items);
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error('Error loading catalog items:', err);
      } finally {
        setLoading(false);
      }
    }

    loadItems();
  }, [tipo, query, categoria, nivel, gratuito]);

  const getPageTitle = () => {
    switch (tipo) {
      case 'LIVRO':
        return 'Livros Indicados';
      case 'VIDEO':
        return 'Vídeos Indicados';
      case 'CURSO':
        return 'Cursos Indicados';
      case 'CONFERENCIA':
        return 'Conferências Curadas';
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans flex flex-col">
      <Helmet>
        <title>Catálogo Veredas IBO — {getPageTitle()}</title>
      </Helmet>

      <VeredasNavbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header & Type Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-800 pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-amber-100">Catálogo Veredas IBO</h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Curadoria pastoral com ressalvas, avaliações e fontes legítimas
            </p>
          </div>

          {/* Type Toggle Tabs */}
          <div className="bg-stone-900 border border-stone-800 p-1 rounded-xl flex flex-wrap items-center gap-1 self-stretch sm:self-auto">
            <button
              onClick={() => setTipo('LIVRO')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                tipo === 'LIVRO' ? 'bg-amber-600 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Livros
            </button>
            <button
              onClick={() => setTipo('VIDEO')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                tipo === 'VIDEO' ? 'bg-amber-600 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Film className="w-4 h-4" />
              Vídeos
            </button>
            <button
              onClick={() => setTipo('CURSO')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                tipo === 'CURSO' ? 'bg-amber-600 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Cursos
            </button>
            <button
              onClick={() => setTipo('CONFERENCIA')}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                tipo === 'CONFERENCIA' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Flame className="w-4 h-4" />
              Conferências
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por título, canal, evento..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-700/80 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            </div>

            {/* Category Dropdown */}
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.nome}
                </option>
              ))}
            </select>

            {/* Level Dropdown */}
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">Todos os níveis</option>
              <option value="INTRODUTORIO">Introdutório</option>
              <option value="INTERMEDIARIO">Intermediário</option>
              <option value="APROFUNDAMENTO">Aprofundamento</option>
            </select>

            {/* Free filter toggle */}
            <label className="flex items-center gap-2 px-3 py-2 bg-stone-950 border border-stone-700/80 rounded-lg text-xs font-semibold text-stone-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={gratuito}
                onChange={(e) => setGratuito(e.target.checked)}
                className="rounded border-stone-700 bg-stone-800 text-amber-500 focus:ring-amber-500"
              />
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Somente acesso gratuito
            </label>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-72 bg-stone-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) =>
              tipo === 'LIVRO' ? (
                <BookCard key={item.id} item={item} />
              ) : tipo === 'VIDEO' ? (
                <VideoCard key={item.id} item={item} />
              ) : tipo === 'CURSO' ? (
                <CourseCard key={item.id} item={item} />
              ) : (
                <ConferenceCard key={item.id} item={item} />
              )
            )}
          </div>
        ) : (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center text-stone-400 space-y-3">
            <Filter className="w-8 h-8 text-stone-600 mx-auto" />
            <p className="font-serif text-base text-stone-200">
              Nenhum conteúdo encontrado com os filtros selecionados.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setCategoria('');
                setNivel('');
                setGratuito(false);
              }}
              className="text-xs text-amber-400 underline hover:text-amber-300"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </main>

      <VeredasFooter />
    </div>
  );
};
