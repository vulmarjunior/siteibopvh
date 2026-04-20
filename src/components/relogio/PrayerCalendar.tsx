import React, { useState, useEffect } from 'react';
import { Loader2, Users, CheckCircle2 } from 'lucide-react';
import ReservationModal from './ReservationModal';

interface PrayerCalendarProps {
  date: Date;
  onReservationSuccess: () => void;
}

const PrayerCalendar: React.FC<PrayerCalendarProps> = ({ date, onReservationSuccess }) => {
  const [slots, setSlots] = useState<Record<string, string[]>>({});
  const [capacity, setCapacity] = useState(4);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Get YYYY-MM-DD from the date object (which is already normalized to church date)
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slotsRes, statsRes] = await Promise.all([
        fetch(`/api/relogio/slots?date=${dateStr}`),
        fetch('/api/relogio/stats')
      ]);
      
      if (slotsRes.ok) {
        const data = await slotsRes.json();
        setSlots(data);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setCapacity(statsData.capacity || 4);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateStr]);

  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  // Get current time in Porto Velho for "isPast" check
  const getChurchNow = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Porto_Velho',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const y = parts.find(p => p.type === 'year')?.value;
    const m = parts.find(p => p.type === 'month')?.value;
    const d = parts.find(p => p.type === 'day')?.value;
    const h = parts.find(p => p.type === 'hour')?.value;
    const min = parts.find(p => p.type === 'minute')?.value;
    const s = parts.find(p => p.type === 'second')?.value;
    return new Date(`${y}-${m}-${d}T${h}:${min}:${s}`);
  };

  const churchTime = getChurchNow();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
        <p className="text-stone-500 text-sm uppercase tracking-widest">Carregando horários...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {hours.map((hour) => {
        const intercessors = slots[hour] || [];
        const isFull = intercessors.length >= capacity;
        
        // Correct isPast check using Porto Velho time
        const slotDate = new Date(dateStr + 'T' + hour);
        const isPast = slotDate < churchTime;
        
        return (
          <div
            key={hour}
            onClick={() => !isFull && !isPast && setSelectedSlot(hour)}
            className={`
              relative group p-5 rounded-2xl border transition-all duration-300
              ${isFull 
                ? 'bg-stone-900/50 border-white/5 opacity-60 cursor-not-allowed' 
                : isPast
                ? 'bg-stone-900/30 border-white/5 opacity-40 cursor-not-allowed'
                : 'bg-stone-800/50 border-white/10 hover:border-amber-500/50 hover:bg-stone-800 cursor-pointer shadow-lg hover:shadow-amber-500/5'
              }
            `}
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`text-2xl font-serif font-bold ${isFull ? 'text-stone-600' : 'text-white'}`}>
                {hour}
              </span>
              <div className="flex gap-1">
                {Array.from({ length: capacity }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 h-1.5 rounded-full ${i < intercessors.length ? 'bg-amber-500' : 'bg-stone-700'}`} 
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {intercessors.length > 0 ? (
                intercessors.map((name, i) => (
                  <span key={i} className="text-[10px] uppercase tracking-wider text-amber-500/70 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-[10px] uppercase tracking-wider text-stone-600 font-bold">
                  Vago
                </span>
              )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-1.5 text-stone-500 text-[10px] uppercase tracking-widest font-bold">
                <Users className="w-3 h-3" />
                {intercessors.length}/{capacity}
              </div>
              {isFull ? (
                <span className="text-[10px] uppercase tracking-widest font-bold text-stone-600">Lotado</span>
              ) : isPast ? (
                <span className="text-[10px] uppercase tracking-widest font-bold text-stone-700">Encerrado</span>
              ) : (
                <span className="text-[10px] uppercase tracking-widest font-bold text-amber-500 group-hover:translate-x-1 transition-transform">
                  Reservar →
                </span>
              )}
            </div>
          </div>
        );
      })}

      {selectedSlot && (
        <ReservationModal
          date={date}
          timeStart={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onSuccess={() => {
            fetchData();
            onReservationSuccess();
            setSelectedSlot(null);
          }}
        />
      )}
    </div>
  );
};

export default PrayerCalendar;
