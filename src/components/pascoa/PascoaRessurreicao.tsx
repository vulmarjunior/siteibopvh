import { CalendarDays, MapPin, Clock, ChevronRight } from 'lucide-react';

export function PascoaRessurreicao() {
    return (
        <section id="ressurreicao" className="relative bg-stone-100 overflow-hidden">

            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">

                {/* Left: Content */}
                <div className="px-8 md:px-16 py-16 lg:py-24 flex flex-col justify-center order-2 lg:order-1">

                    <span className="text-stone-500 text-xs tracking-[0.25em] uppercase font-medium mb-4">
                        05 de abril • 06:00
                    </span>

                    <h2 className="text-4xl md:text-5xl font-serif text-stone-800 mb-8 leading-tight">
                        Culto da <br className="hidden md:block" />
                        <span className="text-amber-700">Ressurreição</span>
                    </h2>

                    {/* Convite Block */}
                    <div className="border-l-2 border-amber-600/50 pl-6 mb-10 bg-amber-50/50 py-4 pr-4 rounded-r-lg">
                        <p className="text-stone-600 font-light leading-relaxed text-base md:text-lg italic mb-4">
                            "O sepulcro estava fechado. As esperanças, sepultadas. A última palavra havia sido 'consumado'.
                            Mas então, no primeiro fio de luz do domingo, tudo que estava morto encontrou razão de respirar novamente."
                        </p>
                        <p className="text-stone-600 font-light leading-relaxed text-base md:text-lg italic">
                            Reunamo-nos ao raiar do dia para entoar o que os anjos proclamaram: Ele não está aqui!
                            Ressuscitou. O Culto da Ressurreição não é começo de semana — é começo de eternidade.
                        </p>
                    </div>

                    {/* Info Block */}
                    <div className="bg-white/70 border border-stone-200 rounded-xl p-6 mb-8 space-y-3 shadow-sm">
                        <div className="flex items-center gap-3 text-stone-700 text-sm">
                            <CalendarDays size={16} className="text-amber-600 flex-shrink-0" />
                            <span>Domingo, 05 de abril de 2026</span>
                        </div>
                        <div className="flex items-center gap-3 text-stone-700 text-sm">
                            <Clock size={16} className="text-amber-600 flex-shrink-0" />
                            <span>06:00 (ao nascer do sol)</span>
                        </div>
                        <div className="flex items-center gap-3 text-stone-700 text-sm">
                            <MapPin size={16} className="text-amber-600 flex-shrink-0" />
                            <span>Igreja Batista Olaria — Porto Velho</span>
                        </div>
                    </div>

                    {/* O Que Esperar */}
                    <div className="mb-8">
                        <h4 className="text-stone-500 text-xs tracking-[0.2em] uppercase font-medium mb-4">O que esperar</h4>
                        <ul className="space-y-2">
                            {[
                                'Adoração vibrante ao Ressuscitado',
                                'Pregação do Evangelho da Vida',
                                'Momento de esperança e comunhão',
                                'Celebração com todos da família'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-stone-500 text-sm">
                                    <ChevronRight size={14} className="text-amber-600 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <p className="text-stone-400 text-sm italic">Todos são bem-vindos.</p>
                </div>

                {/* Right: Image */}
                <div className="relative h-72 lg:h-auto overflow-hidden order-1 lg:order-2">
                    <img
                        src="/images/pascoa-ressurreicao-bg.jpg"
                        alt="Túmulo vazio com luz dourada"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-transparent via-stone-100/10 to-stone-100"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-100 via-transparent to-transparent lg:from-transparent"></div>
                </div>

            </div>

            {/* Bottom geometric divider */}
            <div className="w-full overflow-hidden leading-none">
                <svg className="w-full text-stone-100" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M0,60 L480,14 L960,48 L1440,8 L1440,60 Z" fill="currentColor" />
                </svg>
            </div>
        </section>
    );
}
