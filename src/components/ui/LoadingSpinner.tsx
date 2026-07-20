import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-olaria" />
        <p className="text-stone-500 font-sans tracking-widest uppercase text-sm">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
