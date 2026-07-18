import React from 'react';
import { MapPin, Mail, Phone, Facebook, Instagram, Youtube, Smartphone, Apple } from 'lucide-react';
import { churchInfo } from '../../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-stone-900 text-stone-300 py-16 border-t-4 border-olaria">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12">
        <div className="md:col-span-1">
          <div className="mb-6">
            <span className="font-serif font-bold text-2xl text-white block">{churchInfo.name}</span>
            <span className="text-olaria text-sm font-medium italic mt-1 block">{churchInfo.slogan}</span>
          </div>
          <p className="text-sm leading-relaxed mb-6 text-stone-400">
            {churchInfo.description}
          </p>
          <div className="flex gap-4">
            <a
              href={churchInfo.social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook da Igreja Batista Olaria"
              className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-olaria hover:text-white transition-all"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href={churchInfo.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram da Igreja Batista Olaria"
              className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-olaria hover:text-white transition-all"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={churchInfo.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube da Igreja Batista Olaria"
              className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-olaria hover:text-white transition-all"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <p className="text-xs uppercase tracking-widest text-stone-500 font-bold mb-1">Baixe nosso App</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={churchInfo.app.android}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-lg transition-all border border-stone-700"
              >
                <Smartphone className="w-4 h-4 text-olaria" />
                <div className="text-left">
                  <p className="text-[10px] uppercase leading-none text-stone-400">Android</p>
                  <p className="text-sm font-bold leading-none">Play Store</p>
                </div>
              </a>
              <a
                href={churchInfo.app.ios}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-lg transition-all border border-stone-700"
              >
                <Apple className="w-4 h-4 text-olaria" />
                <div className="text-left">
                  <p className="text-[10px] uppercase leading-none text-stone-400">iOS</p>
                  <p className="text-sm font-bold leading-none">App Store</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-serif font-bold text-lg mb-6">Programação</h4>
          <ul className="space-y-3 text-sm">
            {churchInfo.schedule.map((item, idx) => (
              <li key={idx} className="flex justify-between border-b border-stone-800 pb-2">
                <span>{item.day}</span>
                <span className="text-olaria">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-serif font-bold text-lg mb-6">Links Rápidos</h4>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="hover:text-olaria transition-colors">Início</a></li>
            <li><a href="#identidade" className="hover:text-olaria transition-colors">Quem Somos</a></li>
            <li><a href="#documentos" className="hover:text-olaria transition-colors">Documentos de Fé</a></li>
            <li><a href="#sermoes" className="hover:text-olaria transition-colors">Sermões Recentes</a></li>
            <li><a href="#contribua" className="hover:text-olaria transition-colors">Contribuições</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-serif font-bold text-lg mb-6">Contato</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-olaria shrink-0 mt-0.5" />
              <a
                href={churchInfo.contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-olaria transition-colors"
              >
                {churchInfo.contact.address}<br />{churchInfo.contact.neighborhood}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-olaria shrink-0" />
              <a
                href={churchInfo.contact.phoneUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-olaria transition-colors"
              >
                {churchInfo.contact.phone}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-olaria shrink-0" />
              <a href={`mailto:${churchInfo.contact.email}`} className="hover:text-olaria transition-colors">
                {churchInfo.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="text-center mt-16 pt-8 border-t border-stone-800 text-xs text-stone-500">
        &copy; {new Date().getFullYear()} {churchInfo.name}. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default Footer;
