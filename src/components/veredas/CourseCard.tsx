import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Play } from 'lucide-react';

export const CourseCard: React.FC<{ item: any }> = ({ item }) => {
  const course = item.curso || {};
  return (
    <article className="group bg-stone-900 border border-stone-800 rounded-xl overflow-hidden hover:border-amber-700/60 transition-all flex flex-col h-full">
      <Link to={`/veredas/curso/${item.slug}`} className="relative aspect-video bg-stone-950 block overflow-hidden">
        {course.thumbnailUrl ? <img src={course.thumbnailUrl} alt={item.titulo} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /> : <div className="w-full h-full flex items-center justify-center"><GraduationCap className="w-12 h-12 text-amber-600/50" /></div>}
        <div className="absolute inset-0 bg-stone-950/30 flex items-center justify-center"><div className="w-12 h-12 rounded-full bg-amber-500/90 text-stone-950 flex items-center justify-center"><Play className="w-6 h-6 fill-current" /></div></div>
        <span className="absolute bottom-2 right-2 bg-stone-950/90 px-2 py-1 rounded text-[10px]">{course.aulas?.length || 0} aulas</span>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <span className="text-[11px] font-bold text-amber-500">CURSO</span>
        <h3 className="mt-1 font-serif text-base font-bold text-stone-100 line-clamp-2"><Link to={`/veredas/curso/${item.slug}`}>{item.titulo}</Link></h3>
        {course.canal ? <p className="mt-1 text-xs text-stone-400">{course.canal}</p> : null}
        <p className="mt-3 text-xs text-stone-400 line-clamp-2">{item.resumo}</p>
        <Link to={`/veredas/curso/${item.slug}`} className="mt-auto pt-4 text-xs font-semibold text-amber-400">Começar curso →</Link>
      </div>
    </article>
  );
};
