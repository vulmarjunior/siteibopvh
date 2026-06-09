import React from 'react';
import { CalendarDays, Clock, BookOpen } from 'lucide-react';

interface DayProps {
  day: string;
  date: string;
  theme: string;
  passage: string;
  order: number;
}

const days: DayProps[] = [
  {
    day: "Sexta",
    date: "05 de junho",
    theme: "Moldados para serviço submisso",
    passage: "Mateus 6:16-18",
    order: 1
  },
  {
    day: "Sábado",
    date: "06 de junho",
    theme: "Moldados para serviço agradável",
    passage: "Mateus 1:21",
    order: 2
  },
  {
    day: "Domingo",
    date: "07 de junho",
    theme: "Moldados para serviço perfeito",
    passage: "Hebreus 6:1",
    order: 3
  }
];

const MoldaNosProgramacao: React.FC = () => {
  return (
    <section id="programacao" className="py-24 px-4 bg-olaria-50/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <span className="text-olaria font-bold uppercase tracking-widest text-sm mb-2 block">
            Programação
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-4">
            Três Noites de Reflexão
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Cada noite abordará uma dimensão do serviço cristão, edificando uma compreensão 
            completa do que significa ser moldado por Deus para o Seu Reino.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {days.map((day) => (
            <div
              key={day.order}
              className="group bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
                <div className="flex items-center justify-between text-white">
                  <span className="font-bold text-lg">{day.day}</span>
                  <span className="text-amber-100 text-sm">{day.date}</span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-stone-500 text-sm mb-4">
                  <Clock className="w-4 h-4" />
                  <span>19:00</span>
                </div>

                <h3 className="font-serif font-bold text-xl text-stone-800 mb-3 leading-snug">
                  {day.theme}
                </h3>

                <div className="flex items-start gap-2 text-olaria-700 bg-olaria-50 rounded-lg px-3 py-2 text-sm">
                  <BookOpen className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-medium">{day.passage}</span>
                </div>
              </div>

              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {day.order}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 bg-white border border-stone-200 rounded-full px-6 py-3 shadow-sm">
            <CalendarDays className="w-5 h-5 text-olaria" />
            <span className="text-stone-600 text-sm">
              Todas as noites • <strong className="text-stone-800">19:00</strong> • Igreja Batista Olaria
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoldaNosProgramacao;
