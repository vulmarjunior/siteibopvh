import React from 'react';
import { DocumentSection } from '../../types';
import { ArrowRight } from 'lucide-react';

interface DocumentCardProps {
  document: DocumentSection;
  onOpen: (id: string) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onOpen }) => {
  return (
    <div 
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl border border-stone-200 hover:border-olaria-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col md:flex-row items-start md:items-center p-6 gap-4 transform hover:-translate-y-1"
      onClick={() => onOpen(document.id)}
    >
      {/* Icon Container */}
      <div className="p-4 rounded-xl bg-olaria-50 text-olaria-600 group-hover:bg-olaria group-hover:text-white transition-colors duration-300 shrink-0">
        {document.icon}
      </div>
      
      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-xl font-bold font-serif text-stone-800 group-hover:text-olaria-700 transition-colors mb-1">
          {document.title}
        </h3>
        <p className="text-stone-500 text-sm font-sans line-clamp-2">
          {document.subtitle}
        </p>
      </div>

      {/* Action Button/Indicator */}
      <div className="mt-2 md:mt-0 md:ml-4 shrink-0 self-start md:self-center">
        <span className="inline-flex items-center gap-2 text-sm font-bold text-olaria-500 group-hover:text-olaria-700 uppercase tracking-wide">
          Ler Documento
          <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </div>
  );
};

export default DocumentCard;