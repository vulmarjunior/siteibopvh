import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
const SLIDES = [
  /*
  {
    id: 0,
    image: '/images/pascoa-tenebras-bg.jpg',
    subtitle: 'Semana da Paixão e Ressurreição • Abril 2026',
    title: 'Da Cruz à Ressurreição',
    description: 'Cerimônia Tenebras em 03/04 às 19h e Culto da Ressurreição em 05/04 às 06h. Venha caminhar conosco.',
    cta: 'Ver Programação',
    link: '/pascoa'
  },
  */
  {
    id: 1,
    image: '/images/majedouragolgota.jpg',
    subtitle: 'Série Expositiva',
    title: 'Da manjedoura ao Gólgota',
    description: 'Uma jornada expositiva da vida de Jesus, preparando corações para a Páscoa através de cada etapa de Sua missão redentora.',
    cta: 'Assistir Sermões',
    link: '#sermoes'
  },
  {
    id: 2,
    image: '/images/slide2.jpg',
    subtitle: 'Vida em Comunidade',
    title: 'Adoração e Serviço',
    description: 'Uma igreja comprometida com a sã doutrina e o amor fraternal.',
    cta: 'Planeje Sua Visita',
    link: '#contato'
  },
  {
    id: 3,
    image: '/images/ebd.jpg',
    subtitle: 'Escola Bíblica Dominical',
    title: 'Crescimento na Graça',
    description: 'Estudos aprofundados todos os domingos às 09:30.',
    cta: 'Nossa programação',
    link: '#horarios'
  },
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Refs para manipulação direta do DOM (Parallax de Alta Performance 60fps)
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Lógica do Efeito Parallax
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const limit = window.innerHeight;

      // Só executa se o elemento estiver na tela para poupar CPU/GPU
      if (scrolled <= limit) {
        parallaxRefs.current.forEach((ref) => {
          if (ref) {
            /**
             * AJUSTE DE INTENSIDADE:
             * O valor 0.5px define a velocidade. 
             * 0.2 = parallax sutil | 0.8 = parallax agressivo
             */
            ref.style.transform = `translate3d(0, ${scrolled * 0.3}px, 0) scale(1.2)`;
          }
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Timer para troca automática de slides
  useEffect(() => {
    // 8000ms = 8 segundos por slide
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="#" className="relative h-[85vh] w-full overflow-hidden bg-stone-900">
      {/* Container de Imagens com Parallax */}
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
        >
          {/* A imagem possui scale(1.1) para garantir que o parallax não mostre bordas vazias */}
          <div
            ref={(el) => { parallaxRefs.current[index] = el; }}
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{
              backgroundImage: `url(${slide.image})`,
              transform: 'translate3d(0, 0, 0) scale(1.2)'
            }}
          />
          {/* Overlay Escuro: Garante leitura do texto branco sobre qualquer imagem */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/40 to-transparent" />
        </div>
      ))}

      {/* Conteúdo Centralizado */}
      <div className="absolute inset-0 container mx-auto px-4 flex items-center">
        <div className="max-w-3xl text-white z-10 pt-20">
          <div className="overflow-hidden mb-4">
            <span className="inline-block text-olaria font-bold tracking-[0.2em] uppercase text-sm md:text-base animate-fade-in-left" key={`sub-${currentSlide}`}>
              {SLIDES[currentSlide].subtitle}
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }} key={`tit-${currentSlide}`}>
            {SLIDES[currentSlide].title}
          </h1>

          <p className="text-lg md:text-xl text-stone-200 mb-10 max-w-xl font-sans leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }} key={`desc-${currentSlide}`}>
            {SLIDES[currentSlide].description}
          </p>

          {/* Botão de Ação Dinâmico */}
          {SLIDES[currentSlide].link.startsWith('/') && !SLIDES[currentSlide].link.startsWith('//') && !SLIDES[currentSlide].link.startsWith('http') ? (
            <Link
              to={SLIDES[currentSlide].link}
              className="group inline-flex items-center gap-3 bg-olaria hover:bg-olaria-500 text-white font-bold py-4 px-10 rounded-none transition-all duration-300 animate-fade-in cursor-pointer"
              key={`btn-${currentSlide}`}
            >
              {SLIDES[currentSlide].cta}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <a
              href={SLIDES[currentSlide].link}
              target={SLIDES[currentSlide].link.startsWith('http') ? "_blank" : "_self"}
              rel={SLIDES[currentSlide].link.startsWith('http') ? "noopener noreferrer" : ""}
              className="group inline-flex items-center gap-3 bg-olaria hover:bg-olaria-500 text-white font-bold py-4 px-10 rounded-none transition-all duration-300 animate-fade-in cursor-pointer"
              key={`btn-${currentSlide}`}
            >
              {SLIDES[currentSlide].cta}
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          )}
        </div>
      </div>

      {/* Indicadores de Navegação (Dots) */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-20">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1 transition-all duration-300 rounded-full ${index === currentSlide ? 'w-12 bg-olaria' : 'w-4 bg-white/30 hover:bg-white/50'
              }`}
            aria-label={`Ir para o slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;