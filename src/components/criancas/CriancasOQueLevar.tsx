import { useState } from 'react';
import { Backpack, Check, CheckCircle2, Copy, CupSoda, HandCoins, Salad, Sun } from 'lucide-react';

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

const PIX_KEY = '04.771.507/0001-08';

export default function CriancasOQueLevar() {
  const [copied, setCopied] = useState(false);

  function copyKey() {
    void navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

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

        <div className="mt-6 rounded-[2rem] border-4 border-amber-300 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 p-7 shadow-lg">
          <div className="flex flex-col items-start gap-5 md:flex-row md:items-center">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-amber-950 shadow">
              <HandCoins aria-hidden="true" className="h-7 w-7" />
            </span>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-amber-900">Contribua com ofertas para a carne</h3>
              <p className="mt-1 leading-relaxed text-amber-900/90">
                Contamos com ofertas das famílias para cobrir os custos da compra da carne do churrasco. Sua contribuição, no valor que puder, ajuda a servir todas as famílias com fartura.
              </p>
            </div>
          </div>

          <div className="mt-5 grid items-center gap-5 rounded-3xl bg-white/85 p-5 shadow-inner md:grid-cols-[auto_1fr]">
            <img src="/images/qrcode-pix.svg" alt="QR Code PIX da Igreja Batista Olaria" className="mx-auto h-36 w-36 rounded-2xl border border-amber-200 bg-white p-2 shadow" />

            <div>
              <p className="text-xs font-black uppercase tracking-widest text-amber-700">PIX (CNPJ)</p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                <code className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-mono text-lg font-bold text-amber-950">{PIX_KEY}</code>
                <button
                  type="button"
                  onClick={copyKey}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-black transition ${copied ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-amber-950 hover:-translate-y-0.5 hover:bg-amber-400'}`}
                >
                  {copied ? <Check aria-hidden="true" className="h-5 w-5" /> : <Copy aria-hidden="true" className="h-5 w-5" />}
                  {copied ? 'Chave copiada!' : 'Copiar chave'}
                </button>
              </div>
              <p className="mt-3 text-sm font-bold text-stone-600">Favorecido: Igreja Batista Olaria</p>
              <p className="mt-3 rounded-2xl bg-amber-100 p-4 text-sm font-bold leading-relaxed text-amber-900">
                Ao contribuir, identifique a natureza da contribuição na descrição do PIX: <span className="whitespace-nowrap rounded-lg bg-white/70 px-2 py-0.5">"Dia das Crianças — Carne"</span>. Isso nos ajuda a organizar a compra e a prestação de contas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
