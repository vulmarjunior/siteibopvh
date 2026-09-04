import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { HistoryHero } from '../../components/history/HistoryHero';
import { HistoryRouteMap } from '../../components/history/HistoryRouteMap';
import { HistoryTimeline } from '../../components/history/HistoryTimeline';
import { HistoryPastoratesGrid } from '../../components/history/HistoryPastoratesGrid';
import { HistoryQuiz } from '../../components/history/HistoryQuiz';
import { HistoryHistorianChestModal } from '../../components/history/HistoryHistorianChestModal';

export const HistoryPage: React.FC = () => {
  const [selectedEraId, setSelectedEraId] = useState<string | null>(null);
  const [isChestModalOpen, setIsChestModalOpen] = useState(false);

  const handleSelectEra = (eraId: string) => {
    setSelectedEraId(eraId);
    const element = document.getElementById('linha-do-tempo');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectMilestone = (milestoneId: string) => {
    setSelectedEraId(null);
    const element = document.getElementById(milestoneId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      const timelineEl = document.getElementById('linha-do-tempo');
      if (timelineEl) timelineEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      <Helmet>
        <title>Nossa História: De 1609 à Fundação da IBO em 1959 | Igreja Batista Olaria</title>
        <meta
          name="description"
          content="Conheça a história dos batistas desde o nascedouro na Europa de 1609, a expansão missionária, a chegada ao Brasil e à Amazônia até a fundação da Igreja Batista Olaria em 1º de Junho de 1959."
        />
        <meta property="og:title" content="A Jornada dos Batistas & Fundação da IBO (1609–1959)" />
        <meta
          property="og:description"
          content="Uma linha do tempo interativa e lúdica pelas raízes de nossa fé até a organização da Igreja Batista Olaria em Porto Velho."
        />
      </Helmet>

      <Navbar />

      <main className="flex-grow">
        <HistoryHero
          onSelectEra={handleSelectEra}
          onOpenDocuments={() => setIsChestModalOpen(true)}
        />

        <HistoryRouteMap onSelectMilestone={handleSelectMilestone} />

        <HistoryTimeline
          selectedEraId={selectedEraId}
          onClearEraFilter={() => setSelectedEraId(null)}
        />

        <HistoryPastoratesGrid />

        <HistoryQuiz />
      </main>

      <HistoryHistorianChestModal
        isOpen={isChestModalOpen}
        onClose={() => setIsChestModalOpen(false)}
      />

      <Footer />
    </div>
  );
};

export default HistoryPage;
