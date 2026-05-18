import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Hero from '../../components/home/Hero';
import IdentitySection from '../../components/home/IdentitySection';
import ScheduleSection from '../../components/home/ScheduleSection';
import SermonSection from '../../components/home/SermonSection';
import ContributeSection from '../../components/home/ContributeSection';
import ContactSection from '../../components/home/ContactSection';
import Footer from '../../components/layout/Footer';
import DocumentCard from '../../components/documents/DocumentCard';
import DocumentModal from '../../components/documents/DocumentModal';
import { CHURCH_DOCUMENTS } from '../../constants';

export default function HomePage() {
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const activeDocument = activeDocId ? CHURCH_DOCUMENTS.find(d => d.id === activeDocId) : null;

  return (
    <div className="min-h-screen font-sans bg-white text-stone-800 flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Link
          to="/moldanos"
          className="block relative w-full h-[300px] md:h-[400px] overflow-hidden group"
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: "url('/images/banner-niver-slide.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/50 to-stone-900/70" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <span className="text-amber-400 font-bold tracking-[0.3em] uppercase text-xs md:text-sm mb-2">
              Conferência • 05 a 07 de junho • 19h
            </span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-2">
              Molda-nos
            </h2>
            <p className="text-amber-400/80 text-sm md:text-base italic mb-4 font-serif">
              para servir no Reino
            </p>
            <span className="group inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-900 font-bold text-sm py-3 px-6 rounded-lg transition-all duration-300">
              Quero Participar
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
        <Hero />
        <IdentitySection />
        <ScheduleSection />
        <section id="documentos" className="py-24 px-4 container mx-auto bg-olaria-50/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-olaria font-bold uppercase tracking-widest text-sm mb-2 block">Fundamentos</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">
                Documentos de Fé
              </h2>
              <p className="text-stone-600 max-w-2xl mx-auto">
                Acesse a íntegra de nossas confissões, pactos e princípios que regem nossa prática e doutrina.
              </p>
            </div>
            <div className="grid gap-4">
              {CHURCH_DOCUMENTS.map((doc) => (
                <DocumentCard key={doc.id} document={doc} onOpen={setActiveDocId} />
              ))}
            </div>
          </div>
        </section>
        <SermonSection />
        <ContributeSection />
        <ContactSection />
      </main>
      <Footer />
      {activeDocument && (
        <DocumentModal document={activeDocument} onClose={() => setActiveDocId(null)} />
      )}
    </div>
  );
}
