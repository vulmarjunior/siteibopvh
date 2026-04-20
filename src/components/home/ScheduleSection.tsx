import React from 'react';
import { BookOpen, Users, Church } from 'lucide-react';

const ScheduleSection: React.FC = () => {
  /* 
     DATA STRUCTURE: Itens da Programação
     - Manter exatamente 3 itens para integridade do Grid (md:grid-cols-3).
     - Descrição: CRÍTICO manter entre 80 e 120 caracteres para que todos os cards tenham altura similar.
     - Ícones: Importar de 'lucide-react'.
  */
  const items = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Culto de Oração",
      time: "Domingo às 09:00",
      description: "A igreja se reúne para cantar, orar e interceder uns pelos outros e pela obra de Deus."
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Escola Bíblica",
      time: "Domingo às 09:30",
      description: "Tempo de estudo e de treinamento para nos auxiliar no crescimento cristão. Classes para todas as idades."
    },
    {
      icon: <Church className="w-8 h-8" />,
      title: "Culto Público",
      time: "Domingo às 19:00",
      description: "Celebração da glória de Deus. Proclamação do evangelho da graça através da pregação expositiva e cumprimento das ordenanças."
    }
  ];

  return (
    <section id="horarios" className="py-24 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-olaria font-bold uppercase tracking-widest text-sm mb-2 block">Nossa Programação</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800">Horários dos Cultos</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-stone-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="inline-block p-4 bg-olaria-50 text-olaria rounded-full mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">{item.title}</h3>
              <p className="text-olaria font-bold text-sm mb-4 uppercase tracking-wide">{item.time}</p>
              <p className="text-stone-600 leading-relaxed font-sans text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;