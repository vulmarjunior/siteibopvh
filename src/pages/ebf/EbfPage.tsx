import { useEffect } from 'react';
import { lazy, Suspense } from 'react';

const EbfGallery = lazy(() => import('../../components/ebf/EbfGallery'));

export default function EbfPage() {
  useEffect(()=>{document.title='EBF 2026 — Em Busca do Maior Tesouro';},[]);
  return <main className="min-h-screen bg-[#fff8dc] text-amber-950">
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-800 to-amber-700 px-5 py-14 text-center text-white">
      <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(#fde68a 1.5px, transparent 1.5px)',backgroundSize:'24px 24px'}} />
      <div className="relative mx-auto max-w-4xl"><p className="mb-3 font-bold uppercase tracking-[.25em] text-amber-300">Escola Bíblica de Férias</p><h1 className="font-serif text-5xl font-black drop-shadow md:text-7xl">Em Busca do<br/><span className="text-amber-300">Maior Tesouro</span></h1><p className="mx-auto mt-5 max-w-2xl text-xl">Uma aventura inesquecível para descobrir o maior tesouro de todos: <strong>Jesus!</strong></p><p className="mt-5 text-amber-200">"Porque onde estiver o vosso tesouro, aí estará também o vosso coração." — Mateus 6.21</p></div>
    </section>
    <section className="mx-auto max-w-6xl px-5 pt-8"><img src="/images/ebf-2026-banner.jpeg" alt="Em Busca do Maior Tesouro — EBF 2026" className="w-full rounded-3xl border-4 border-amber-300 shadow-2xl"/></section>
  <Suspense fallback={<div className='py-20 text-center text-stone-500'>Carregando galeria...</div>}>
      <EbfGallery />
    </Suspense>
  </main>
}
