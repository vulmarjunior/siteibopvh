import React from 'react';
import { MapPin, Phone, Youtube, Instagram, ExternalLink, ArrowRight } from 'lucide-react';

const MoldaNosLocalizacao: React.FC = () => {
  return (
    <section className="py-24 px-4 bg-olaria-50/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-olaria font-bold uppercase tracking-widest text-sm mb-2 block">
            Localização
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">
            Onde Será
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          <div className="rounded-xl overflow-hidden shadow-md border border-stone-200 h-[400px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3939.176237225806!2d-63.905127!3d-8.760466!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwNDUnMzcuNyJTIDYzwrA1NCcyMi40Ilc!5e0!3m2!1spt-BR!2sbr!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa Igreja Batista Olaria"
            />
          </div>

          <div className="flex flex-col justify-center space-y-6">
            <a
              href="https://maps.app.goo.gl/GbUQXWGH1AnqBzfL7"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 bg-white border border-stone-200 rounded-xl p-5 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-stone-800 mb-1">Endereço</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  R. Júlio de Castilho, 1368<br />
                  Olaria, Porto Velho - RO
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors shrink-0" />
            </a>

            <a
              href="https://wa.me/5569993852595"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 bg-white border border-stone-200 rounded-xl p-5 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-stone-800 mb-1">WhatsApp</h3>
                <p className="text-stone-600 text-sm">
                  (69) 99385-2595
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-stone-400 group-hover:text-amber-500 transition-colors shrink-0" />
            </a>

            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
              <h3 className="font-bold text-stone-800 mb-4">Siga e Compartilhe</h3>
              <div className="flex gap-4">
                <a
                  href="https://youtube.com/@ibopvh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-3 rounded-lg transition-colors font-medium text-sm border border-red-200"
                >
                  <Youtube className="w-5 h-5" />
                  YouTube
                </a>
                <a
                  href="https://instagram.com/ibopvh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-pink-50 hover:bg-pink-100 text-pink-600 px-5 py-3 rounded-lg transition-colors font-medium text-sm border border-pink-200"
                >
                  <Instagram className="w-5 h-5" />
                  Instagram
                </a>
              </div>
              <p className="text-stone-500 text-xs mt-3">
                Use a hashtag <strong className="text-amber-600">#MoldaNosIBO</strong> e marque @ibopvh
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoldaNosLocalizacao;
