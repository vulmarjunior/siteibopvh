import React, { useState, useEffect, useCallback } from 'react';
import { Shield, BookOpen, Users, Calendar, HeartHandshake, Loader2, UserPlus } from 'lucide-react';
import dayjs from 'dayjs';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SentinelWatchTower from '../../components/relogio/SentinelWatchTower';
import SentinelWeekGrid, { WeekDayItem } from '../../components/relogio/SentinelWeekGrid';
import SentinelSubscribeModal from '../../components/relogio/SentinelSubscribeModal';
import SentinelHandoverModal from '../../components/relogio/SentinelHandoverModal';
import PrayerTopicsSection, { PrayerTopicItem } from '../../components/relogio/PrayerTopicsSection';
import PrayerPraisesSection, { PrayerPraiseItem } from '../../components/relogio/PrayerPraisesSection';
import PrayerOccupancyChart from '../../components/relogio/PrayerOccupancyChart';

interface WeekDataResponse {
  days: WeekDayItem[];
  capacity: number;
  currentDayOfWeek: number;
  currentDateStr: string;
  startDate: string;
  endDate: string;
  formattedRange: string;
  totalSentinels: number;
}

interface WatchTowerData {
  today: {
    dayOfWeek: number;
    dayName: string;
    dateStr: string;
    formattedDate: string;
    sentinels: { id: number; name: string }[];
    handovers: { id: number; authorName: string; message: string | null; verse: string | null; completedAt: string }[];
    isCompleted: boolean;
  };
  recentHandovers: {
    id: number;
    dayOfWeek: number;
    date: string;
    authorName: string;
    message: string | null;
    verse: string | null;
    completedAt: string;
  }[];
}

const RelogioPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [currentWeekStartDate, setCurrentWeekStartDate] = useState<string | null>(null);
  const [weekData, setWeekData] = useState<WeekDataResponse | null>(null);
  const [towerData, setTowerData] = useState<WatchTowerData | null>(null);
  const [topics, setTopics] = useState<PrayerTopicItem[]>([]);
  const [praises, setPraises] = useState<PrayerPraiseItem[]>([]);

  // Estados de modais
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [selectedDayOfWeekToSubscribe, setSelectedDayOfWeekToSubscribe] = useState<number | null>(null);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);

  const fetchWeekData = useCallback(async (startDateStr?: string | null) => {
    try {
      const url = startDateStr
        ? `/api/relogio/sentinelas/semana?startDate=${startDateStr}`
        : '/api/relogio/sentinelas/semana';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setWeekData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar semana da escala:', error);
    }
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      await Promise.all([
        fetchWeekData(currentWeekStartDate),
        fetch('/api/relogio/sentinelas/bastao-atual')
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => data && setTowerData(data)),
        fetch('/api/relogio/sentinelas/motivos')
          .then((r) => (r.ok ? r.json() : []))
          .then((data) => setTopics(data)),
        fetch('/api/relogio/sentinelas/testemunhos')
          .then((r) => (r.ok ? r.json() : []))
          .then((data) => setPraises(data)),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados do Relógio de Oração:', error);
    } finally {
      setLoading(false);
    }
  }, [currentWeekStartDate, fetchWeekData]);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // Navegação de Semanas
  const handlePrevWeek = () => {
    if (!weekData) return;
    const prev = dayjs(weekData.startDate).subtract(7, 'day').format('YYYY-MM-DD');
    setCurrentWeekStartDate(prev);
    fetchWeekData(prev);
  };

  const handleNextWeek = () => {
    if (!weekData) return;
    const next = dayjs(weekData.startDate).add(7, 'day').format('YYYY-MM-DD');
    setCurrentWeekStartDate(next);
    fetchWeekData(next);
  };

  const handleCurrentWeek = () => {
    setCurrentWeekStartDate(null);
    fetchWeekData(null);
  };

  const handleOpenSubscribe = (dayOfWeek?: number) => {
    setSelectedDayOfWeekToSubscribe(
      typeof dayOfWeek === 'number' ? dayOfWeek : weekData?.currentDayOfWeek || 1
    );
    setIsSubscribeModalOpen(true);
  };

  const handleTopicPrayed = (topicId: number, newCount: number) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, prayedCount: newCount } : t))
    );
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const coveredDaysCount = weekData ? weekData.days.filter((d) => d.count > 0).length : 0;
  const isCurrentWeek = weekData ? !currentWeekStartDate || weekData.startDate === dayjs().startOf('isoWeek').format('YYYY-MM-DD') : true;

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans selection:bg-amber-500 selection:text-stone-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(245,158,11,0.12),transparent_70%)]" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold uppercase tracking-[0.25em] text-xs mb-5 animate-fade-in shadow-sm">
            <HeartHandshake className="w-4 h-4 text-amber-500" />
            Ministério de Oração & Intercessão
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-amber-100 to-amber-500/60 tracking-tight">
            Relógio de Oração
          </h1>

          <p className="text-stone-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-8">
            "Perseverai na oração, vigiando com ações de graças. Suplicai, ao mesmo tempo, também por nós, para que Deus nos abra porta à palavra."
            <br />
            <span className="text-amber-400 font-serif italic text-sm md:text-base">— Colossenses 4:2-3</span>
          </p>

          {/* Botões de Ação do Hero */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
            <button
              onClick={() => handleOpenSubscribe()}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar meu Dia de Oração</span>
            </button>

            <button
              onClick={() => scrollToSection('motivos-oracao')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-750 border border-white/10 hover:border-amber-500/30 text-stone-200 font-bold text-sm tracking-wide transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Ver Guia de Motivos</span>
            </button>
          </div>

          {/* Cards de Métricas Vivas */}
          {weekData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto">
              <div className="p-4 md:p-5 rounded-2xl bg-stone-850/80 border border-white/5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs uppercase tracking-wider font-bold mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Dias Cobertos
                </div>
                <div className="text-2xl md:text-3xl font-serif font-bold text-white">
                  {coveredDaysCount}/7
                </div>
                <div className="text-[11px] text-stone-400 mt-1">na semana</div>
              </div>

              <div className="p-4 md:p-5 rounded-2xl bg-stone-850/80 border border-white/5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs uppercase tracking-wider font-bold mb-1">
                  <Users className="w-3.5 h-3.5" />
                  Intercessores
                </div>
                <div className="text-2xl md:text-3xl font-serif font-bold text-white">
                  {weekData.totalSentinels}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">cadastrados</div>
              </div>

              <div className="p-4 md:p-5 rounded-2xl bg-stone-850/80 border border-white/5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs uppercase tracking-wider font-bold mb-1">
                  <Shield className="w-3.5 h-3.5" />
                  Escala de Hoje
                </div>
                <div className="text-2xl md:text-3xl font-serif font-bold text-white">
                  {towerData?.today?.dayName?.split('-')[0] || 'Hoje'}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">
                  {towerData?.today?.isCompleted ? '✓ Oração Realizada' : '⏳ Em Andamento'}
                </div>
              </div>

              <div className="p-4 md:p-5 rounded-2xl bg-stone-850/80 border border-white/5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs uppercase tracking-wider font-bold mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  Capacidade
                </div>
                <div className="text-2xl md:text-3xl font-serif font-bold text-white">
                  {weekData.capacity}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">irmãos/dia</div>
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
              Carregando a Escala de Oração...
            </p>
          </div>
        ) : (
          <>
            {/* 1. Painel de Intercessores de Hoje & Transmissão Fraterna */}
            <SentinelWatchTower
              todayData={towerData ? towerData.today : null}
              recentHandovers={towerData ? towerData.recentHandovers : []}
              onOpenHandoverModal={() => setIsHandoverModalOpen(true)}
            />

            {/* 2. Guia Pastoral de Oração da Semana */}
            {topics.length > 0 && (
              <div id="motivos-oracao" className="scroll-mt-28">
                <PrayerTopicsSection
                  topics={topics}
                  onTopicPrayed={handleTopicPrayed}
                />
              </div>
            )}

            {/* 3. Grade dos 7 Dias da Semana com Navegação */}
            {weekData && (
              <SentinelWeekGrid
                days={weekData.days}
                capacity={weekData.capacity}
                formattedRange={weekData.formattedRange}
                isCurrentWeek={isCurrentWeek}
                onPrevWeek={handlePrevWeek}
                onNextWeek={handleNextWeek}
                onCurrentWeek={handleCurrentWeek}
                onSelectDayToSubscribe={(dayOfWeek) => handleOpenSubscribe(dayOfWeek)}
              />
            )}

            {/* 4. Gráfico de Ocupação & Termômetro da Semana */}
            {weekData && (
              <PrayerOccupancyChart
                days={weekData.days}
                capacity={weekData.capacity}
                onSelectDayToSubscribe={(dayOfWeek) => handleOpenSubscribe(dayOfWeek)}
              />
            )}

            {/* 5. Ações de Graças & Providência Divina */}
            {praises.length > 0 && (
              <PrayerPraisesSection praises={praises} />
            )}
          </>
        )}
      </main>

      {/* Modais */}
      {isSubscribeModalOpen && (
        <SentinelSubscribeModal
          initialDayOfWeek={selectedDayOfWeekToSubscribe}
          weekDaysData={weekData?.days}
          capacity={weekData?.capacity || 4}
          onClose={() => setIsSubscribeModalOpen(false)}
          onSuccess={() => {
            setIsSubscribeModalOpen(false);
            fetchAllData();
          }}
        />
      )}

      {isHandoverModalOpen && (
        <SentinelHandoverModal
          currentDayOfMonth={towerData?.today?.dayOfWeek || 1}
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
