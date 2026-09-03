import React, { useState, useEffect } from 'react';
import { Link2, Sparkles, Plus, Trash2, ArrowUp, ArrowDown, BookOpen, Film, GraduationCap, Flame, Search } from 'lucide-react';

export interface CrossReferenceEntry {
  destinoId: number;
  rotulo?: string;
  item?: {
    id: number;
    titulo: string;
    tipo: string;
    imagemUrl?: string | null;
    livro?: { capaUrl?: string | null; autores?: any[] };
    video?: { thumbnailUrl?: string | null };
    curso?: { thumbnailUrl?: string | null };
    categorias?: any[];
  };
}

export interface CrossReferencesEditorProps {
  currentItemId?: number;
  references: CrossReferenceEntry[];
  onChange: (references: CrossReferenceEntry[]) => void;
  currentTipo: string;
  currentCategoriaIds: number[];
  currentPeople: string[];
}

const PRESET_LABELS: Record<string, string[]> = {
  CONFERENCIA: [
    'Livro-texto da conferência',
    'Bibliografia recomendada pelo preletor',
    'Leitura preparatória indicada',
    'Conferência complementar',
  ],
  LIVRO: [
    'Conferência sobre este tema',
    'Exposição em vídeo recomendada',
    'Curso de aprofundamento',
    'Leitura complementar',
  ],
  VIDEO: [
    'Livro recomendado para aprofundamento',
    'Conferência correlata',
    'Curso completo sobre o tema',
  ],
  CURSO: [
    'Livro-texto do curso',
    'Bibliografia complementar',
    'Mensagem em vídeo de introdução',
  ],
};

