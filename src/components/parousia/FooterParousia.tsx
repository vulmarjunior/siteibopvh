import React from 'react';
import { MapPin, Mail, Phone, Facebook, Instagram, Youtube, Smartphone, Apple } from 'lucide-react';

export const FooterParousia: React.FC = () => {
  return (
    <footer className="bg-[#0f1115] text-gray-300 py-16 border-t-4 border-[#d4af37]">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <div className="mb-6">
            <span className="font-serif font-bold text-2xl text-white block">Igreja Batista Olaria</span>
            <span className="text-[#d4af37] text-sm font-medium italic mt-1 block">"Moldando discípulos para o Reino"</span>
          </div>
          <p className="text-sm leading-relaxed mb-6 text-gray-400">
            Uma comunidade de fé comprometida com as Escrituras, a adoração reverente e o serviço ao próximo. Sendo moldados pelo Oleiro dia após dia para a glória de Deus.
          </p>
          <div className="flex gap-4">
            <a
              href="https://facebook.com/ibopvh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook da Igreja Batista Olaria"
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#d4af37] hover:text-[#0f1115] transition-all"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com/ibopvh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da Igreja Batista Olaria"
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#d4af37] hover:text-[#0f1115] transition-all"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://youtube.com/@ibopvh"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube da Igreja Batista Olaria"
              className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#d4af37] hover:text-[#0f1115] transition-all"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-1">Baixe nosso App</p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://play.google.com/store/apps/details?id=br.com.igrejasmart.batistaolaria25&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all border border-gray-700"
              >
                <Smartphone className="w-4 h-4 text-[#d4af37]" />
                <div className="text-left">
                  <p className="text-[10px] uppercase leading-none text-gray-400">Android</p>
                  <p className="text-sm font-bold leading-none">Play Store</p>
                </div>
              </a>
              <a
                href="https://apps.apple.com/br/app/ibo-pvh-app/id6751505500"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all border border-gray-700"
              >
                <Apple className="w-4 h-4 text-[#d4af37]" />
                <div className="text-left">
                  <p className="text-[10px] uppercase leading-none text-gray-400">iOS</p>
                  <p className="text-sm font-bold leading-none">App Store</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-serif font-bold text-lg mb-6">Programação</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span>Domingo - Oração</span>
              <span className="text-[#d4af37]">09:00</span>
            </li>
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span>Domingo - EBD</span>
              <span className="text-[#d4af37]">09:30</span>
            </li>
            <li className="flex justify-between border-b border-gray-800 pb-2">
              <span>Domingo - Culto Solene</span>
              <span className="text-[#d4af37]">19:00</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-serif font-bold text-lg mb-6">Links Rápidos</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="/" className="hover:text-[#d4af37] transition-colors">Voltar ao Portal Inicial</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-serif font-bold text-lg mb-6">Contato</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
              <a
                href="https://maps.app.goo.gl/GbUQXWGH1AnqBzfL7"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#d4af37] transition-colors"
              >
                R. Júlio de Castilho, 1368<br />Olaria, Porto Velho - RO
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-[#d4af37] shrink-0" />
              <a
                href="https://wa.me/5569993852595"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#d4af37] transition-colors"
              >
                (69) 99385-2595
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-[#d4af37] shrink-0" />
              <a href="mailto:contato@ibopvh.com.br" className="hover:text-[#d4af37] transition-colors">
                contato@ibopvh.com.br
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-16 pt-8 border-t border-gray-800 text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Igreja Batista Olaria. Todos os direitos reservados.
      </div>
    </footer>
  );
};
