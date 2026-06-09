import { MapPin, Car, AccessibilityIcon, Clock } from 'lucide-react';

export function PascoaLocalizacao() {
    return (
        <section id="localizacao" className="py-24 bg-stone-900 px-4">
            <div className="max-w-5xl mx-auto">

                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-serif text-stone-100 mb-4">Como Chegar</h2>
                    <p className="text-stone-500 text-sm">Nos encontramos em Porto Velho, Rondônia</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Map Embed */}
                    <div className="rounded-2xl overflow-hidden border border-stone-800 h-80 lg:h-96">
                        <iframe
                            src="https://maps.google.com/maps?q=R.%20J%C3%BAlio%20de%20Castilho,%201368.%20Olaria,%20Porto%20Velho%20-%20RO&t=&z=16&ie=UTF8&iwloc=&output=embed"
                            width="100%"
                            height="100%"
                            className="border-0"
                            allowFullScreen
                            loading="lazy"
                            title="Mapa da Igreja Batista Olaria"
                        />
                    </div>

                    {/* Info */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-5 bg-stone-800/50 rounded-xl border border-stone-800">
                            <MapPin size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-stone-200 font-medium mb-1">Endereço</h4>
                                <p className="text-stone-400 text-sm leading-relaxed">
                                    Igreja Batista Olaria<br />
                                    R. Júlio de Castilho, 1368<br />
                                    Olaria, Porto Velho - RO
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-5 bg-stone-800/50 rounded-xl border border-stone-800">
                            <Car size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-stone-200 font-medium mb-1">Estacionamento</h4>
                                <p className="text-stone-400 text-sm leading-relaxed">
                                    <span className="text-amber-500/90 font-medium">Cerimônia Tenebras:</span> haverá estacionamento coberto, mas limitado. Chegue cedo.<br />
                                    <span className="text-amber-500/90 font-medium">Culto da Ressurreição:</span> não haverá estacionamento disponível, pois usaremos o local como parte da programação.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-5 bg-stone-800/50 rounded-xl border border-stone-800">
                            <Clock size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-stone-200 font-medium mb-1">Chegue com antecedência</h4>
                                <p className="text-stone-400 text-sm leading-relaxed">
                                    Para as duas cerimônias, solicitamos que os irmãos cheguem com no mínimo 15 minutos de antecedência.
                                    O silêncio e preparo antes dos cultos são parte essencial da experiência.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-5 bg-stone-800/50 rounded-xl border border-stone-800">
                            <AccessibilityIcon size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-stone-200 font-medium mb-1">Acessibilidade</h4>
                                <p className="text-stone-400 text-sm leading-relaxed">
                                    A igreja possui rampas de acesso e assentos reservados para pessoas com mobilidade reduzida.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
