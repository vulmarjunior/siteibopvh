import { useState, useCallback, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import type { GalleryManifest } from './ebf-gallery.types';
import manifestData from '../../data/ebf-gallery.generated.json';
import MapaDasMemorias from './MapaDasMemorias';
import GalleryGrid from './GalleryGrid';
import EbfLightbox from './EbfLightbox';
import Highlights from './Highlights';
import EbfClosing from './EbfClosing';
import { flattenStages, getStageForImage } from '../../lib/ebf-gallery-utils';

const manifest = manifestData as GalleryManifest;

export default function EbfGallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [view, setView] = useState<'map' | 'grid'>('map');

  const allImages = useMemo(() => flattenStages(manifest.stages), []);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const navigateLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const handleStageImageClick = useCallback((stageId: number, imageIndex: number) => {
    const stage = manifest.stages.find(s => s.id === stageId);
    if (!stage) return;
    const globalIdx = allImages.findIndex(img => img.id === stage.images[imageIndex]?.id);
    if (globalIdx >= 0) openLightbox(globalIdx);
  }, [allImages, openLightbox]);

  const handleGridImageClick = useCallback((globalIndex: number) => {
    openLightbox(globalIndex);
  }, [openLightbox]);

  const handleBackToMap = useCallback(() => {
    setView('map');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleShowAll = useCallback(() => {
    setView('grid');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const currentImage = lightboxIndex !== null ? allImages[lightboxIndex] : null;
  const currentStage = currentImage ? getStageForImage(manifest.stages, currentImage.id) : null;

  if (manifest.totalImages === 0) return null;

  return (
    <>
      {/* Call to action */}
      <section className="py-16 px-5 bg-gradient-to-b from-[#fff8dc] to-amber-50">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-4" />
          <h2 className="font-serif text-3xl md:text-4xl font-black text-amber-950 mb-4">
            Explore as memórias da nossa aventura
          </h2>
          <p className="text-stone-600 text-lg mb-8">
            Reviva os melhores momentos da Escola Bíblica de Férias 2026
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setView('map')}
              className={`px-6 py-3 rounded-full font-bold transition-colors ${
                view === 'map'
                  ? 'bg-amber-500 text-amber-950'
                  : 'bg-white text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" /> O Mapa das Memórias
            </button>
            <button
              onClick={handleShowAll}
              className={`px-6 py-3 rounded-full font-bold transition-colors ${
                view === 'grid'
                  ? 'bg-amber-500 text-amber-950'
                  : 'bg-white text-stone-600 hover:bg-stone-100'
              }`}
            >
              Ver todas as fotos
            </button>
          </div>
        </div>
      </section>

      {/* Mapa das Memórias */}
      {view === 'map' && (
        <MapaDasMemorias stages={manifest.stages} onImageClick={handleStageImageClick} />
      )}

      {/* Gallery Grid */}
      {view === 'grid' && (
        <GalleryGrid stages={manifest.stages} onImageClick={handleGridImageClick} />
      )}

      {/* Highlights */}
      <Highlights
        stages={manifest.stages}
        highlightIds={manifest.highlights}
        onImageClick={handleGridImageClick}
      />

      {/* Closing */}
      <EbfClosing onBackToMap={handleBackToMap} onShowAll={handleShowAll} />

      {/* Lightbox */}
      <EbfLightbox
        images={allImages}
        currentIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={closeLightbox}
        onNavigate={navigateLightbox}
        stageName={currentStage?.name}
      />
    </>
  );
}
