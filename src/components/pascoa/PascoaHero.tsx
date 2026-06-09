import './pascoa-hero.css';

export function PascoaHero() {
    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-stone-950 px-4 pt-20">
            {/* Background Image with Overlay */}
            <div
                className="pascoa-hero-bg"
                style={{ backgroundImage: `url(/images/pascoa-tenebras-bg.jpg)` }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/40 to-stone-950"></div>
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">

                {/* Subtitle */}
                <span className="text-amber-500/90 tracking-[0.2em] text-sm uppercase font-semibold mb-6 hero-delay-0">
                    Do silêncio do Calvário ao canto da manhã
                </span>

                {/* Main Title */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-stone-100 mb-8 leading-tight tracking-wide hero-delay-1">
                    Semana da <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                        Paixão e Ressurreição
                    </span>
                </h1>

                <p className="text-lg md:text-xl text-stone-400 max-w-2xl mx-auto mb-16 font-light hero-delay-2">
                    Venha caminhar conosco pelas sombras da cruz até a luz da manhã de domingo.
                </p>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-12 hero-delay-3">

                    {/* Tenebras Card */}
                    <div className="bg-stone-900/50 backdrop-blur-sm border border-stone-800/60 p-6 rounded-xl text-left hover:border-stone-700 transition-colors group">
                        <h3 className="text-stone-300 font-serif text-xl mb-2 flex items-center justify-between">
                            Tenebras
                            <span className="h-1.5 w-1.5 rounded-full bg-stone-600 group-hover:bg-amber-700 transition-colors"></span>
                        </h3>
                        <p className="text-stone-400 text-sm mb-1 font-medium">03 de abril • 19:00</p>
                        <p className="text-stone-500 text-xs">Igreja Batista Olaria</p>
                    </div>

                    {/* Ressurreicao Card */}
                    <div className="bg-stone-900/50 backdrop-blur-sm border border-stone-800/60 p-6 rounded-xl text-left hover:border-stone-700 transition-colors group">
                        <h3 className="text-stone-300 font-serif text-xl mb-2 flex items-center justify-between">
                            Ressurreição
                            <span className="h-1.5 w-1.5 rounded-full bg-stone-600 group-hover:bg-amber-400 transition-colors"></span>
                        </h3>
                        <p className="text-stone-400 text-sm mb-1 font-medium">05 de abril • 06:00</p>
                        <p className="text-stone-500 text-xs">Igreja Batista Olaria</p>
                    </div>

                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 hero-delay-4">
                    <button
                        onClick={() => scrollTo('programacao')}
                        className="bg-stone-100 hover:bg-white text-stone-900 px-8 py-3.5 rounded-lg font-medium transition-all duration-200 shadow-xl shadow-stone-100/10"
                    >
                        Ver Programação
                    </button>

                    <button
                        onClick={() => scrollTo('localizacao')}
                        className="bg-transparent border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white px-8 py-3.5 rounded-lg font-medium transition-all duration-200"
                    >
                        Como Chegar
                    </button>
                </div>

            </div>

            {/* Bottom gradient fade */}
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-stone-950 to-transparent"></div>
        </section>
    );
}
