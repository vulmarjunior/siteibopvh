import React, { useState } from 'react';
import { Copy, Check, Heart, Building2, Smartphone } from 'lucide-react';

const ContributeSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const pixKey = "04.771.507/0001-08";

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contribua" className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute right-0 top-0 w-1/3 h-full bg-stone-50 skew-x-12 transform translate-x-20 -z-10"></div>

      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          {/* Texto Teológico (Esquerda) */}
          <div className="self-center">
            <div className="inline-flex items-center gap-2 text-olaria font-bold uppercase tracking-wider text-sm mb-4">
              <Heart className="w-4 h-4" />
              <span>Contribuição</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-6">Por Que Dízimos e Ofertas?</h2>

            <div className="prose prose-stone text-stone-600 font-sans text-lg">
              <p className="mb-4">
                Entendemos a contribuição não como uma obrigação ou taxa, mas como um ato de adoração, gratidão e desapego.
              </p>
              <p className="mb-4">
                Como nos ensina o apóstolo Paulo: <span className="italic text-stone-800 font-medium">"Deus ama quem dá com alegria" (2Co 9.7)</span>.
              </p>
              <p>
                Somos uma igreja mantida exclusivamente por dízimos e ofertas voluntárias. Se você deseja apoiar nosso ministério, faça-o com liberdade, reflexão e coração grato.
              </p>
            </div>
          </div>

          {/* Card de Doação (Direita) */}
          <div className="bg-stone-850 p-8 rounded-2xl text-white shadow-2xl relative border-t-4 border-olaria">

            <h3 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
              Dados para Doação
            </h3>

            <div className="space-y-6">

              {/* BLOCO 1: PIX */}
              <div className="bg-stone-800/50 rounded-xl border border-stone-700 overflow-hidden">
                <div className="bg-stone-800 px-6 py-3 border-b border-stone-700 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-olaria" />
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-300">Opção 1: Pix (Instantâneo)</span>
                </div>

                <div className="p-6 flex flex-col md:flex-row items-center gap-6">
                  {/* QR Code */}
                  <div className="bg-white p-2 rounded-lg shrink-0">
                    <img
                      src="/images/qrcode-pix.svg"
                      alt="QR Code PIX"
                      className="w-32 h-32 object-contain"
                    />
                  </div>

                  {/* Chave e Botão */}
                  <div className="flex-1 w-full text-center md:text-left">
                    <p className="text-stone-400 text-xs uppercase mb-2">Chave Pix (CNPJ)</p>
                    <div className="flex flex-col gap-3">
                      <code className="text-lg font-mono text-white bg-stone-900 px-3 py-2 rounded border border-stone-700 block truncate">
                        {pixKey}
                      </code>
                      <button
                        onClick={handleCopy}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${copied
                          ? 'bg-green-600 text-white'
                          : 'bg-olaria hover:bg-olaria-600 text-white hover:-translate-y-0.5'
                          }`}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? "Copiado!" : "Copiar Chave"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOCO 2: DADOS BANCÁRIOS */}
              <div className="bg-stone-800/50 rounded-xl border border-stone-700 overflow-hidden">
                <div className="bg-stone-800 px-6 py-3 border-b border-stone-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-olaria" />
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-300">Opção 2: Transferência</span>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-stone-900/50 p-3 rounded border border-stone-700/50">
                      <p className="text-stone-500 text-[10px] uppercase tracking-wider mb-1">Banco</p>
                      <p className="font-bold text-sm">Sicoob (756)</p>
                    </div>
                    <div className="bg-stone-900/50 p-3 rounded border border-stone-700/50">
                      <p className="text-stone-500 text-[10px] uppercase tracking-wider mb-1">Agência</p>
                      <p className="font-mono text-lg text-olaria">3306</p>
                    </div>
                    <div className="bg-stone-900/50 p-3 rounded border border-stone-700/50">
                      <p className="text-stone-500 text-[10px] uppercase tracking-wider mb-1">Conta</p>
                      <p className="font-mono text-lg text-olaria">6.276-6</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Favorecido Comum */}
              <div className="text-center border-t border-stone-800 pt-4">
                <p className="text-stone-400 text-xs">Favorecido em ambas as opções:</p>
                <p className="text-white font-serif font-bold text-sm mt-1">Igreja Batista Olaria</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContributeSection;