import React, { useState, useEffect } from 'react';
import { Church, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloqueia o scroll do corpo quando o menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Relógio de Oração', href: '/relogio' },
    { name: 'A Igreja', href: '/#identidade' },
    { name: 'Sermões', href: '/#sermoes' },
    { name: 'Contribua', href: '/#contribua' },
    { name: 'Contato', href: '/#contato' },
  ];

  const isRelogioPage = location.pathname === '/relogio';

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen || isRelogioPage
        ? 'bg-stone-900/95 backdrop-blur-md shadow-sm border-b border-white/5 py-3'
        : 'bg-transparent py-6'
        }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center z-[60]">
          <Link to="/">
            <img
              src="/images/logo.png"
              alt="Logo IB Olaria"
              className={`h-10 md:h-14 w-auto object-contain transition-all duration-300 ${isScrolled || isMobileMenuOpen || isRelogioPage ? '' : ''}`}
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => (
            link.href.startsWith('/#') ? (
              <a
                key={link.name}
                href={link.href}
                className={`text-[14px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:text-amber-500 ${isScrolled || isRelogioPage ? 'text-stone-300' : 'text-stone-200 drop-shadow-sm'
                  }`}
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                className={`text-[14px] font-bold uppercase tracking-[0.2em] transition-colors duration-300 hover:text-amber-500 ${isScrolled || isRelogioPage ? 'text-stone-300' : 'text-stone-200 drop-shadow-sm'
                  }`}
              >
                {link.name}
              </Link>
            )
          ))}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden z-[60] p-2 text-stone-300 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen
            ? <X className="w-8 h-8 text-white" />
            : <Menu className={`w-8 h-8 ${isScrolled || isRelogioPage ? 'text-white' : 'text-white drop-shadow-md'}`} />
          }
        </button>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 h-screen w-full bg-stone-900 z-50 flex flex-col items-center justify-start pt-32 gap-8 transition-transform duration-300 ease-in-out md:hidden overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          {navLinks.map((link) => (
            link.href.startsWith('/#') ? (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-serif font-bold text-white hover:text-amber-500 transition-colors"
              >
                {link.name}
              </a>
            ) : (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-serif font-bold text-white hover:text-amber-500 transition-colors"
              >
                {link.name}
              </Link>
            )
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
