import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, FileText, ListVideo } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { VeredasNavbar } from '../../components/veredas/VeredasNavbar';
import { VeredasFooter } from '../../components/veredas/VeredasFooter';

export const VeredasCourseDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetch(`/api/veredas/items/${slug}`).then((r) => r.ok ? r.json() : Promise.reject()).then(setItem).finally(() => setLoading(false)); }, [slug]);
  const aulas = item?.curso?.aulas || [];
  const requested = Number(params.get('aula') || 1) - 1;
  const currentIndex = Math.max(0, Math.min(Number.isFinite(requested) ? requested : 0, Math.max(aulas.length - 1, 0)));
  const aula = aulas[currentIndex];
  const selectLesson = (index: number) => { setParams(index ? { aula: String(index + 1) } : {}, { replace: true }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  if (loading) return <div className="min-h-screen bg-stone-950"><VeredasNavbar /><main className="max-w-6xl mx-auto p-8"><div className="aspect-video bg-stone-900 rounded-xl animate-pulse" /></main></div>;
  if (!item?.curso || !aula) return <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col"><VeredasNavbar /><main className="m-auto text-center"><AlertCircle className="mx-auto text-amber-500" /><p className="mt-3">Curso indisponível.</p><Link to="/veredas/cursos" className="text-amber-400 text-sm">Voltar aos cursos</Link></main><VeredasFooter /></div>;

  return <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
    <Helmet><title>{item.titulo} — Curso Veredas IBO</title></Helmet><VeredasNavbar />
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
      <Link to="/veredas/cursos" className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-amber-400"><ArrowLeft className="w-4 h-4" /> Voltar aos cursos</Link>
      <div className="mt-5 grid lg:grid-cols-[minmax(0,1fr)_22rem] gap-6">
        <section>
          <div className="aspect-video bg-black rounded-xl overflow-hidden border border-stone-800"><iframe key={aula.youtubeId} src={`https://www.youtube.com/embed/${aula.youtubeId}?rel=0`} title={aula.titulo} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen className="w-full h-full" /></div>
          <div className="py-5 border-b border-stone-800"><span className="text-xs font-bold text-amber-500">AULA {currentIndex + 1} DE {aulas.length}</span><h1 className="font-serif text-2xl font-bold text-amber-100 mt-1">{aula.titulo}</h1><p className="text-sm text-stone-400 mt-2">{item.titulo}</p></div>
          <div className="flex justify-between gap-3 py-5"><button disabled={currentIndex === 0} onClick={() => selectLesson(currentIndex - 1)} className="px-4 py-2 rounded-lg border border-stone-700 disabled:opacity-30 flex items-center gap-1 text-xs"><ChevronLeft className="w-4 h-4" /> Aula anterior</button><button disabled={currentIndex === aulas.length - 1} onClick={() => selectLesson(currentIndex + 1)} className="px-4 py-2 rounded-lg bg-amber-600 text-stone-950 disabled:opacity-30 flex items-center gap-1 text-xs font-bold">Próxima aula <ChevronRight className="w-4 h-4" /></button></div>
          <div className="prose prose-invert prose-stone max-w-none text-sm"><h2>Por que indicamos</h2><p>{item.porqueIndicamos}</p></div>
          {item.curso.materiais?.length ? <section className="mt-7 border-t border-stone-800 pt-6"><h2 className="font-serif text-xl font-bold text-amber-100 flex items-center gap-2"><FileText className="w-5 h-5 text-amber-500" /> Materiais complementares</h2><div className="mt-3 grid sm:grid-cols-2 gap-3">{item.curso.materiais.map((material: any) => <a key={material.id || material.url} href={material.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-lg border border-stone-800 bg-stone-900 p-4 text-sm text-stone-200 hover:border-amber-700 hover:text-amber-300"><span>{material.titulo}</span><ExternalLink className="w-4 h-4 shrink-0" /></a>)}</div></section> : null}
        </section>
        <aside className="bg-stone-900 border border-stone-800 rounded-xl h-fit lg:sticky lg:top-24 overflow-hidden"><div className="p-4 border-b border-stone-800"><h2 className="font-bold flex items-center gap-2"><ListVideo className="w-4 h-4 text-amber-500" /> Aulas do curso</h2><p className="text-xs text-stone-500 mt-1">{aulas.length} aulas na ordem recomendada</p></div><div className="max-h-[65vh] overflow-y-auto">{aulas.map((lesson: any, index: number) => <button key={lesson.id || lesson.youtubeId} onClick={() => selectLesson(index)} className={`w-full text-left p-4 border-b border-stone-800/70 flex gap-3 ${index === currentIndex ? 'bg-amber-950/40 text-amber-200' : 'hover:bg-stone-800'}`}><span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs ${index === currentIndex ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-400'}`}>{index + 1}</span><span className="text-xs font-semibold leading-relaxed">{lesson.titulo}</span></button>)}</div></aside>
      </div>
    </main><VeredasFooter />
  </div>;
};
