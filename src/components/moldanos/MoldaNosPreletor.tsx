import React from 'react';
import { GraduationCap, Church, BookOpen, ScrollText } from 'lucide-react';

const MoldaNosPreletor: React.FC = () => {
  const education = [
    { title: "Bacharel em Engenharia Agronômica", institution: "UFRA, Belém" },
    { title: "Mestre em Divindade", institution: "Universidade Samford, EUA" },
    { title: "Mestre em Teologia Sistemática", institution: "Universidade de Londres, Inglaterra" },
    { title: "Doutor em Teologia (Ph.D.)", institution: "Universidade de Aberdeen, Escócia" },
  ];

  const ministry = [
    "Professor de Teologia Sistemática",
    "Coordenador de Mestrado",
    "Reitor do Seminário Teológico Batista Equatorial (Belém, PA)",
  ];

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-olaria font-bold uppercase tracking-widest text-sm mb-2 block">
            Preletor
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">
            Conheça Nosso Convidado
          </h2>
        </div>

        <div className="grid md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-2">
            <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg border border-stone-200">
              <img
                src="/images/preletor.jpg"
                alt="Rev. Dr. David Bowman Riker"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="mb-6">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-stone-800 leading-tight">
                Rev. Dr. David Bowman Riker
              </h3>
              <p className="text-olaria-600 font-medium mt-1 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Ph.D. em Teologia
              </p>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-amber-500" />
                  <h4 className="font-serif font-bold text-stone-700 text-lg">Formação Acadêmica</h4>
                </div>
                <ul className="space-y-3">
                  {education.map((item) => (
                    <li key={item.title} className="flex gap-3 text-stone-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2.5" />
                      <div>
                        <p className="font-medium text-stone-700">{item.title}</p>
                        <p className="text-sm text-stone-500">{item.institution}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ScrollText className="w-5 h-5 text-amber-500" />
                  <h4 className="font-serif font-bold text-stone-700 text-lg">Ministério</h4>
                </div>
                <ul className="space-y-3">
                  {ministry.map((item) => (
                    <li key={item} className="flex gap-3 text-stone-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Church className="w-5 h-5 text-amber-600" />
                  <h4 className="font-bold text-amber-800">Atualmente</h4>
                </div>
                <p className="text-amber-700 font-medium">
                  Pastor-Presidente da Primeira Igreja Batista do Pará — Belém, PA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoldaNosPreletor;
