import React, { useState, useEffect } from 'react';
import { Clock, Users, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import PrayerCalendar from '../../components/relogio/PrayerCalendar';
import PrayerStats from '../../components/relogio/PrayerStats';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const RelogioPage: React.FC = () => {
  // Initialize to Porto Velho current date
  const getChurchDate = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Porto_Velho',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    return new Date(`${year}-${month}-${day}T12:00:00`); // Use noon to avoid edge cases
  };

  const [currentDate, setCurrentDate] = useState(getChurchDate());
  const [stats, setStats] = useState({
    currentHour: '',
    currentIntercessors: [],
    dailyCoverage: 0,
    fullCoverage: 0,
    nextEmptySlot: null,
    uniqueIntercessorsMonth: 0,
    totalHoursMonth: 0,
    totalHoursHistory: 0,
    timeline: [],
    capacity: 4
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/relogio/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // 1 minute
    return () => clearInterval(interval);
  }, []);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(245,158,11,0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="inline-block text-amber-500 font-bold uppercase tracking-[0.3em] text-xs mb-4 animate-fade-in">
            Intercessão Contínua
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-amber-100 to-amber-500/50">
            Relógio de Oração
          </h1>
          <p className="text-stone-400 max-w-2xl mx-auto text-lg leading-relaxed mb-10">
            "Perseverai em oração, velando nela com ação de graças." <br />
            <span className="text-stone-500 italic">— Colossenses 4:2</span>
          </p>
          
          <PrayerStats stats={stats} loading={loading} />
        </div>
      </section>

      {/* Calendar Section */}
      <section className="pb-32">
        <div className="container mx-auto px-4">
          <div className="bg-stone-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl">
            {/* Date Navigation */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <CalendarIcon className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-white">
                    {currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </h2>
                  <p className="text-stone-500 text-sm uppercase tracking-widest">
                    {currentDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => changeDate(-1)}
                  className="p-3 rounded-xl bg-stone-800 border border-white/5 hover:bg-stone-700 hover:border-amber-500/30 transition-all text-stone-400 hover:text-amber-500"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 rounded-xl bg-stone-800 border border-white/5 hover:bg-stone-700 hover:border-amber-500/30 transition-all text-sm font-bold text-stone-400 hover:text-amber-500"
                >
                  Hoje
                </button>
                <button 
                  onClick={() => changeDate(1)}
                  className="p-3 rounded-xl bg-stone-800 border border-white/5 hover:bg-stone-700 hover:border-amber-500/30 transition-all text-stone-400 hover:text-amber-500"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <PrayerCalendar date={currentDate} onReservationSuccess={fetchStats} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RelogioPage;
