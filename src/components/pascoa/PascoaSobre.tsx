import { Quote } from 'lucide-react';

export function PascoaSobre() {
    return (
        <section id="sobre" className="py-24 bg-stone-950 relative overflow-hidden">

            {/* Decorative low-poly shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-stone-900/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-stone-800/20 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">

                <div className="inline-flex items-center justify-center p-3 mb-8 rounded-full bg-stone-900/50 border border-stone-800 text-amber-500/50">
                    <Quote size={20} />
                </div>

                <blockquote className="text-2xl md:text-4xl text-stone-200 font-serif leading-relaxed mb-12 tracking-wide font-light">
                    "Pois ele foi ferido por causa das nossas transgressões,
                    <br className="hidden md:block" /><span className="text-stone-500">e moído por causa das nossas iniquidades... </span>
                    <br className="hidden md:block" />mas ao terceiro dia, a pedra foi removida."
                </blockquote>

                <div className="space-y-6 text-stone-400 text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed">
                    <p>
                        A Semana da Paixão não é um evento para ser apenas assistido, mas um caminho a ser percorrido.
                        Convidamos você a vivenciar conosco o contraste mais profundo da história humana: o silêncio
                        absurdo da sexta-feira e a glória retumbante da manhã de domingo.
                    </p>
                    <p>
                        Começaremos mergulhando nas sombras durante a <strong className="text-stone-300 font-medium">Cerimônia Tenebras</strong>,
                        lembrando o peso do sacrifício. E, ao romper da aurora de domingo, nos reuniremos no
                        <strong className="text-stone-300 font-medium"> Culto da Ressurreição</strong> para celebrar a luz inextinguível de Cristo.
                    </p>
                    <p className="text-amber-700/80 pt-4 text-sm font-medium tracking-wide uppercase">
                        Chegue com antecedência para entrar em espírito de reverência. Todos são bem-vindos.
                    </p>
                </div>

            </div>
        </section>
    );
}
