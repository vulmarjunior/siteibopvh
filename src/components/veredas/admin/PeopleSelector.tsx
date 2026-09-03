import React, { useState, useEffect, useRef } from 'react';
import { User, X, Plus, AlertCircle, Sparkles, Check } from 'lucide-react';

export interface PeopleSelectorProps {
  label: string;
  description?: string;
  people: string[];
  onChange: (people: string[]) => void;
  suggestedPeople?: string[];
  placeholder?: string;
}

interface KnownPerson {
  id: number;
  nome: string;
  slug: string;
  _count?: {
    livros?: number;
    videos?: number;
    cursos?: number;
  };
}

export const PeopleSelector: React.FC<PeopleSelectorProps> = ({
  label,
  description,
  people,
  onChange,
  suggestedPeople = [],
  placeholder = 'Digite o nome e selecione ou pressione Enter',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [knownPeople, setKnownPeople] = useState<KnownPerson[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/veredas/pessoas')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setKnownPeople(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addPerson = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!people.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      onChange([...people, trimmed]);
    }
    setInputValue('');
    setIsOpen(false);
  };

  const removePerson = (indexToRemove: number) => {
    onChange(people.filter((_, idx) => idx !== indexToRemove));
  };

  // Filtered catalog people
  const query = inputValue.trim().toLowerCase();
  const matchingKnownPeople = query
    ? knownPeople.filter(
        (kp) =>
          kp.nome.toLowerCase().includes(query) &&
          !people.some((p) => p.toLowerCase() === kp.nome.toLowerCase())
      )
    : [];

  // Duplicate/similarity detection (e.g. "Tim Keller" vs "Timothy Keller")
  const potentialDuplicates = query.length >= 3
    ? knownPeople.filter((kp) => {
        const kpLower = kp.nome.toLowerCase();
        if (kpLower === query) return false; // Exact match handled by direct select
        const queryWords = query.split(/\s+/).filter(Boolean);
        const kpWords = kpLower.split(/\s+/).filter(Boolean);
        const lastQueryWord = queryWords[queryWords.length - 1];
        const lastKpWord = kpWords[kpWords.length - 1];

        // Same last name and similar first name
        if (lastQueryWord && lastKpWord && lastQueryWord === lastKpWord && queryWords.length > 1 && kpWords.length > 1) {
          return true;
        }
        // Substring match
        return kpLower.includes(query) || query.includes(kpLower);
      })
    : [];

  const unselectedSuggestions = suggestedPeople.filter(
    (s) => !people.some((p) => p.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="space-y-2" ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-stone-300 flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-amber-400" />
          {label}
        </label>
        {description && <span className="text-[11px] text-stone-500">{description}</span>}
      </div>

      {/* Selected People Chips */}
      {people.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 pb-1">
          {people.map((person, idx) => (
            <span
              key={`${person}-${idx}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-950/80 border border-amber-800 text-amber-200 shadow-sm"
            >
              <span>{person}</span>
              <button
                type="button"
                onClick={() => removePerson(idx)}
                className="text-amber-400 hover:text-amber-100 hover:bg-amber-900 rounded-full p-0.5 transition-colors"
                title="Remover"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Quick Suggestions from YouTube / Metadata */}
      {unselectedSuggestions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-stone-900/90 rounded-lg border border-amber-900/40 text-xs">
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" /> Sugestão detectada:
          </span>
          {unselectedSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addPerson(suggestion)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-colors"
            >
              <Plus className="w-3 h-3" /> {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Field with Dropdown */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addPerson(inputValue);
              }
            }}
            placeholder={placeholder}
            className="flex-1 bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => addPerson(inputValue)}
            disabled={!inputValue.trim()}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-amber-300 font-bold text-xs rounded-lg border border-stone-700 flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>

        {/* Similar Name Warning */}
        {potentialDuplicates.length > 0 && (
          <div className="mt-1.5 p-2 rounded-lg bg-amber-950/40 border border-amber-800/60 flex items-start gap-2 text-[11px] text-amber-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="flex-1">
              <span>Nome semelhante encontrado no catálogo: </span>
              {potentialDuplicates.slice(0, 2).map((dup) => (
                <button
                  key={dup.id}
                  type="button"
                  onClick={() => addPerson(dup.nome)}
                  className="underline font-bold ml-1 hover:text-white inline-flex items-center gap-0.5"
                >
                  <Check className="w-3 h-3" /> Usar &ldquo;{dup.nome}&rdquo;
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Autocomplete Dropdown */}
        {isOpen && matchingKnownPeople.length > 0 && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-stone-900 border border-stone-700 rounded-lg shadow-2xl py-1">
            <div className="px-3 py-1 text-[10px] uppercase font-bold text-stone-400 tracking-wider border-b border-stone-800">
              Pessoas já cadastradas no Veredas
            </div>
            {matchingKnownPeople.map((kp) => {
              const count =
                (kp._count?.livros || 0) + (kp._count?.videos || 0) + (kp._count?.cursos || 0);
              return (
                <button
                  key={kp.id}
                  type="button"
                  onClick={() => addPerson(kp.nome)}
                  className="w-full text-left px-3 py-2 text-xs text-stone-200 hover:bg-amber-950/60 hover:text-amber-200 flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">{kp.nome}</span>
                  {count > 0 && (
                    <span className="text-[10px] text-stone-400 bg-stone-800 px-1.5 py-0.5 rounded">
                      {count} {count === 1 ? 'obra' : 'obras'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
