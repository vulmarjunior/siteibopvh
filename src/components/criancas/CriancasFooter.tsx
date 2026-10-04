import { Link } from 'react-router-dom';
import { Church, Clock, MapPin } from 'lucide-react';

export default function CriancasFooter() {
  return (
    <footer className="bg-sky-950 px-5 py-12 text-sky-100">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        <div>
          <p className="flex items-center gap-2 font-serif text-xl font-bold text-amber-300">
            <Church aria-hidden="true" className="h-5 w-5" /> Igreja Batista Olaria
          </p>
          <p className="mt-3 text-sm leading-relaxed text-sky-200/90">
            Dia das Crianças — uma programação especial para as crianças e toda a família, com comunhão, diversão e momentos especiais juntos.
          </p>
        </div>
        <div>
          <p className="font-bold uppercase tracking-widest text-sky-300">Evento</p>
          <ul className="mt-3 space-y-2 text-sm text-sky-100/90">
            <li className="flex items-center gap-2"><Clock aria-hidden="true" className="h-4 w-4 text-amber-300" /> 11 de outubro, das 9h às 16h</li>
            <li className="flex items-center gap-2"><MapPin aria-hidden="true" className="h-4 w-4 text-amber-300" /> Espaço de Eventos Casarão</li>
          </ul>
          <p className="mt-4 text-xs text-sky-300/80">Inscrições até 08 de outubro pelo site.</p>
        </div>
        <div>
          <p className="font-bold uppercase tracking-widest text-sky-300">Links</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/" className="text-sky-100/90 underline-offset-4 hover:text-amber-300 hover:underline">Portal da igreja</Link></li>
            <li><Link to="/relogio" className="text-sky-100/90 underline-offset-4 hover:text-amber-300 hover:underline">Relógio de Oração</Link></li>
            <li><a href="#inscricao" className="text-sky-100/90 underline-offset-4 hover:text-amber-300 hover:underline">Fazer inscrição</a></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl border-t border-sky-900 pt-6 text-center text-xs text-sky-400">
        Igreja Batista Olaria — Porto Velho, Rondônia · {new Date().getFullYear()}
      </p>
    </footer>
  );
}
