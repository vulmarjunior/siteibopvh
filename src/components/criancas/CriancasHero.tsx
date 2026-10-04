import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, ChevronDown, Clock, MapPin, PartyPopper } from 'lucide-react';

const infos = [
  { icon: CalendarDays, label: 'Data', value: '11 de outubro', accent: 'bg-amber-300' },
  { icon: MapPin, label: 'Local', value: 'Espaço de Eventos Casarão', accent: 'bg-rose-300' },
  { icon: Clock, label: 'Horário', value: 'das 9h às 16h', accent: 'bg-sky-300' },
];

export default function CriancasHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-400 via-sky-200 to-emerald-200 px-5 pb-16 pt-6 text-sky-950">
      <div aria-hidden="true" className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-white/30 blur-2xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 top-40 h-56 w-56 rounded-full bg-amber-200/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-[120%] -translate-x-1/2 rounded-t-[100%] bg-emerald-300/70" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-sky-900 shadow-sm backdrop-blur transition hover:bg-white">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Portal IBO
          </Link>
          <span className="rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-sky-900 shadow-sm backdrop-blur">Programação Especial</span>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-fade-in-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-4 py-1.5 text-sm font-black uppercase tracking-wide text-amber-950 shadow">
              <PartyPopper aria-hidden="true" className="h-4 w-4" /> Igreja Batista Olaria
            </p>
            <h1 className="mt-5 font-serif text-5xl font-bold leading-tight text-sky-950 drop-shadow-sm sm:text-6xl md:text-7xl">
              Dia das <span className="text-amber-600">Crianças</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-sky-900/90">
              Um dia preparado para as crianças e toda a família, com comunhão, diversão, brincadeiras e momentos especiais juntos.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#inscricao" className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-base font-black text-amber-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-300">
                Fazer inscrição <ChevronDown aria-hidden="true" className="h-4 w-4" />
              </a>
              <a href="#programacao" className="inline-flex items-center gap-2 rounded-full bg-white/80 px-7 py-3.5 text-base font-bold text-sky-900 shadow transition hover:-translate-y-0.5 hover:bg-white">
                Ver programação
              </a>
            </div>
            <p className="mt-4 text-sm font-bold text-rose-700">Inscrições até 08 de outubro — garanta a sua!</p>
          </div>

          <div className="animate-fade-in">
            <img
              src="/images/criancas/arte-feed.png"
              alt="Arte do Dia das Crianças da Igreja Batista Olaria com Jesus abraçando crianças"
              className="mx-auto w-full max-w-sm rounded-[2.5rem] border-8 border-white/80 shadow-2xl"
              loading="eager"
            />
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {infos.map(({ icon: Icon, label, value, accent }) => (
            <div key={label} className="rounded-3xl border-4 border-white/80 bg-white/85 p-5 shadow-lg backdrop-blur">
              <div className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${accent} text-sky-950`}>
                <Icon aria-hidden="true" className="h-5 w-5" />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-sky-700">{label}</p>
              <p className="mt-1 text-lg font-black text-sky-950">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
