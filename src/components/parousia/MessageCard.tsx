import React from 'react';
import { Play } from 'lucide-react';
import { Sermon } from '../../types/parousia';
import { getYoutubeThumbnailUrl } from '../../lib/parousia-utils';

interface MessageCardProps {
  sermon: Sermon;
  onClick: () => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({ sermon, onClick }) => {
  const thumbUrl = getYoutubeThumbnailUrl(sermon.youtubeId) || sermon.artes?.thumb || '/images/serie-da-ascensao-a-parousia/thumb-padrao.jpg';

  return (
    <button
      onClick={onClick}
      className="group relative bg-[#0f1115] rounded-lg overflow-hidden border border-gray-800 hover:border-[#d4af37]/50 transition-all text-left w-full"
    >
      <div className="aspect-video w-full bg-gray-900 relative overflow-hidden">
        <img
          src={thumbUrl}
          alt={sermon.titulo}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#d4af37] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-[#0f1115] ml-0.5" />
          </div>
        </div>
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#0f1115]/80 text-green-400 text-xs font-medium rounded-full border border-green-500/40">
          Disponível
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
          <span className="font-mono text-[#d4af37]">#{sermon.numero}</span>
          <span>{sermon.movimento}</span>
        </div>
        <h3 className="text-sm font-serif text-white group-hover:text-[#d4af37] transition-colors leading-tight">
          {sermon.titulo}
        </h3>
      </div>
    </button>
  );
};
