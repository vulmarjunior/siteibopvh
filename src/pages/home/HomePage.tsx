import React, { useState } from 'react';
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
