import { useState, useMemo, useCallback } from 'react';
import { Grid3x3, ArrowUpDown } from 'lucide-react';
import type { GalleryImage, GalleryStage } from './ebf-gallery.types';
import { formatImageAlt } from '../../lib/ebf-gallery-utils';

interface Props {
  stages: GalleryStage[];
  onImageClick: (globalIndex: number) => void;
  batchSize?: number;
}

export default function GalleryGrid({ stages, onImageClick, batchSize = 20 }: Props) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const [filterStage, setFilterStage] = useState<number | null>(null);

  const allImages = useMemo(() => stages.flatMap(s => s.images), [stages]);

  const filteredImages = useMemo(() => {
    if (filterStage === null) return allImages;
    const stage = stages.find(s => s.id === filterStage);
    return stage ? stage.images : allImages;
  }, [allImages, stages, filterStage]);

  const visibleImages = useMemo(() => filteredImages.slice(0, visibleCount), [filteredImages, visibleCount]);
  const hasMore = visibleCount < filteredImages.length;

  const getGlobalIndex = useCallback((img: GalleryImage): number => {
    return allImages.findIndex(i => i.id === img.id);
  }, [allImages]);

  return (
    <section className="py-16 px-5 bg-[#fff8dc]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-amber-600 text-sm font-bold uppercase tracking-[.25em] mb-3">Galeria completa</p>
          <h2 className="font-serif text-3xl md:text-4xl font-black text-amber-950">Ver todas as fotos</h2>
          <p className="text-stone-600 mt-3">{filteredImages.length} fotografias</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={() => { setFilterStage(null); setVisibleCount(batchSize); }}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
              filterStage === null
                ? 'bg-amber-500 text-amber-950'
                : 'bg-white text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Grid3x3 className="w-4 h-4 inline mr-1" /> Todas
          </button>
          {stages.map(stage => (
            <button
              key={stage.id}
              onClick={() => { setFilterStage(stage.id); setVisibleCount(batchSize); }}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                filterStage === stage.id
                  ? 'bg-amber-500 text-amber-950'
                  : 'bg-white text-stone-600 hover:bg-stone-100'
              }`}
            >
              {stage.name} ({stage.images.length})
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {visibleImages.map((img) => {
            const globalIdx = getGlobalIndex(img);
            const isPortrait = img.height > img.width;
            return (
              <button
                key={img.id}
                onClick={() => onImageClick(globalIdx >= 0 ? globalIdx : 0)}
                className={`rounded-xl overflow-hidden bg-stone-100 hover:ring-2 hover:ring-amber-400 transition-all group ${
                  isPortrait ? 'row-span-2' : ''
                }`}
                style={{ aspectRatio: isPortrait ? '3/4' : '4/3' }}
                aria-label={formatImageAlt(img)}
              >
                <img
                  src={img.thumb}
                  alt={formatImageAlt(img)}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  width={img.width}
                  height={img.height}
                />
              </button>
            );
          })}
        </div>

        {/* Load more */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleCount(prev => prev + batchSize)}
              className="px-8 py-3 bg-amber-500 text-amber-950 rounded-full font-bold hover:bg-amber-400 transition-colors"
            >
              Carregar mais ({filteredImages.length - visibleCount} restantes)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
