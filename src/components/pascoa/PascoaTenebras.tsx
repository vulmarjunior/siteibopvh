import { CalendarDays, MapPin, Clock, ChevronRight } from 'lucide-react';

export function PascoaTenebras() {
    return (
        <section id="tenebras" className="relative bg-stone-950 overflow-hidden">

            {/* Top geometric divider */}
            <div className="w-full overflow-hidden leading-none">
                <svg className="w-full text-stone-950" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0,0 L480,48 L960,12 L1440,54 L1440,0 Z" fill="currentColor" />
                </svg>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">

                {/* Left: Image */}
                <div className="relative h-72 lg:h-auto overflow-hidden">
                    <img
                        src="/images/pascoa-tenebras-bg.jpg"
                        alt="Três cruzes sobre o monte ao entardecer"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-stone-950/30 to-stone-950"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>
                </div>

                {/* Right: Content */}
                <div className="px-8 md:px-16 py-16 lg:py-24 flex flex-col justify-center">

                    <span className="text-stone-500 text-xs tracking-[0.25em] uppercase font-medium mb-4">
                        03 de abril • 19:00
                    </span>

                    <h2 className="text-4xl md:text-5xl font-serif text-stone-100 mb-8 leading-tight">
                        Cerimônia <br className="hidden md:block" />
                        <span className="text-stone-400">Tenebras</span>
                    </h2>

                    {/* Convite Block */}
                    <div className="border-l-2 border-amber-700/50 pl-6 mb-10">
                        <p className="text-stone-400 font-light leading-relaxed text-base md:text-lg italic mb-4">
                            "Há um silêncio que pesa mais do que palavras. Há uma escuridão que não é ausência de luz,
                            mas presença de algo sagrado. Nesta noite, não celebramos a derrota — contemplamos o custo
                            do amor mais profundo que o mundo já recusou e, mesmo assim, nunca foi revogado."
                        </p>
                        <p className="text-stone-400 font-light leading-relaxed text-base md:text-lg italic">
                            Venha sem pressa. Venha disposto ao silêncio. A Cerimônia Tenebras é um convite à meditação
                            sobre o que Cristo carregou — para que nós não precisássemos carregar sozinhos.
                        </p>
                    </div>

                    {/* Info Block */}
                    <div className="bg-stone-900/50 border border-stone-800 rounded-xl p-6 mb-8 space-y-3">
                        <div className="flex items-center gap-3 text-stone-300 text-sm">
                            <CalendarDays size={16} className="text-amber-600 flex-shrink-0" />
                            <span>Sexta-feira, 03 de abril de 2026</span>
                        </div>
                        <div className="flex items-center gap-3 text-stone-300 text-sm">
                            <Clock size={16} className="text-amber-600 flex-shrink-0" />
                            <span>19:00 (chegue com 15 min de antecedência)</span>
                        </div>
                        <div className="flex items-center gap-3 text-stone-300 text-sm">
                            <MapPin size={16} className="text-amber-600 flex-shrink-0" />
                            <span>Igreja Batista Olaria — Porto Velho</span>
                        </div>
                    </div>

                    {/* O Que Esperar */}
                    <div className="mb-8">
                        <h4 className="text-stone-400 text-xs tracking-[0.2em] uppercase font-medium mb-4">O que esperar</h4>
                        <ul className="space-y-2">
                            {[
                                'Reverência e recolhimento no silêncio',
                                'Leitura da Palavra e meditação',
                                'Apagar gradual das luzes do templo',
                                'Culto contemplativo'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-stone-500 text-sm">
                                    <ChevronRight size={14} className="text-amber-800 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-stone-600 text-sm italic">Traga sua Bíblia.</p>
                </div>
            </div>
        </section>
    );
}
