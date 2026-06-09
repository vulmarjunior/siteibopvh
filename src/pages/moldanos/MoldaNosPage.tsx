import { useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import MoldaNosHero from '../../components/moldanos/MoldaNosHero';
import MoldaNosSobre from '../../components/moldanos/MoldaNosSobre';
import MoldaNosProgramacao from '../../components/moldanos/MoldaNosProgramacao';
import MoldaNosPreletor from '../../components/moldanos/MoldaNosPreletor';
import MoldaNosLocalizacao from '../../components/moldanos/MoldaNosLocalizacao';

export default function MoldaNosPage() {
  useEffect(() => {
    const prevTitle = document.title;
    const metaTags = [
      { name: 'description', content: 'Conferência Molda-nos — 05, 06 e 07 de junho de 2026 às 19h. Três noites de reflexão sobre o serviço cristão com o Rev. Dr. David B. Riker na Igreja Batista Olaria.' },
      { property: 'og:title', content: 'Molda-nos — Conferência 2026 | Igreja Batista Olaria' },
      { property: 'og:description', content: 'Moldados para servir no Reino. 05, 06 e 07 de junho de 2026 às 19h. Com o Rev. Dr. David B. Riker.' },
      { property: 'og:image', content: 'https://ibopvh.com.br/images/banner-niver-slide.jpg' },
      { property: 'og:url', content: 'https://ibopvh.com.br/moldanos' },
      { property: 'og:type', content: 'website' },
    ];

    document.title = 'Molda-nos — Conferência 2026 | Igreja Batista Olaria';

    const addedTags: HTMLMetaElement[] = [];
    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      Object.entries(tag).forEach(([key, value]) => {
        meta.setAttribute(key, value);
      });
      document.head.appendChild(meta);
      addedTags.push(meta);
    });

    return () => {
      document.title = prevTitle;
      addedTags.forEach(tag => {
        if (document.head.contains(tag)) {
          document.head.removeChild(tag);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen font-sans bg-white text-stone-800 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <MoldaNosHero />
        <MoldaNosSobre />
        <MoldaNosProgramacao />
        <MoldaNosPreletor />
        <MoldaNosLocalizacao />
      </main>
      <Footer />
    </div>
  );
}
