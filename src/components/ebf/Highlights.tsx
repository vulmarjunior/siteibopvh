import type { GalleryImage, GalleryStage } from './ebf-gallery.types';
import { formatImageAlt } from '../../lib/ebf-gallery-utils';
import { Star } from 'lucide-react';

interface Props {
  stages: GalleryStage[];
  highlightIds: string[];
  onImageClick: (globalIndex: number) => void;
}

export default function Highlights({ stages, highlightIds, onImageClick }: Props) {
  const allImages = stages.flatMap(s => s.images);
  const highlights = highlightIds
    .map(id => allImages.find(img => img.id === id))
    .filter(Boolean) as GalleryImage[];

  if (highlights.length === 0) return null;

  return (
    <section className="py-16 px-5 bg-gradient-to-b from-amber-50 to-[#fff8dc]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-amber-600 text-sm font-bold uppercase tracking-[.25em] mb-3">
            <Star className="w-4 h-4" /> Tesouros encontrados
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-black text-amber-950">Momentos Especiais</h2>
          <p className="text-stone-600 mt-3">Fotografias marcantes desta aventura</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((img, idx) => {
            const globalIdx = allImages.findIndex(i => i.id === img.id);
            return (
              <button
                key={img.id}
                onClick={() => onImageClick(globalIdx >= 0 ? globalIdx : 0)}
                className="group relative rounded-2xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={img.src}
                    alt={formatImageAlt(img)}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="text-sm font-bold">Destaque</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
