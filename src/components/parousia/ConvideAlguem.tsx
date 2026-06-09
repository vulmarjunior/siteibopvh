import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Check } from 'lucide-react';

export const ConvideAlguem: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleShareWhatsApp = () => {
    const text = `Olá! Quero te convidar para acompanhar uma série de mensagens da nossa igreja: “Da Ascensão à Parousia — O Livro da Longa Peregrinação”.\n\nA série fala sobre a caminhada da Igreja entre a ascensão de Cristo e sua volta gloriosa.\n\nEsperar é caminhar.\n\nVeja aqui:\n${window.location.origin}/da-ascensao-a-parousia`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/da-ascensao-a-parousia`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="convite" className="py-24 px-6 bg-[#1a1d24] border-t border-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-[#d4af37] mb-6">
          Convide alguém para caminhar conosco
        </h2>
        
        <p className="text-lg text-gray-300 leading-relaxed font-light mb-10 max-w-2xl mx-auto">
          “Esta série é um convite para olhar a história à luz de Cristo: sua ascensão, seu governo presente, 
          a missão da Igreja e a esperança da sua volta. Compartilhe esta página com alguém que precisa ouvir 
          sobre a esperança cristã.”
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={handleShareWhatsApp}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white font-semibold rounded hover:bg-green-700 transition-colors w-full sm:w-auto"
          >
            <Share2 className="w-5 h-5" />
            Compartilhar no WhatsApp
          </button>
          
          <button 
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-[#0f1115] text-gray-300 font-semibold rounded border border-gray-700 hover:bg-gray-800 hover:text-white transition-colors w-full sm:w-auto"
          >
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <LinkIcon className="w-5 h-5" />}
            {copied ? 'Link copiado!' : 'Copiar link da série'}
          </button>
        </div>
      </div>
    </section>
  );
};
