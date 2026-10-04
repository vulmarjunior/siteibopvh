import { Backpack, CheckCircle2, CupSoda, HandCoins, Salad, Sun } from 'lucide-react';

const items = [
  'Toalha',
  'Roupa de banho',
  'Protetor solar',
  'Itens de higiene pessoal',
  'Roupa extra para as crianças',
  'Café da manhã para compartilhar',
  'Um acompanhamento para o almoço',
  'Refrigerante ou suco',
];

export default function CriancasOQueLevar() {
  return (
    <section className="bg-amber-50 px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[2.5rem] border-4 border-amber-200 bg-white p-8 shadow-xl md:p-12">
          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
            <div className="flex-1">
              <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-amber-700">
                <Backpack aria-hidden="true" className="h-4 w-4" /> O que levar?
              </p>
              <h2 className="mt-2 font-serif text-4xl font-bold text-stone-900">Prepare a família com conforto</h2>
              <p className="mt-4 text-lg text-stone-600">Cada família deve se preparar para aproveitar o dia com conforto e organização.</p>

              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 font-bold text-emerald-900">
                    <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-600" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full shrink-0 space-y-3 md:w-64">
              <div className="rounded-3xl bg-sky-100 p-5 text-sky-900">
                <Sun aria-hidden="true" className="h-6 w-6" />
                <p className="mt-2 font-black">Piscina liberada</p>
                <p className="mt-1 text-sm leading-relaxed">Não esqueça toalha, roupa de banho, protetor solar e roupa extra para as crianças.</p>
              </div>
              <div className="rounded-3xl bg-orange-100 p-5 text-orange-900">
                <Salad aria-hidden="true" className="h-6 w-6" />
                <p className="mt-2 font-black">Mesa compartilhada</p>
                <p className="mt-1 text-sm leading-relaxed">Traga um acompanhamento para o churrasco e algo para o café da manhã.</p>
              </div>
              <div className="rounded-3xl bg-violet-100 p-5 text-violet-900">
                <CupSoda aria-hidden="true" className="h-6 w-6" />
                <p className="mt-2 font-black">Bebidas</p>
                <p className="mt-1 text-sm leading-relaxed">Cada família também deverá levar refrigerante ou suco.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start gap-5 rounded-[2rem] border-4 border-amber-300 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 p-7 shadow-lg md:flex-row md:items-center">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 shadow">
            <HandCoins aria-hidden="true" className="h-7 w-7" />
          </span>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-amber-900">Contribua com ofertas para a carne</h3>
            <p className="mt-1 leading-relaxed text-amber-900/90">
              Contamos com ofertas das famílias para cobrir os custos da compra da carne do churrasco. Sua contribuição, no valor que puder, ajuda a servir todas as famílias com fartura.
            </p>
          </div>
          <a href="/#contribua" className="shrink-0 rounded-full bg-amber-500 px-6 py-3 font-black text-amber-950 shadow transition hover:-translate-y-0.5 hover:bg-amber-400 md:whitespace-nowrap">
            Ver formas de contribuir
          </a>
        </div>
      </div>
    </section>
  );
}
