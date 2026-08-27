import React, { useState } from 'react';
import { X, BookOpen, Send, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface SentinelHandoverModalProps {
  currentDayOfMonth: number;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_VERSES = [
  'Colossenses 4:2 — "Perseverai na oração, vigiando com ações de graças."',
  'Efésios 6:18 — "Com toda oração e súplica, orando em todo tempo no Espírito."',
  '1 Timóteo 2:1 — "Exorto que se use a prática de súplicas, orações, intercessões e ações de graças."',
  'Filipenses 4:6 — "Sejam conhecidas diante de Deus as vossas petições, pela oração e pela súplica, com ações de graças."',
  'Hebreus 4:16 — "Aproximemo-nos, portanto, confiantemente, junto ao trono da graça."',
  '1 Tessalonicenses 5:17-18 — "Orai sem cessar. Em tudo, dai graças."',
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
        throw new Error(data.error || 'Erro ao registrar a conclusão da oração.');
      }

      setNotifiedCount(data.notifiedSentinelsCount || 0);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao registrar a oração.');
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
              Intercessão Registrada com Gratidão
            </h3>
            <p className="text-stone-300 text-sm max-w-sm mx-auto leading-relaxed">
              Sua oração do Dia {currentDayOfMonth} foi confirmada. 
              {notifiedCount > 0
                ? ` ${notifiedCount} irmão(s) da escala de amanhã receberam a sua saudação fraterna.`
                : ' Que o Senhor continue edificando a nossa igreja.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Topo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400">
                  Comunhão dos Santos
                </span>
                <h3 className="text-2xl font-serif font-bold text-white">
                  Registrar Oração do Dia
                </h3>
              </div>
            </div>

            <p className="text-stone-300 text-sm leading-relaxed">
              Confirme a realização do seu momento de oração de hoje e compartilhe uma saudação bíblica de encorajamento para os irmãos da escala seguinte.
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
                  Saudação aos Irmãos da Próxima Escala (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ex: Intercedemos com gratidão pelas famílias e pelo ministério da igreja. Que o Senhor renove as forças dos irmãos de amanhã!"
                  className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-white/10 text-white placeholder:text-stone-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-300 mb-1.5">
                  Texto Bíblico Neotestamentário
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
                    <span>Registrando Oração...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Concluir Oração & Transmitir Escala</span>
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
