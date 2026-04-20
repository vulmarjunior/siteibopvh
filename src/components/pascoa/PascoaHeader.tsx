import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function PascoaHeader() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    const navLinks = [
        { id: 'sobre', label: 'Sobre' },
        { id: 'tenebras', label: 'Tenebras' },
        { id: 'ressurreicao', label: 'Ressurreição' },
        { id: 'programacao', label: 'Programação' },
        { id: 'faq', label: 'FAQ' },
    ];

    return (
        <header className="fixed top-0 w-full z-50 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img
                                src="/images/logo.png"
                                alt="Igreja Batista Olaria"
                                className="h-12 w-auto group-hover:opacity-90 transition-opacity"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <button 
                                key={link.id}
                                onClick={() => scrollTo(link.id)} 
                                className="text-stone-300 hover:text-white transition-colors text-sm font-medium tracking-wide"
                            >
                                {link.label}
                            </button>
                        ))}
                    </nav>

                    {/* CTA */}
                    <div className="hidden md:flex items-center">
                        <button
                            onClick={() => scrollTo('programacao')}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-md font-medium transition-all duration-200 shadow-lg shadow-amber-900/20"
                        >
                            Participar
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-stone-300 hover:text-white p-2"
                            aria-expanded={isMobileMenuOpen}
                            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-stone-900 border-b border-stone-800">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map((link) => (
                            <button
                                key={link.id}
                                onClick={() => scrollTo(link.id)}
                                className="text-stone-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
                            >
                                {link.label}
                            </button>
                        ))}
                        <button
                            onClick={() => scrollTo('programacao')}
                            className="bg-amber-600 hover:bg-amber-700 text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left mt-4"
                        >
                            Participar
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}
