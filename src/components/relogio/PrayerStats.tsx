import React from 'react';
import { Clock, Users, Flame, Shield, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PrayerStatsProps {
  stats: {
    currentHour: string;
    currentIntercessors: string[];
    dailyCoverage: number;
    fullCoverage: number;
    nextEmptySlot: string | null;
    uniqueIntercessorsMonth: number;
    totalHoursMonth: number;
    totalHoursHistory: number;
    timeline: { hour: string; count: number; isFull: boolean }[];
    capacity: number;
  };
  loading: boolean;
}

const PrayerStats: React.FC<PrayerStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const coveragePercent = (stats.dailyCoverage / 24) * 100;
  
  const getInspirationalPhrase = (percent: number) => {
    if (percent === 100) return "Glória a Deus! Toda hora de hoje tem um intercessor.";
    if (percent >= 76) return "Quase lá. Faltam poucos horários para cobertura total.";
    if (percent >= 51) return "Mais da metade do dia já tem intercessores. Junte-se a eles.";
    if (percent >= 26) return "Metade do dia já está coberta. A oração não para.";
    return "A intercessão da IBO está começando. Seja um dos primeiros.";
  };

  // Prepare data for the bar chart
  const chartData = stats.timeline.map(slot => ({
    hour: slot.hour.split(':')[0],
    count: slot.count,
    fullHour: slot.hour
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-stone-900 border border-white/10 p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">{payload[0].payload.fullHour}</p>
          <p className="text-sm font-bold text-amber-500">{payload[0].value} Intercessores</p>
          <p className="text-[9px] text-stone-400 mt-1">{payload[0].value === stats.capacity ? 'Capacidade Máxima' : `${stats.capacity - payload[0].value} vagas disponíveis`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto mt-12">
      {/* Dynamic Phrase */}
      <div className="text-center animate-fade-in">
        <p className="text-amber-500 font-serif italic text-xl md:text-2xl">
          "{getInspirationalPhrase(coveragePercent)}"
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Em Oração Agora */}
        <div className="bg-stone-800/40 backdrop-blur-md border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Flame className="w-10 h-10 text-amber-500" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-amber-500 mb-2 block">
            Em Oração Agora
          </span>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-serif font-bold text-white">{stats.currentHour}</span>
            <span className="text-stone-500 text-[10px] uppercase tracking-widest">Ativo</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {stats.currentIntercessors.length > 0 ? (
              stats.currentIntercessors.map((name, i) => (
                <span key={i} className="text-[9px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-bold">
                  {name}
                </span>
              ))
            ) : (
              <span className="text-[9px] text-stone-600 font-bold uppercase tracking-widest">Vazio</span>
            )}
          </div>
        </div>

        {/* Cobertura do Dia */}
        <div className="bg-stone-800/40 backdrop-blur-md border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Shield className="w-10 h-10 text-amber-500" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-amber-500 mb-2 block">
            Cobertura do Dia
          </span>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-serif font-bold text-white">{stats.dailyCoverage}</span>
            <span className="text-stone-500 text-[10px] uppercase tracking-widest">de 24h</span>
          </div>
          <div className="w-full bg-stone-900 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-amber-500 h-full transition-all duration-1000" 
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
          <p className="text-[9px] text-stone-500 mt-2 uppercase tracking-widest">
            {stats.fullCoverage} slots com cobertura total ({stats.capacity}/{stats.capacity})
          </p>
        </div>

        {/* Intercessores do Mês */}
        <div className="bg-stone-800/40 backdrop-blur-md border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-10 h-10 text-amber-500" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-amber-500 mb-2 block">
            Intercessores do Mês
          </span>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-serif font-bold text-white">{stats.uniqueIntercessorsMonth}</span>
            <span className="text-stone-500 text-[10px] uppercase tracking-widest">Pessoas</span>
          </div>
          <p className="text-[9px] text-stone-500 uppercase tracking-widest">
            {stats.totalHoursMonth}h de relógio cobertas este mês
          </p>
        </div>

        {/* Histórico Total */}
        <div className="bg-amber-500 p-5 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
            <TrendingUp className="w-10 h-10 text-stone-950" />
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-950/60 mb-2 block">
            Legado de Oração
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-950">{stats.totalHoursHistory}</span>
            <span className="text-stone-950/60 text-[10px] uppercase tracking-widest font-bold">Horas</span>
          </div>
          <p className="text-[9px] text-stone-950/70 mt-1 uppercase tracking-widest font-bold">
            Horas únicas de relógio cobertas
          </p>
        </div>
      </div>

      {/* Chart and Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Peak Hours Chart */}
        <div className="lg:col-span-2 bg-stone-800/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <BarChart3 className="w-4 h-4 text-amber-500" />
            </div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">
              Densidade de Intercessão (Hoje)
            </h4>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 10, fontWeight: 'bold' }}
                  interval={2}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#78716c', fontSize: 10, fontWeight: 'bold' }}
                  domain={[0, stats.capacity]}
                  ticks={[0, 1, 2, 3, 4]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.count === 0 ? '#292524' : entry.count >= stats.capacity ? '#f59e0b' : '#f59e0b80'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 24h Timeline Visualizer */}
        <div className="bg-stone-800/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">
              Mapa de Cobertura
            </h4>
          </div>
          
          <div className="grid grid-cols-6 gap-2 h-full content-start">
            {stats.timeline.map((slot, i) => {
              const isCurrent = slot.hour === stats.currentHour;
              const opacity = slot.count === 0 ? 'bg-stone-900' : 
                             slot.count === 1 ? 'bg-amber-500/30' :
                             slot.count === 2 ? 'bg-amber-500/50' :
                             slot.count === 3 ? 'bg-amber-500/80' : 'bg-amber-500';
              
              return (
                <div 
                  key={i} 
                  className={`
                    relative aspect-square rounded-lg transition-all duration-500 group flex flex-col items-center justify-center
                    ${opacity}
                    ${isCurrent ? 'ring-2 ring-white ring-offset-2 ring-offset-stone-900 z-10' : ''}
                  `}
                >
                  <span className={`text-[8px] font-bold ${slot.count === 0 ? 'text-stone-700' : 'text-white'}`}>
                    {slot.hour.split(':')[0]}
                  </span>
                  {slot.count > 0 && (
                    <span className="text-[7px] text-white/60 font-bold">{slot.count}</span>
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white text-stone-950 text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                    {slot.hour} • {slot.count}/{stats.capacity}
                  </div>
                </div>
              );
            })}
          </div>
          
          {stats.nextEmptySlot && (
            <div className="mt-6 flex items-center gap-2 text-amber-500 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
              <Clock className="w-3 h-3" />
              <span className="text-[9px] font-bold uppercase tracking-widest">
                Próximo vazio: {stats.nextEmptySlot}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrayerStats;
