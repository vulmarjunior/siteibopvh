import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, Heart, Shield, Globe, Users, Flame, Anchor } from 'lucide-react';

interface ReservationModalProps {
  date: Date;
  timeStart: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ date, timeStart, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    prayerThemes: [] as string[],
    personalRequest: '',
    repeatDays: 1,
  });
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const dateStr = date.toISOString().split('T')[0];
  const timeEnd = `${(parseInt(timeStart.split(':')[0]) + 1).toString().padStart(2, '0')}:00`;

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await fetch('/api/relogio/themes');
        if (res.ok) {
          const data = await res.json();
          setThemes(data);
        }
      } catch (err) {
        console.error('Error fetching themes:', err);
      }
    };
    fetchThemes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/relogio/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: dateStr,
          timeStart,
          timeEnd,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          onSuccess();
        }, 5000); // Close after 5 seconds
      } else {
        setError(data.error || 'Erro ao realizar reserva.');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = (label: string) => {
    setFormData(prev => ({
      ...prev,
      prayerThemes: prev.prayerThemes.includes(label)
        ? prev.prayerThemes.filter(t => t !== label)
        : [...prev.prayerThemes, label]
    }));
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onSuccess} />
        
        <div className="relative w-full max-w-md bg-stone-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl animate-fade-in text-center p-10">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
            <Check className="w-10 h-10 text-amber-500" />
          </div>
          
          <h3 className="text-3xl font-serif font-bold text-white mb-4">
            Reserva Confirmada!
          </h3>
          
          <p className="text-stone-400 mb-8 leading-relaxed">
            Sua participação no Relógio de Oração foi registrada com sucesso. 
            Verifique seu e-mail para mais detalhes e o arquivo de agenda.
          </p>

          <button
            onClick={onSuccess}
            className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-4 rounded-xl transition-all shadow-xl shadow-amber-500/20"
          >
            Entendido
          </button>
          
          <p className="mt-6 text-[10px] text-stone-500 uppercase tracking-widest">
            Esta janela fechará automaticamente...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-stone-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-fade-in">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-amber-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-2 block">
                Reserva de Horário
              </span>
              <h3 className="text-3xl font-serif font-bold text-white">
                {timeStart} – {timeEnd}
              </h3>
              <p className="text-stone-500 text-sm">
                {date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-800 text-stone-500 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Nome Completo</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-stone-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">E-mail</label>
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-stone-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Temas de Oração (Pauta)</label>
              {themes.length === 0 ? (
                <div className="p-4 bg-stone-800/50 border border-white/5 rounded-xl text-center">
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest">Nenhum tema configurado no momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {themes.map(theme => {
                    const isActive = formData.prayerThemes.includes(theme.label);
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => toggleTheme(theme.label)}
                        className={`
                          flex items-center gap-2 p-3 rounded-xl border text-left transition-all
                          ${isActive 
                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' 
                            : 'bg-stone-800/50 border-white/5 text-stone-500 hover:border-white/10'
                          }
                        `}
                      >
                        <Flame className="w-4 h-4 flex-shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wide leading-tight">{theme.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Pedido Pessoal de Oração (Opcional)</label>
              <textarea
                value={formData.personalRequest}
                onChange={e => setFormData({ ...formData, personalRequest: e.target.value })}
                className="w-full bg-stone-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors h-24 resize-none"
                placeholder="Se desejar, escreva aqui seu pedido pessoal..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400 ml-1">Repetir este horário?</label>
              <div className="flex items-center gap-3 bg-stone-800 p-2 rounded-xl border border-white/5">
                <span className="text-xs text-stone-500 ml-2">Repetir por:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setFormData({ ...formData, repeatDays: day })}
                      className={`
                        w-8 h-8 rounded-lg text-xs font-bold transition-all
                        ${formData.repeatDays === day 
                          ? 'bg-amber-500 text-stone-950' 
                          : 'bg-stone-700 text-stone-400 hover:bg-stone-600'
                        }
                      `}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">dias</span>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 text-stone-950 font-bold py-4 rounded-xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Confirmar Reserva
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-stone-500 uppercase tracking-widest">
              Um e-mail de confirmação será enviado com o arquivo de agenda.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;
