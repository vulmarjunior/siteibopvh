import { ArrowLeft, CalendarCheck, Church } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SiteModuleId } from '../../config/siteModules';
import { SITE_MODULES } from '../../config/siteModules';

interface ModuleClosingPageProps {
  moduleId: SiteModuleId;
}

const messages = {
  pascoa: {
    eyebrow: 'Programação concluída',
    title: 'Páscoa e Tenebras',
    description: 'Esta programação foi encerrada. Agradecemos a todos que caminharam conosco na celebração da paixão, morte e ressurreição de Cristo.',
  },
  moldanos: {
    eyebrow: 'Conferência concluída',
    title: 'Molda-nos',
    description: 'Esta edição da conferência foi encerrada. Agradecemos a participação da igreja e preservamos este hotsite para futuras edições.',
  },
  ebf: { eyebrow: 'Edição concluída', title: 'EBF 2026', description: 'As inscrições desta edição foram encerradas. Agradecemos às crianças, famílias e voluntários que participaram conosco.' },
  parousia: { eyebrow: 'Conteúdo indisponível', title: 'Da Ascensão à Parousia', description: 'Esta série não está disponível neste momento.' },
  veredas: { eyebrow: 'Conteúdo indisponível', title: 'Veredas IBO', description: 'A central de curadoria não está disponível neste momento.' },
  relogio: { eyebrow: 'Serviço indisponível', title: 'Relógio de Oração', description: 'Este serviço não está disponível neste momento.' },
} as const;

export default function ModuleClosingPage({ moduleId }: ModuleClosingPageProps) {
  const module = SITE_MODULES[moduleId];
  const message = messages[moduleId];

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-950 px-5 py-24 text-white">
      <section className="w-full max-w-3xl rounded-3xl border border-amber-500/20 bg-stone-900 p-8 text-center shadow-2xl md:p-14">
        <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-400">
          <CalendarCheck aria-hidden="true" className="h-8 w-8" />
        </div>
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-amber-400">{message.eyebrow}</p>
        <h1 className="font-serif text-4xl font-bold md:text-6xl">{message.title}</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-300">{message.description}</p>
        <p className="mt-5 text-sm text-stone-500">Módulo preservado: {module.name}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-3 font-bold text-stone-950 transition-colors hover:bg-amber-400">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Voltar ao portal
          </Link>
          <Link to="/relogio" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 font-bold transition-colors hover:bg-white/15">
            <Church aria-hidden="true" className="h-4 w-4" /> Relógio de Oração
          </Link>
        </div>
      </section>
    </main>
  );
}
