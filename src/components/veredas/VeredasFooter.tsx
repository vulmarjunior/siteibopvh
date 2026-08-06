import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

export const VeredasFooter: React.FC = () => {
  return (
    <footer className="bg-stone-950 text-stone-400 border-t border-stone-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <span className="font-serif text-lg font-bold text-stone-100">
                Veredas IBO
              </span>
            </div>
            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-md">
              Ambiente de curadoria pastoral e bibliográfica da Igreja Batista Olaria em Porto Velho/RO.
              Recomendamos materiais de autores bíblicos e ortodoxos com transparência, contextualização pastoral e acesso legítimo.
            </p>
            <div className="pt-2 text-xs text-stone-500">
              <p>📍 Igreja Batista Olaria — Porto Velho, Rondônia</p>
              <p>© {new Date().getFullYear()} IBO. Todos os direitos reservados.</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-stone-200 text-sm tracking-wider uppercase font-serif">
              Navegação
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/veredas" className="hover:text-amber-400 transition-colors">
                  Início Veredas
                </Link>
              </li>
              <li>
                <Link to="/veredas/livros" className="hover:text-amber-400 transition-colors">
                  Catálogo de Livros
                </Link>
              </li>
              <li>
                <Link to="/veredas/videos" className="hover:text-amber-400 transition-colors">
                  Catálogo de Vídeos
                </Link>
              </li>
              <li>
                <Link to="/veredas/biblioteca-gratuita" className="hover:text-emerald-400 transition-colors">
                  Biblioteca Gratuita
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors flex items-center gap-1">
                  Portal Principal IBO <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Affiliate & Transparency Note */}
          <div className="space-y-3">
            <h4 className="font-semibold text-stone-200 text-sm tracking-wider uppercase font-serif flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Transparência
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Alguns links de aquisição podem ser links de associado. A igreja poderá receber uma pequena comissão comercial, sem qualquer custo adicional para o comprador.
            </p>
            <Link to="/veredas/sobre" className="inline-block text-xs text-amber-500 underline hover:text-amber-400">
              Leia nossa política editorial completa →
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
};
