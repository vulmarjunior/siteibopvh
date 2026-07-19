import { useState, useCallback, useEffect, useRef } from 'react';
import { Map, Search, Footprints, Gem, Trophy, ArrowLeft, ChevronRight, Eye } from 'lucide-react';
import type { GalleryImage, GalleryStage } from './ebf-gallery.types';
import { formatImageAlt } from '../../lib/ebf-gallery-utils';

interface TreasureProgress {
  unlockedStages: number[];
  cluesFound: number[];
}

const STORAGE_KEY = 'ebf-treasure-progress';
const CLUE_ICONS = ['🔑', '🧭', '🪙', '💎', '🏆'];

const STAGE_ICONS: Record<string, React.ReactNode> = {
  Map: <Map className="w-6 h-6" />,
  Search: <Search className="w-6 h-6" />,
  Footprints: <Footprints className="w-6 h-6" />,
  Gem: <Gem className="w-6 h-6" />,
  Trophy: <Trophy className="w-6 h-6" />,
};

function loadProgress(): TreasureProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { unlockedStages: [1], cluesFound: [] };
}

function saveProgress(progress: TreasureProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch {}
}

interface Props {
  stages: GalleryStage[];
  onImageClick: (stageId: number, imageIndex: number) => void;
}

export default function MapaDasMemorias({ stages, onImageClick }: Props) {
  const [progress, setProgress] = useState<TreasureProgress>(loadProgress);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [showClue, setShowClue] = useState<number | null>(null);
  const stageRefCallbacks: Record<number, (el: HTMLDivElement | null) => void> = {};
  const stageElements: Record<number, HTMLDivElement | null> = {};

  const isUnlocked = useCallback((id: number) => progress.unlockedStages.includes(id), [progress]);
  const isClueFound = useCallback((id: number) => progress.cluesFound.includes(id), [progress]);
  const allComplete = progress.unlockedStages.length === stages.length && progress.cluesFound.length === stages.length;

  const unlockStage = useCallback((id: number) => {
    setProgress(prev => {
      if (prev.unlockedStages.includes(id)) return prev;
      const next = { ...prev, unlockedStages: [...prev.unlockedStages, id] };
      saveProgress(next);
      return next;
    });
  }, []);

  const findClue = useCallback((id: number) => {
    setProgress(prev => {
      if (prev.cluesFound.includes(id)) return prev;
      const next = { ...prev, cluesFound: [...prev.cluesFound, id] };
      saveProgress(next);
      return next;
    });
    setShowClue(id);
    setTimeout(() => setShowClue(null), 3000);
  }, []);

  const toggleStage = useCallback((id: number) => {
    if (!isUnlocked(id)) return;
    setExpandedStage(prev => prev === id ? null : id);
  }, [isUnlocked]);

  const resetProgress = useCallback(() => {
    const fresh = { unlockedStages: [1], cluesFound: [] };
    setProgress(fresh);
    saveProgress(fresh);
    setExpandedStage(null);
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (expandedStage && !prefersReduced) {
      stageElements[expandedStage!]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [expandedStage]);

  return (
    <section className="py-16 px-5 bg-gradient-to-b from-emerald-950 to-emerald-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-amber-300 text-sm font-bold uppercase tracking-[.25em] mb-3">Explore as memórias</p>
          <h2 className="font-serif text-3xl md:text-4xl font-black text-white">O Mapa das Memórias</h2>
          <p className="text-emerald-200 mt-3 text-lg">Reviva nossa grande caça ao tesouro</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {stages.map((stage, idx) => {
            const unlocked = isUnlocked(stage.id);
            const clueFound = isClueFound(stage.id);
            return (
              <div key={stage.id} className="flex items-center">
                <button
                  onClick={() => toggleStage(stage.id)}
                  disabled={!unlocked}
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    expandedStage === stage.id
                      ? 'bg-amber-400 text-emerald-950 scale-110 shadow-lg shadow-amber-400/30'
                      : unlocked
                        ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500/50 hover:bg-amber-500/30'
                        : 'bg-emerald-800 text-emerald-600 border-2 border-emerald-700 cursor-not-allowed'
                  }`}
                  aria-label={`${stage.name}${unlocked ? '' : ' (bloqueado)'}`}
                  aria-expanded={expandedStage === stage.id}
                >
                  {clueFound ? CLUE_ICONS[idx] : stage.id}
                </button>
                {idx < stages.length - 1 && (
                  <div className={`w-6 md:w-10 h-0.5 mx-1 ${
                    isUnlocked(stages[idx + 1].id) ? 'bg-amber-500/40' : 'bg-emerald-700'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Clue notification */}
        {showClue !== null && (
          <div className="text-center mb-6 animate-fade-in">
            <div className="inline-block bg-amber-500/20 border border-amber-500/40 rounded-2xl px-6 py-3 text-amber-200 font-bold">
              {CLUE_ICONS[showClue - 1]} Você encontrou mais uma pista!
            </div>
          </div>
        )}

        {/* All complete message */}
        {allComplete && (
          <div className="text-center mb-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
            <p className="text-amber-200 text-lg font-serif">
              O maior tesouro que encontramos foi Cristo — e as memórias dessa aventura permanecerão conosco.
            </p>
            <button
              onClick={resetProgress}
              className="mt-4 text-emerald-300 text-sm underline hover:text-emerald-200"
            >
              Reiniciar aventura
            </button>
          </div>
        )}

        {/* Stages */}
        <div className="space-y-4">
          {stages.map((stage) => {
            const unlocked = isUnlocked(stage.id);
            const expanded = expandedStage === stage.id;
            return (
              <div
                key={stage.id}
                ref={el => { stageElements[stage.id] = el; }}
                className={`rounded-2xl overflow-hidden transition-all ${
                  expanded
                    ? 'bg-white shadow-2xl'
                    : unlocked
                      ? 'bg-white/10 hover:bg-white/15 cursor-pointer'
                      : 'bg-emerald-900/50'
                }`}
              >
                {/* Stage header */}
                <button
                  onClick={() => unlocked && toggleStage(stage.id)}
                  disabled={!unlocked}
                  className={`w-full flex items-center gap-4 p-5 text-left ${
                    unlocked ? 'hover:bg-white/5' : 'cursor-not-allowed'
                  }`}
                  aria-expanded={expanded}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    expanded ? 'bg-emerald-800 text-amber-300' : 'bg-emerald-800/50 text-emerald-400'
                  }`}>
                    {STAGE_ICONS[stage.icon] || <Map className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-serif text-lg font-bold ${
                      expanded ? 'text-emerald-950' : unlocked ? 'text-white' : 'text-emerald-600'
                    }`}>
                      Etapa {stage.id}: {stage.name}
                    </h3>
                    <p className={`text-sm ${
                      expanded ? 'text-stone-500' : unlocked ? 'text-emerald-300' : 'text-emerald-700'
                    }`}>
                      {stage.images.length} {stage.images.length === 1 ? 'foto' : 'fotos'}
                    </p>
                  </div>
                  {unlocked && (
                    <ChevronRight className={`w-5 h-5 transition-transform ${
                      expanded ? 'rotate-90 text-emerald-600' : 'text-emerald-400'
                    }`} />
                  )}
                </button>

                {/* Expanded content */}
                {expanded && (
                  <div className="px-5 pb-5 animate-fade-in">
                    {/* Clue */}
                    <div className="mb-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-amber-800 text-sm italic">"{stage.clue}"</p>
                      {!isClueFound(stage.id) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); findClue(stage.id); }}
                          className="mt-2 text-amber-600 text-sm font-bold hover:text-amber-700"
                        >
                          {CLUE_ICONS[stage.id - 1]} Encontrar pista
                        </button>
                      )}
                    </div>

                    {/* Photo thumbnails */}
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {stage.images.map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => onImageClick(stage.id, idx)}
                          className="aspect-square rounded-xl overflow-hidden bg-stone-100 hover:ring-2 hover:ring-amber-400 transition-all group"
                          aria-label={formatImageAlt(img, stage.name)}
                        >
                          <img
                            src={img.thumb}
                            alt={formatImageAlt(img, stage.name)}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </button>
                      ))}
                    </div>

                    {/* Unlock next stage */}
                    {stage.id < stages.length && !isUnlocked(stage.id + 1) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); unlockStage(stage.id + 1); }}
                        className="mt-4 w-full py-3 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> Desbloquear próxima etapa
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
