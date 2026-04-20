import React, { useEffect, useRef } from 'react';
import { DocumentSection } from '../../types';
import { X, ChevronUp, Calendar, Download } from 'lucide-react';

interface DocumentModalProps {
  document: DocumentSection;
  onClose: () => void;
}

const DocumentModal: React.FC<DocumentModalProps> = ({ document: doc, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const scrollToTop = () => {
      const contentArea = document.getElementById('modal-content-area');
      if (contentArea) {
          contentArea.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-stone-900/60 backdrop-blur-sm transition-opacity"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div 
        ref={modalRef}
        className="bg-white w-full h-full md:h-[90vh] md:max-w-5xl md:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-stone-100 bg-white z-20 shadow-sm shrink-0">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="hidden md:flex p-2.5 bg-clay-50 text-clay-600 rounded-lg">
                {doc.icon}
            </div>
            <div className="min-w-0">
                <h2 className="text-lg md:text-xl font-bold font-serif text-clay-800 truncate leading-tight">
                {doc.title}
                </h2>
                <p className="text-xs md:text-sm text-stone-500 truncate font-sans">
                {doc.subtitle}
                </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-clay-600 hover:bg-clay-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-clay-200"
            aria-label="Fechar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div id="modal-content-area" className="flex-1 overflow-y-auto bg-stone-50 p-4 md:p-8 scroll-smooth">
          <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 rounded-xl shadow-sm border border-stone-100">
             <div className="prose prose-stone prose-headings:font-serif prose-headings:text-clay-800 prose-a:text-clay-600 max-w-none">
                {doc.content}
             </div>
          </div>

          <div className="flex justify-center mt-8 pb-4">
             <button 
                onClick={scrollToTop}
                className="flex items-center gap-2 text-sm font-semibold text-clay-600 hover:text-clay-800 bg-white px-4 py-2 rounded-full shadow-sm border border-clay-100 transition-transform hover:-translate-y-0.5"
             >
                <ChevronUp className="w-4 h-4" />
                Voltar ao Topo
             </button>
          </div>
        </div>

        {/* Footer Bar (Mobile mainly) */}
        <div className="p-4 border-t border-stone-100 bg-white flex justify-end shrink-0 md:hidden">
            <button 
                onClick={onClose}
                className="w-full bg-clay-500 text-white font-bold py-3 rounded-lg shadow active:scale-95 transition-transform"
            >
                Fechar Documento
            </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;