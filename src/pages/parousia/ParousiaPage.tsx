import React from 'react';
import { HeroSerie } from '../../components/parousia/HeroSerie';
import { SobreSerie } from '../../components/parousia/SobreSerie';
import { MapaPeregrinacao } from '../../components/parousia/MapaPeregrinacao';
import { ProgramacaoSermoes } from '../../components/parousia/ProgramacaoSermoes';
import { MensagensDisponiveis } from '../../components/parousia/MensagensDisponiveis';
import { MateriaisApoio } from '../../components/parousia/MateriaisApoio';
import { ConvideAlguem } from '../../components/parousia/ConvideAlguem';
import { FooterSerie } from '../../components/parousia/FooterSerie';
import { HeaderSerie } from '../../components/parousia/HeaderSerie';
import { FooterParousia } from '../../components/parousia/FooterParousia';
import { SEOHead } from '../../components/parousia/SEOHead';

export const ParousiaPage: React.FC = () => {
  return (
    <div className="bg-[#0f1115] min-h-screen font-sans text-gray-300 selection:bg-[#d4af37] selection:text-[#0f1115]">
      <SEOHead
        title="Da Ascensão à Parousia — O Livro da Longa Peregrinação"
        description="Acompanhe a caminhada da Igreja desde a ascensão de Cristo até a esperança final da Nova Jerusalém. Série de mensagens da Igreja Batista Olaria."
      />
      <HeaderSerie />
      <HeroSerie />
      <SobreSerie />
      <MapaPeregrinacao />
      <ProgramacaoSermoes />
      <MensagensDisponiveis />
      <MateriaisApoio />
      <ConvideAlguem />
      <FooterSerie />
      <FooterParousia />
    </div>
  );
};
