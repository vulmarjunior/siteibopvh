import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Flame, Users, Calendar, Sparkles, Loader2, HeartHandshake } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SentinelWatchTower from '../../components/relogio/SentinelWatchTower';
import SentinelMonthGrid from '../../components/relogio/SentinelMonthGrid';
import SentinelSubscribeModal from '../../components/relogio/SentinelSubscribeModal';
import SentinelHandoverModal from '../../components/relogio/SentinelHandoverModal';
import PrayerTopicsSection, { PrayerTopicItem } from '../../components/relogio/PrayerTopicsSection';
import PrayerPraisesSection, { PrayerPraiseItem } from '../../components/relogio/PrayerPraisesSection';

interface SentinelMonthData {
  days: Record<number, { sentinels: { id: number; name: string }[]; count: number; isFull: boolean }>;
  capacity: number;
  currentDayOfMonth: number;
  currentDateStr: string;
  totalSentinels: number;
  coveredDaysCount: number;
  todayHandoversCount: number;
}

interface WatchTowerData {
  today: {
    dayOfMonth: number;
    dateStr: string;
    formattedDate: string;
    sentinels: { id: number; name: string }[];
    handovers: { id: number; authorName: string; message: string | null; verse: string | null; completedAt: string }[];
    isCompleted: boolean;
  };
  recentHandovers: {
    id: number;
    dayOfMonth: number;
    date: string;
    authorName: string;
    message: string | null;
    verse: string | null;
    completedAt: string;
  }[];
}

const RelogioPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [monthData, setMonthData] = useState<SentinelMonthData | null>(null);
  const [towerData, setTowerData] = useState<WatchTowerData | null>(null);
  const [topics, setTopics] = useState<PrayerTopicItem[]>([]);
  const [praises, setPraises] = useState<PrayerPraiseItem[]>([]);

  // Estados de modais
  const [selectedDayToSubscribe, setSelectedDayToSubscribe] = useState<number | null>(null);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

  const fetchAllData = useCallback(async () => {
    try {
      const [monthRes, towerRes, topicsRes, praisesRes] = await Promise.all([
        fetch('/api/relogio/sentinelas/mes'),
        fetch('/api/relogio/sentinelas/bastao-atual'),
        fetch('/api/relogio/sentinelas/motivos'),
        fetch('/api/relogio/sentinelas/testemunhos'),
      ]);

      if (monthRes.ok) {
        const data = await monthRes.json();
        setMonthData(data);
      }
      if (towerRes.ok) {
        const data = await towerRes.json();
        setTowerData(data);
      }
      if (topicsRes.ok) {
        const data = await topicsRes.json();
        setTopics(data);
      }
      if (praisesRes.ok) {
        const data = await praisesRes.json();
        setPraises(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do Relógio de Oração:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000); // Atualiza a cada 1 minuto
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleTopicPrayed = (topicId: number, newCount: number) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, prayedCount: newCount } : t))
    );
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(245,158,11,0.12),transparent_70%)]" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold uppercase tracking-[0.25em] text-xs mb-5 animate-fade-in shadow-sm">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            Vigília Contínua dos Sentinelas
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-amber-100 to-amber-500/60 tracking-tight">
            Relógio de Oração
          </h1>

          <p className="text-stone-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-10">
            "Sobre os teus muros, ó Jerusalém, pus guardas, que todo o dia e toda a noite jamais se calarão; vós, os que fareis lembrado o Senhor, não descanseis."
            <br />
            <span className="text-amber-400/90 font-serif italic text-sm md:text-base">— Isaías 62:6</span>
          </p>

          {/* Cards de Métricas Vivas */}
          {monthData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
              <div className="p-4 md:p-5 rounded-2xl bg-stone-850/80 border border-white/5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs uppercase tracking-wider font-bold mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Dias Cobertos
                </div>
                <div className="text-2xl md:text-3xl font-serif font-bold text-white">
                  {monthData.coveredDaysCount}/31
                </div>
                <div className="text-[11px] text-stone-400 mt-1">no mês</div>
              </div>

              <div className="p-4 md:p-5 rounded-2xl bg-stone-850/80 border border-white/5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs uppercase tracking-wider font-bold mb-1">
                  <Users className="w-3.5 h-3.5" />
                  Sentinelas
                </div>
                <div className="text-2xl md:text-3xl font-serif font-bold text-white">
                  {monthData.totalSentinels}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">na brecha</div>
              </div>

              <div className="p-4 md:p-5 rounded-2xl bg-stone-850/80 border border-white/5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs uppercase tracking-wider font-bold mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  Vigília de Hoje
                </div>
                <div className="text-2xl md:text-3xl font-serif font-bold text-white">
                  Dia {monthData.currentDayOfMonth}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">
                  {monthData.todayHandoversCount > 0 ? '🔥 Guarda Cumprida' : '⏳ Em Andamento'}
                </div>
              </div>

              <div className="p-4 md:p-5 rounded-2xl bg-stone-850/80 border border-white/5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs uppercase tracking-wider font-bold mb-1">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  Capacidade
                </div>
                <div className="text-2xl md:text-3xl font-serif font-bold text-white">
                  {monthData.capacity}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">sentinelas/dia</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 pb-24 space-y-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <p className="text-stone-400 text-xs uppercase tracking-widest font-bold">
              Carregando a Torre dos Sentinelas...
            </p>
          </div>
        ) : (
          <>
            {/* 1. Painel da Torre de Guarda de Hoje & Bastão */}
            <SentinelWatchTower
              todayData={towerData ? towerData.today : null}
              recentHandovers={towerData ? towerData.recentHandovers : []}
              onOpenHandoverModal={() => setIsHandoverModalOpen(true)}
            />

            {/* 2. Motivos de Oração da Semana (Mural Vivo com 'Já Orei') */}
            {topics.length > 0 && (
              <PrayerTopicsSection
                topics={topics}
                onTopicPrayed={handleTopicPrayed}
              />
            )}

            {/* 3. Grade dos 31 Dias do Mês */}
            {monthData && (
              <SentinelMonthGrid
                days={monthData.days}
                capacity={monthData.capacity}
                currentDayOfMonth={monthData.currentDayOfMonth}
                onSelectDayToSubscribe={(day) => setSelectedDayToSubscribe(day)}
              />
            )}

            {/* 4. Mural de Gratidão e Respostas de Oração */}
            {praises.length > 0 && (
              <PrayerPraisesSection praises={praises} />
            )}
          </>
        )}
      </main>

      {/* Modais */}
      {selectedDayToSubscribe && (
        <SentinelSubscribeModal
          dayOfMonth={selectedDayToSubscribe}
          onClose={() => setSelectedDayToSubscribe(null)}
          onSuccess={() => {
            setSelectedDayToSubscribe(null);
            fetchAllData();
          }}
        />
      )}

      {isHandoverModalOpen && monthData && (
        <SentinelHandoverModal
          currentDayOfMonth={monthData.currentDayOfMonth}
          onClose={() => setIsHandoverModalOpen(false)}
          onSuccess={() => {
            setIsHandoverModalOpen(false);
            fetchAllData();
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default RelogioPage;
