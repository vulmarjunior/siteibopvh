export function PascoaFooter() {
    return (
        <footer className="bg-stone-950 border-t border-stone-800/50 py-12 px-4">
            <div className="max-w-5xl mx-auto">

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">

                    {/* Identity */}
                    <div>
                        <img
                            src="/images/logo.png"
                            alt="Igreja Batista Olaria"
                            className="h-12 w-auto mb-4 opacity-70"
                        />
                        <p className="text-stone-500 text-sm leading-relaxed">
                            R. Júlio de Castilho, 1368<br />
                            Olaria, Porto Velho - RO
                        </p>
                    </div>

                    {/* Events Quick Reference */}
                    <div>
                        <h4 className="text-stone-400 text-xs tracking-[0.2em] uppercase font-medium mb-4">Celebrações</h4>
                        <ul className="space-y-2 text-stone-600 text-sm">
                            <li>Cerimônia Tenebras — 03/04 às 19h</li>
                            <li>Culto da Ressurreição — 05/04 às 06h</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-stone-400 text-xs tracking-[0.2em] uppercase font-medium mb-4">Contato</h4>
                        <ul className="space-y-2 text-stone-600 text-sm">
                            <li>
                                <a href="https://wa.me/5569993852595" className="hover:text-stone-400 transition-colors" target="_blank" rel="noopener noreferrer">
                                    (69) 99385-2595
                                </a>
                            </li>
                            <li>
                                <a href="https://instagram.com/ibopvh" className="hover:text-stone-400 transition-colors" target="_blank" rel="noopener noreferrer">
                                    Instagram @ibopvh
                                </a>
                            </li>
                            <li>
                                <a href="mailto:contato@ibopvh.com.br" className="hover:text-stone-400 transition-colors">
                                    contato@ibopvh.com.br
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-stone-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-stone-700 text-xs">
                        © 2026 Igreja Batista Olaria — ibopvh.com.br
                    </p>
                    <p className="text-stone-700 text-xs italic">
                        Todos são bem-vindos.
                    </p>
                </div>

            </div>
        </footer>
    );
}
