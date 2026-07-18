import React, { useState } from 'react';
import { Share2, Link as LinkIcon, Check, Mail, Loader2 } from 'lucide-react';

export const ConvideAlguem: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleShareWhatsApp = () => {
    const text = `Olá! Quero te convidar para acompanhar uma série de mensagens da nossa igreja: "Da Ascensão à Parousia — O Livro da Longa Peregrinação".\n\nA série fala sobre a caminhada da Igreja entre a ascensão de Cristo e sua volta gloriosa.\n\nEsperar é caminhar.\n\nVeja aqui:\n${window.location.origin}/da-ascensao-a-parousia`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/da-ascensao-a-parousia`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    try {
      const res = await fetch('/api/parousia/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Inscrição realizada com sucesso!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Erro ao inscrever.');
      }
    } catch {
      setStatus('error');
      setMessage('Erro de conexão. Tente novamente.');
    }
  };

  return (
    <section id="convite" className="py-24 px-6 bg-[#1a1d24] border-t border-gray-800">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-serif text-[#d4af37] mb-6">
          Convide alguém para caminhar conosco
        </h2>

        <p className="text-lg text-gray-300 leading-relaxed font-light mb-10 max-w-2xl mx-auto">
          "Esta série é um convite para olhar a história à luz de Cristo: sua ascensão,
          seu governo presente, a missão da Igreja e a esperança da sua volta.
          Compartilhe esta página com alguém que precisa ouvir sobre a esperança cristã."
        </p>

        {/* Inscrição para leitura semanal */}
        <div className="bg-[#0f1115] rounded-lg border border-gray-800 p-8 mb-12 max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Mail className="w-5 h-5 text-[#d4af37]" />
            <h3 className="text-lg font-serif text-white">Receba a leitura da semana</h3>
          </div>
          <p className="text-sm text-gray-400 mb-6">
            Toda segunda-feira, você recebe a leitura bíblica devocional da semana no seu e-mail.
          </p>

          {status === 'success' ? (
            <div className="flex items-center justify-center gap-2 text-green-400 py-3">
              <Check className="w-5 h-5" />
              <span>{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                placeholder="Seu e-mail"
                required
                className="flex-1 px-4 py-3 bg-[#1a1d24] border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] transition-colors"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-3 bg-[#d4af37] text-[#0f1115] font-semibold rounded hover:bg-[#ebd074] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Receber'
                )}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-red-400 text-sm mt-3">{message}</p>
          )}

          <p className="text-xs text-gray-600 mt-4">
            ✓ Sem spam. Cancele quando quiser.
          </p>
        </div>

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
