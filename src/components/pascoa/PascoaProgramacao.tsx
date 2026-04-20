import { Calendar, Map, CalendarDays, Clock, MapPin } from 'lucide-react';

function generateCalendarLink(event: { title: string; date: string; time: string; location: string }) {
    const { title, date, time, location } = event;
    const [day, month, year] = date.split('/');
    const [hour, minute] = time.split(':');
    const startDate = `${year}${month}${day}T${hour}${minute}00`;
    const endDate = `${year}${month}${day}T${String(Number(hour) + 2).padStart(2, '0')}${minute}00`;
    const encodedTitle = encodeURIComponent(title);
    const encodedLocation = encodeURIComponent(location);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodedTitle}&dates=${startDate}/${endDate}&location=${encodedLocation}`;
}

const events = [
    {
        id: 'tenebras',
        name: 'Cerimônia Tenebras',
        date: '03/04/2026',
        time: '19:00',
        displayDate: '03 de Abril, 2026',
        location: 'Igreja Batista Olaria — Porto Velho',
        mapLink: 'https://www.google.com/maps/search/Igreja+Batista+Olaria+Porto+Velho',
        theme: 'dark',
    },
    {
        id: 'ressurreicao',
        name: 'Culto da Ressurreição',
        date: '05/04/2026',
        time: '06:00',
        displayDate: '05 de Abril, 2026',
        location: 'Igreja Batista Olaria — Porto Velho',
        mapLink: 'https://www.google.com/maps/search/Igreja+Batista+Olaria+Porto+Velho',
        theme: 'light',
    },
];

export function PascoaProgramacao() {
    return (
        <section id="programacao" className="py-24 bg-stone-950 px-4">
            <div className="max-w-5xl mx-auto">

                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif text-stone-100 mb-4">Programação</h2>
                    <p className="text-stone-500 text-sm">Dois momentos, uma mesma jornada</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className={`rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-1 ${event.theme === 'dark'
                                    ? 'bg-stone-900 border-stone-800 hover:border-stone-700'
                                    : 'bg-stone-800/50 border-stone-700/50 hover:border-amber-800/50'
                                }`}
                        >
                            <h3 className="text-2xl font-serif text-stone-100 mb-6">{event.name}</h3>

                            <div className="space-y-3 mb-8">
                                <div className="flex items-center gap-3 text-stone-400 text-sm">
                                    <CalendarDays size={15} className="text-amber-600 flex-shrink-0" />
                                    <span>{event.displayDate}</span>
                                </div>
                                <div className="flex items-center gap-3 text-stone-400 text-sm">
                                    <Clock size={15} className="text-amber-600 flex-shrink-0" />
                                    <span>{event.time}</span>
                                </div>
                                <div className="flex items-center gap-3 text-stone-400 text-sm">
                                    <MapPin size={15} className="text-amber-600 flex-shrink-0" />
                                    <span>{event.location}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <a
                                    href={generateCalendarLink({
                                        title: event.name,
                                        date: event.date,
                                        time: event.time,
                                        location: event.location,
                                    })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 text-sm bg-amber-700 hover:bg-amber-600 text-white px-4 py-2.5 rounded-lg transition-colors font-medium"
                                >
                                    <Calendar size={14} />
                                    Salvar na Agenda
                                </a>
                                <a
                                    href={event.mapLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 text-sm bg-transparent border border-stone-700 hover:border-stone-500 text-stone-400 hover:text-stone-200 px-4 py-2.5 rounded-lg transition-colors font-medium"
                                >
                                    <Map size={14} />
                                    Ver no Mapa
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}
