import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
    {
        q: 'Precisa de inscrição?',
        a: 'Não. Ambos os cultos são abertos ao público, sem necessidade de cadastro ou inscrição prévia. Apareça, você é bem-vindo.',
    },
    {
        q: 'Posso levar crianças?',
        a: 'Sim! As crianças podem e devem participar das duas cerimônias. Será uma alegria tê-las conosco vivenciando estes momentos em família.',
    },
    {
        q: 'Quanto tempo dura?',
        a: 'A duração é a mesma para as duas cerimônias (aproximadamente 1h30min cada).',
    },
    {
        q: 'Haverá transmissão online?',
        a: 'Sim, haverá transmissão pelo nosso canal oficial no YouTube (youtube.com/ibopvh). Contudo, fazemos a ressalva de que, embora a participação online tenha valor, a experiência desta semana só será vivida por completo com a participação presencial e a comunhão da igreja.',
    },
    {
        q: 'Como falar com a igreja?',
        a: 'Entre em contato pelo WhatsApp ou Instagram da Igreja Batista Olaria. Os dados estão no rodapé desta página.',
    },
];

interface FAQItemProps { q: string; a: string; }
function FAQItem({ q, a }: FAQItemProps) {
    const [open, setOpen] = useState(false);
    const id = q.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '');
    return (
        <div className="border-b border-stone-800 last:border-b-0">
            <button
                className="w-full flex justify-between items-center py-5 text-left gap-4 group"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-controls={`faq-answer-${id}`}
            >
                <span className="text-stone-300 font-medium text-sm md:text-base group-hover:text-stone-100 transition-colors">{q}</span>
                <ChevronDown
                    size={18}
                    className={`text-stone-600 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                />
            </button>
            <div 
                id={`faq-answer-${id}`}
                className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-40 pb-5' : 'max-h-0'}`}
            >
                <p className="text-stone-500 text-sm leading-relaxed">{a}</p>
            </div>
        </div>
    );
}

export function PascoaFAQ() {
    return (
        <section id="faq" className="py-24 bg-stone-950 px-4">
            <div className="max-w-3xl mx-auto">

                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif text-stone-100 mb-4">Perguntas Frequentes</h2>
                    <p className="text-stone-500 text-sm">Tire suas dúvidas antes de vir</p>
                </div>

                <div className="bg-stone-900/50 border border-stone-800 rounded-2xl px-6 md:px-8">
                    {faqs.map((faq, i: number) => (
                        <FAQItem key={i} q={faq.q} a={faq.a} />
                    ))}
                </div>

            </div>
        </section>
    );
}
