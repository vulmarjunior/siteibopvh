import { ExternalLink, MapPin, MessageCircle, Navigation } from 'lucide-react';

const MAPS_URL = 'https://maps.app.goo.gl/jUkjmX8ZE7poMEPn9';
const SHARE_TEXT = `Dia das Crianças — Igreja Batista Olaria\n11 de outubro, das 9h às 16h\nEspaço de Eventos Casarão\nMapa: ${MAPS_URL}\nInscrições: https://www.ibopvh.com.br/criancas`;
const WHATSAPP_SHARE_URL = `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`;

export default function CriancasLocal() {
  return (
    <section className="bg-emerald-50 px-5 py-16">
      <div className="mx-auto max-w-5xl">
        <div className="grid items-center gap-8 rounded-[2.5rem] border-4 border-emerald-200 bg-white p-8 shadow-xl md:grid-cols-[1.1fr_0.9fr] md:p-12">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.24em] text-emerald-700">
              <MapPin aria-hidden="true" className="h-4 w-4" /> Localização
            </p>
            <h2 className="mt-2 font-serif text-4xl font-bold text-stone-900">Espaço de Eventos Casarão</h2>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">
              Nosso encontro será no Espaço de Eventos Casarão, em Porto Velho. Toque no botão abaixo para abrir a rota no Google Maps e chegar sem dificuldades.
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3.5 text-base font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-500"
            >
              <Navigation aria-hidden="true" className="h-5 w-5" /> Abrir no Google Maps <ExternalLink aria-hidden="true" className="h-4 w-4" />
            </a>
            <a
              href={WHATSAPP_SHARE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-base font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-95 md:ml-3"
            >
              <MessageCircle aria-hidden="true" className="h-5 w-5" /> Compartilhar no WhatsApp
            </a>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-sky-200 via-emerald-200 to-amber-200 p-1 shadow-inner">
            <div className="grid h-56 place-items-center rounded-[1.35rem] bg-white/80 p-6 text-center backdrop-blur">
              <div>
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg">
                  <MapPin aria-hidden="true" className="h-8 w-8" />
                </span>
                <p className="mt-4 text-xl font-black text-stone-800">11 de outubro</p>
                <p className="mt-1 text-sm font-bold uppercase tracking-widest text-emerald-700">das 9h às 16h</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
