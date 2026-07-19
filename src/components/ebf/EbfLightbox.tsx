import { useEffect, useCallback, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2 } from 'lucide-react';
import type { GalleryImage } from './ebf-gallery.types';

interface Props {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  stageName?: string;
  downloadsEnabled?: boolean;
}

export default function EbfLightbox({ images, currentIndex, isOpen, onClose, onNavigate, stageName, downloadsEnabled = true }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const prevButtonRef = useRef<HTMLButtonElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const image = images[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const goPrev = useCallback(() => { if (hasPrev) onNavigate(currentIndex - 1); }, [hasPrev, currentIndex, onNavigate]);
  const goNext = useCallback(() => { if (hasNext) onNavigate(currentIndex + 1); }, [hasNext, currentIndex, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, goPrev, goNext]);

  // Focus trap
  useEffect(() => {
    if (isOpen) prevButtonRef.current?.focus();
  }, [isOpen, currentIndex]);

  // Touch gestures
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  }, [touchStart, goNext, goPrev]);

  const handleDownload = useCallback(() => {
    if (!image || !downloadsEnabled) return;
    const a = document.createElement('a');
    a.href = image.src;
    a.download = image.original;
    a.click();
  }, [image, downloadsEnabled]);

  const handleShare = useCallback(async () => {
    if (!image || !navigator.share) return;
    try {
      await navigator.share({ title: 'Foto da EBF 2026', text: stageName || 'EBF 2026', url: window.location.href });
    } catch {}
  }, [image, stageName]);

  if (!isOpen || !image) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Galeria de fotos"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      <div
        className="relative z-10 w-full h-full flex flex-col"
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-black/50">
          <div className="flex items-center gap-3 min-w-0">
            {stageName && (
              <span className="text-amber-300 text-sm font-bold truncate">{stageName}</span>
            )}
            <span className="text-white/60 text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {downloadsEnabled && (
              <button
                onClick={handleDownload}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Baixar foto"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleShare}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Compartilhar"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image */}
        <div className="flex-1 flex items-center justify-center p-4 min-h-0">
          {hasPrev && (
            <button
              ref={prevButtonRef}
              onClick={goPrev}
              className="absolute left-2 md:left-4 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <img
            src={image.src}
            alt={stageName ? `Foto da EBF — ${stageName}` : 'Foto da EBF'}
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
          />
          {hasNext && (
            <button
              onClick={goNext}
              className="absolute right-2 md:right-4 z-20 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Thumbnails strip */}
        <div className="px-4 py-3 bg-black/50 overflow-x-auto">
          <div className="flex gap-2 justify-center">
            {images.slice(Math.max(0, currentIndex - 5), currentIndex + 6).map((img, i) => {
              const realIdx = Math.max(0, currentIndex - 5) + i;
              return (
                <button
                  key={img.id}
                  onClick={() => onNavigate(realIdx)}
                  className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 transition-all ${
                    realIdx === currentIndex ? 'ring-2 ring-amber-400 scale-110' : 'opacity-50 hover:opacity-80'
                  }`}
                  aria-label={`Ir para foto ${realIdx + 1}`}
                >
                  <img src={img.thumb} alt="" className="w-full h-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