export const CrossReferencesEditor: React.FC<CrossReferencesEditorProps> = ({
  currentItemId,
  references,
  onChange,
  currentTipo,
  currentCategoriaIds,
  currentPeople,
}) => {
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/veredas/admin/items')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setCatalogItems(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedIds = new Set(references.map((r) => r.destinoId));
  if (currentItemId) selectedIds.add(currentItemId);

  // Available items for manual selection
  const availableItems = searchQuery.trim().length >= 2
    ? catalogItems.filter(
        (item) =>
          !selectedIds.has(item.id) &&
          item.titulo.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : [];

  const addReference = (item: any, customRotulo?: string) => {
    const defaultLabel =
      customRotulo ||
      (PRESET_LABELS[currentTipo] ? PRESET_LABELS[currentTipo][0] : 'Material complementar');

    onChange([
      ...references,
      {
        destinoId: item.id,
        rotulo: defaultLabel,
        item,
      },
    ]);
    setSearchQuery('');
    setIsSearching(false);
  };

  const removeReference = (indexToRemove: number) => {
    onChange(references.filter((_, idx) => idx !== indexToRemove));
  };

  const moveReference = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= references.length) return;
    const copy = [...references];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    onChange(copy);
  };

  const updateRotulo = (index: number, rotulo: string) => {
    const copy = [...references];
    copy[index] = { ...copy[index], rotulo };
    onChange(copy);
  };

  // Automated suggestions based on categories, people, and complementary type
  const handleAutoDetect = () => {
    const suggestions: any[] = [];
    const catSet = new Set(currentCategoriaIds);
    const peopleNormalized = currentPeople.map((p) => p.toLowerCase().trim());

    for (const item of catalogItems) {
      if (selectedIds.has(item.id)) continue;
      let score = 0;

      // Check categories
      const itemCatIds = (item.categorias || []).map((c: any) => c.categoriaId || c.categoria?.id);
      for (const cid of itemCatIds) {
        if (catSet.has(cid)) score += 4;
      }

      // Check people
      const itemPeople: string[] = [
        ...(item.livro?.autores || []).map((a: any) => a.pessoa?.nome?.toLowerCase() || ''),
        ...(item.video?.participantes || []).map((p: any) => p.pessoa?.nome?.toLowerCase() || ''),
        ...(item.curso?.participantes || []).map((p: any) => p.pessoa?.nome?.toLowerCase() || ''),
      ];
      for (const p of itemPeople) {
        if (p && peopleNormalized.includes(p)) score += 5;
      }

      // Prefer complementary type
      if (currentTipo === 'CONFERENCIA' && item.tipo === 'LIVRO') score += 3;
      if (currentTipo === 'LIVRO' && (item.tipo === 'CONFERENCIA' || item.tipo === 'VIDEO')) score += 3;

      if (score >= 4) {
        suggestions.push({ item, score });
      }
    }

    suggestions.sort((a, b) => b.score - a.score);

    // Add top up to 3 automatically
    const newRefs: CrossReferenceEntry[] = [...references];
    for (const sug of suggestions.slice(0, 3)) {
      if (!newRefs.some((r) => r.destinoId === sug.item.id)) {
        const defaultLabel =
          PRESET_LABELS[currentTipo] ? PRESET_LABELS[currentTipo][0] : 'Material complementar';
        newRefs.push({
          destinoId: sug.item.id,
          rotulo: defaultLabel,
          item: sug.item,
        });
      }
    }
    onChange(newRefs);
  };

  const getItemThumbnail = (item?: any) => {
    if (!item) return null;
    if (item.livro?.capaUrl) return item.livro.capaUrl;
    if (item.video?.thumbnailUrl) return item.video.thumbnailUrl;
    if (item.curso?.thumbnailUrl) return item.curso.thumbnailUrl;
    if (item.imagemUrl) return item.imagemUrl;
    return null;
  };

  const getItemTypeIcon = (tipo?: string) => {
    switch (tipo) {
      case 'LIVRO':
        return <BookOpen className="w-3.5 h-3.5 text-amber-400" />;
      case 'CONFERENCIA':
        return <Flame className="w-3.5 h-3.5 text-indigo-400" />;
      case 'CURSO':
        return <GraduationCap className="w-3.5 h-3.5 text-blue-400" />;
      default:
        return <Film className="w-3.5 h-3.5 text-red-400" />;
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div>
          <h2 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <Link2 className="w-4 h-4" /> Referências Cruzadas & Materiais Relacionados
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Vincule livros, conferências e vídeos complementares que o espectador ou leitor verá na página de detalhes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAutoDetect}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/80 border border-amber-700/80 hover:bg-amber-900/60 text-amber-300 font-bold text-xs transition-colors self-start sm:self-auto shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Auto-detectar por tema e preletor
        </button>
      </div>

      {/* Selected References List */}
      {references.length > 0 ? (
        <div className="space-y-3">
          {references.map((ref, idx) => {
            // Find resolved item from catalog if not directly in ref
            const resolvedItem = ref.item || catalogItems.find((c) => c.id === ref.destinoId);
            const thumb = getItemThumbnail(resolvedItem);

            return (
              <div
                key={ref.destinoId}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-stone-950/80 border border-stone-800 rounded-xl hover:border-stone-700 transition-colors"
              >
                {/* Reorder Buttons */}
                <div className="flex sm:flex-col gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveReference(idx, 'up')}
                    className="p-1 text-stone-400 hover:text-amber-300 disabled:opacity-20 transition-colors"
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === references.length - 1}
                    onClick={() => moveReference(idx, 'down')}
                    className="p-1 text-stone-400 hover:text-amber-300 disabled:opacity-20 transition-colors"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Thumb / Icon */}
                <div className="w-12 h-14 bg-stone-900 rounded border border-stone-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {thumb ? (
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    getItemTypeIcon(resolvedItem?.tipo)
                  )}
                </div>

                {/* Item Details & Custom Label */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 uppercase">
                      {getItemTypeIcon(resolvedItem?.tipo)}
                      {resolvedItem?.tipo || 'ITEM'}
                    </span>
                    <h4 className="text-xs font-serif font-bold text-stone-200 truncate">
                      {resolvedItem?.titulo || `Item #${ref.destinoId}`}
                    </h4>
                  </div>

                  {/* Rotulo / Contexto */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-400 shrink-0">Rótulo:</span>
                    <input
                      type="text"
                      value={ref.rotulo || ''}
                      onChange={(e) => updateRotulo(idx, e.target.value)}
                      placeholder="Ex: Livro-texto da conferência"
                      list={`presets-${idx}`}
                      className="flex-1 bg-stone-900 border border-stone-700/80 rounded px-2.5 py-1 text-xs text-amber-200 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
                    />
                    <datalist id={`presets-${idx}`}>
                      {(PRESET_LABELS[currentTipo] || []).map((labelPreset) => (
                        <option key={labelPreset} value={labelPreset} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeReference(idx)}
                  className="p-2 text-stone-500 hover:text-red-400 rounded-lg hover:bg-stone-900 transition-colors self-end sm:self-center shrink-0"
                  title="Remover referência"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-stone-800 bg-stone-950/40 text-center text-xs text-stone-400">
          Nenhuma referência cruzada adicionada manualmente. O sistema sugerirá automaticamente itens do catálogo com base em temas e preletores compartilhados.
        </div>
      )}

      {/* Add New Reference Search */}
      <div className="space-y-2 pt-2 border-t border-stone-800/80">
        <label className="block text-xs font-semibold text-stone-300">
          Adicionar material do catálogo às referências
        </label>
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearching(true);
                }}
                onFocus={() => setIsSearching(true)}
                placeholder="Busque por título de livro, conferência ou vídeo para vincular..."
                className="w-full bg-stone-950 border border-stone-700/80 rounded-lg pl-8 pr-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Search Results Dropdown */}
          {isSearching && availableItems.length > 0 && (
            <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-stone-900 border border-stone-700 rounded-lg shadow-2xl py-1">
              {availableItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addReference(item)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-amber-950/60 flex items-center justify-between gap-3 transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="shrink-0">{getItemTypeIcon(item.tipo)}</span>
                    <span className="font-medium text-stone-200 group-hover:text-amber-200 truncate">
                      {item.titulo}
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 shrink-0 bg-stone-800 px-2 py-0.5 rounded border border-stone-700">
                    + Vincular
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
