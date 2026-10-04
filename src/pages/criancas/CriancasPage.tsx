import { Helmet } from 'react-helmet-async';
import CriancasHero from '../../components/criancas/CriancasHero';
import CriancasProgramacao from '../../components/criancas/CriancasProgramacao';
import CriancasOQueLevar from '../../components/criancas/CriancasOQueLevar';
import CriancasLocal from '../../components/criancas/CriancasLocal';
import CriancasInscricao from '../../components/criancas/CriancasInscricao';
import CriancasFooter from '../../components/criancas/CriancasFooter';

export default function CriancasPage() {
  return (
    <main className="min-h-screen bg-amber-50 text-stone-900">
      <Helmet>
        <title>Dia das Crianças — Igreja Batista Olaria</title>
        <meta name="description" content="11 de outubro, das 9h às 16h, no Espaço de Eventos Casarão. Programação especial para as crianças e toda a família. Inscrições até 08 de outubro pelo site da igreja." />
        <meta property="og:title" content="Dia das Crianças — Igreja Batista Olaria" />
        <meta property="og:description" content="Comunhão, diversão, brincadeiras e momentos especiais para as crianças e toda a família. Inscreva sua família até 08 de outubro." />
        <meta property="og:image" content="/images/criancas/arte-wide.png" />
        <meta property="og:type" content="website" />
      </Helmet>
      <CriancasHero />
      <CriancasProgramacao />
      <CriancasOQueLevar />
      <CriancasLocal />
      <CriancasInscricao />
      <CriancasFooter />
    </main>
  );
}
