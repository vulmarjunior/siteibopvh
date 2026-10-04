import { AlertTriangle, Beef, Clock, Coffee, Dumbbell, PartyPopper, Popcorn, Sun, Waves } from 'lucide-react';

const schedule = [
  {
    time: '9h',
    icon: Coffee,
    title: 'Chegada e Café da Manhã',
    description: 'Cada família poderá trazer seu próprio café da manhã para uma mesa compartilhada. Cada família traz o que desejar para o café.',
    tone: 'bg-amber-100 text-amber-900 border-amber-300',
  },
  {
    time: 'Após a chegada',
    icon: Sun,
    title: 'Momento de Oração, Louvor e Comunhão',
    description: 'Iniciaremos nosso dia com músicas, oração e uma reflexão com a Ir. Rojeane.',
    tone: 'bg-rose-100 text-rose-900 border-rose-300',
  },
  {
    time: 'Em seguida',
    icon: Waves,
    title: 'Dia Livre e Convivência',
    description: 'Um período de convivência e diversão para as famílias. O espaço possui piscina, então será um momento para aproveitar bastante!',
    warning: 'Os pais ou responsáveis são responsáveis pela supervisão e segurança de seus filhos durante todo o evento, especialmente na área da piscina.',
    tone: 'bg-sky-100 text-sky-900 border-sky-300',
  },
  {
    time: 'Almoço',
    icon: Beef,
    title: 'Churrasco em Família',
    description: 'Teremos um delicioso churrasco! Cada família leva um acompanhamento para compartilhar e também refrigerante ou suco. A ideia é fazermos um grande almoço compartilhado entre todas as famílias.',
    tone: 'bg-orange-100 text-orange-900 border-orange-300',
  },
  {
    time: 'Tarde',
    icon: PartyPopper,
    title: 'Brincadeiras',
    description: 'Brincadeiras diversas, torta na cara, queimada de balão de água e piscina. Preparem as crianças para um dia de muita diversão!',
    tone: 'bg-violet-100 text-violet-900 border-violet-300',
  },
  {
    time: 'Lanche da tarde',
    icon: Popcorn,
    title: 'Pipoca e Geladinho',
    description: 'Para fechar a tarde com alegria, teremos pipoca e geladinho para todos.',
    tone: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  },
  {
    time: '16h',
    icon: Clock,
    title: 'Encerramento',
    description: 'Será um dia de fé, família, amizade, comunhão e muita diversão. Esperamos todos vocês para viverem juntos esse momento especial!',
    tone: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  },
];

export default function CriancasProgramacao() {
  return (
    <section id="programacao" className="scroll-mt-6 bg-emerald-50 px-5 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-emerald-700">Programação</p>
          <h2 className="mt-2 font-serif text-4xl font-bold text-stone-900 md:text-5xl">Nosso dia juntos</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">Das 9h às 16h, um dia inteiro de comunhão para as crianças e toda a família.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {schedule.map(({ time, icon: Icon, title, description, warning, tone }) => (
            <article key={title} className={`rounded-3xl border-4 p-6 shadow-sm ${tone} ${title === 'Encerramento' ? 'md:col-span-2' : ''}`}>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow">
                  <Icon aria-hidden="true" className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-70">{time}</p>
                  <h3 className="mt-1 text-xl font-black">{title}</h3>
                  <p className="mt-2 leading-relaxed opacity-90">{description}</p>
                  {warning && (
                    <p className="mt-3 flex items-start gap-2 rounded-2xl bg-white/70 p-3 text-sm font-bold text-rose-800">
                      <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /> Importante: {warning}
                    </p>
                  )}
                  {title === 'Brincadeiras' && (
                    <p className="mt-3 flex items-center gap-2 text-sm font-bold opacity-80">
                      <Dumbbell aria-hidden="true" className="h-4 w-4" /> Queimada de balão de água e piscina inclusas!
                    </p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
