import React, { useState } from 'react';
import { X, Shield, Send, CheckCircle2, Loader2, AlertCircle, Sparkles } from 'lucide-react';

interface SentinelHandoverModalProps {
  currentDayOfMonth: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_VERSES = [
  'Salmos 121:4 — "Eis que não tosquenejará nem dormirá o guarda de Israel."',
  'Colossenses 4:2 — "Perseverai em oração, velando nela com ação de graças."',
  'Isaías 62:6 — "Sobre os teus muros, ó Jerusalém, pus guardas..."',
  '1 Tessalonicenses 5:17 — "Orai sem cessar."',
  'Efésios 6:18 — "Orando em todo tempo com toda oração e súplica no Espírito."',
];

export const SentinelHandoverModal: React.FC<SentinelHandoverModalProps> = ({
  currentDayOfMonth,
  onClose,
  onSuccess,
}) => {
  const [authorName, setAuthorName] = useState('');
  const [message, setMessage] = useState('');
  const [verse, setVerse] = useState(PRESET_VERSES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notifiedCount, setNotifiedCount] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/relogio/sentinelas/passar-bastao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName,
          message: message.trim() || undefined,
          verse: verse.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao registrar a passagem do bastão.');
      }

      setNotifiedCount(data.notifiedSentinelsCount || 0);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao passar o bastão.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-stone-900 border border-amber-500/30 p-6 md:p-8 shadow-2xl">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-8 space-y-4 animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white">
              Bastão Transmitido com Glória!
            </h3>
            <p className="text-stone-300 text-sm max-w-sm mx-auto leading-relaxed">
              Sua vigília do Dia {currentDayOfMonth} foi registrada. 
              {notifiedCount > 0
                ? ` ${notifiedCount} sentinela(s) do próximo dia receberam a sua palavra de ânimo.`
                : ' A chama no altar permanece acesa!'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Topo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                  Troca de Sentinelas
                </span>
                <h3 className="text-2xl font-serif font-bold text-white">
                  Passar o Bastão da Vigília
                </h3>
              </div>
            </div>

            <p className="text-stone-400 text-sm leading-relaxed">
              Registre a conclusão de sua oração de hoje e deixe uma palavra bíblica de encorajamento para os sentinelas da próxima guarda.
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  Seu Nome *
                </label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Ex: Carlos Oliveira ou Família Oliveira"
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-white/10 text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  Palavra de Ânimo para a Próxima Guarda (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ex: Oramos hoje especialmente pelos jovens e famílias. Sejam fortalecidos na brecha!"
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-white/10 text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  Versículo da Transmissão
                </label>
                <select
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-white/10 text-white focus:outline-none focus:border-amber-500/60 text-xs md:text-sm"
                >
                  {PRESET_VERSES.map((v, i) => (
                    <option key={i} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-[0.99] disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Transmitindo o Bastão...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    <span>Concluir Vigília & Transmitir Bastão</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SentinelHandoverModal;
