import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Search, Menu, X, ShieldAlert, Sparkles, Film, GraduationCap } from 'lucide-react';

export const VeredasNavbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/veredas/livros?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900/95 backdrop-blur border-b border-amber-900/30 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand */}
          <Link to="/veredas" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-stone-950 font-bold shadow-inner group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6 text-stone-900" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-amber-100 group-hover:text-amber-300 transition-colors">
                Veredas <span className="text-amber-500 font-light">IBO</span>
              </span>
              <span className="block text-[10px] sm:text-xs text-stone-400 tracking-wider uppercase font-sans">
                Curadoria Teológica
              </span>
            </div>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Pesquisar livros, vídeos, temas ou autores..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-800/80 border border-stone-700/60 rounded-full text-sm text-stone-200 placeholder-stone-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </form>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link to="/veredas" className="text-stone-300 hover:text-amber-400 transition-colors">
              Início
            </Link>
            <Link to="/veredas/livros" className="flex items-center gap-1.5 text-stone-300 hover:text-amber-400 transition-colors">
              <BookOpen className="w-4 h-4 text-amber-500" />
              Livros
            </Link>
            <Link to="/veredas/videos" className="flex items-center gap-1.5 text-stone-300 hover:text-amber-400 transition-colors">
              <Film className="w-4 h-4 text-amber-500" />
              Vídeos
            </Link>
            <Link to="/veredas/cursos" className="flex items-center gap-1.5 text-stone-300 hover:text-amber-400 transition-colors"><GraduationCap className="w-4 h-4 text-amber-500" /> Cursos</Link>
            <Link to="/veredas/biblioteca-gratuita" className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
              <Sparkles className="w-4 h-4" />
              Biblioteca Gratuita
            </Link>
            <Link to="/veredas/sobre" className="text-stone-400 hover:text-stone-200 transition-colors text-xs">
              Sobre
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 focus:outline-none"
              aria-label="Abrir menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-stone-900 border-b border-stone-800 px-4 pt-2 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-800 border border-stone-700 rounded-full text-sm text-stone-200 placeholder-stone-400 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            </div>
          </form>

          <nav className="flex flex-col gap-3 font-medium text-base pt-2">
            <Link
              to="/veredas"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-stone-800 text-stone-200"
            >
              Início
            </Link>
            <Link
              to="/veredas/livros"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-stone-800 text-stone-200 flex items-center gap-2"
            >
              <BookOpen className="w-5 h-5 text-amber-500" />
              Livros
            </Link>
            <Link
              to="/veredas/videos"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-stone-800 text-stone-200 flex items-center gap-2"
            >
              <Film className="w-5 h-5 text-amber-500" />
              Vídeos
            </Link>
            <Link
              to="/veredas/cursos"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-stone-800 text-stone-200 flex items-center gap-2"
            >
              <GraduationCap className="w-5 h-5 text-amber-500" /> Cursos
            </Link>
            <Link
              to="/veredas/biblioteca-gratuita"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Biblioteca Gratuita
            </Link>
            <Link
              to="/veredas/sobre"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-stone-800 text-stone-400 text-sm"
            >
              Sobre a Curadoria & Política Editorial
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
