import React from 'react';
import { ExternalLink, Plus, Trash2 } from 'lucide-react';

export interface BookAccessFormData {
  key: string;
  tipo: string;
  formato: string;
  provedor: string;
  fornecedor: string;
  url: string;
  textoBotao: string;
  gratuito: boolean;
  linkAssociado: boolean;
  producaoIbo: boolean;
  ativo: boolean;
  ordem: number;
  observacaoPublica: string;
  fonte: string;
  affiliateTag: string;
}

type LinkMode = 'IMPRESSO' | 'KINDLE' | 'GRATUITO';

function identifyDestination(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '').toLowerCase();
    if (hostname.includes('amazon.') || hostname === 'amzn.to' || hostname === 'a.co') {
      return { provedor: 'AMAZON', fornecedor: 'Amazon' };
    }
    if (hostname.includes('estantevirtual.')) {
      return { provedor: 'ESTANTE_VIRTUAL', fornecedor: 'Estante Virtual' };
    }
    const name = hostname.split('.')[0]?.replace(/[-_]/g, ' ') || 'Site externo';
    return {
      provedor: hostname.includes('editora') ? 'EDITORA' : 'OUTRO',
      fornecedor: name.split(' ').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    };
  } catch {
    return { provedor: 'OUTRO', fornecedor: '' };
  }
}

function modeOf(access: BookAccessFormData): LinkMode {
  if (access.gratuito) return 'GRATUITO';
  return access.formato === 'KINDLE' ? 'KINDLE' : 'IMPRESSO';
}

function withDetectedDetails(access: BookAccessFormData, url: string, mode: LinkMode): BookAccessFormData {
  const destination = identifyDestination(url);
  const suffix = destination.fornecedor ? ' na ' + destination.fornecedor : '';
  return {
    ...access,
    url,
    tipo: mode === 'GRATUITO' ? 'LEITURA_ONLINE' : 'COMPRA',
    formato: mode === 'KINDLE' ? 'KINDLE' : mode === 'GRATUITO' ? 'WEB' : 'IMPRESSO',
    provedor: destination.provedor,
    fornecedor: destination.fornecedor,
    textoBotao:
      mode === 'GRATUITO'
        ? 'Acessar gratuitamente'
        : mode === 'KINDLE'
          ? 'Comprar e-book' + suffix
          : 'Comprar impresso' + suffix,
    gratuito: mode === 'GRATUITO',
    linkAssociado: /[?&]tag=/.test(url),
    ativo: true,
  };
}

export function createEmptyBookAccess(ordem = 0): BookAccessFormData {
  return withDetectedDetails({
    key: 'access-' + Date.now() + '-' + Math.random().toString(36).slice(2),
    tipo: 'COMPRA',
    formato: 'IMPRESSO',
    provedor: 'OUTRO',
    fornecedor: '',
    url: '',
    textoBotao: 'Comprar impresso',
    gratuito: false,
    linkAssociado: false,
    producaoIbo: false,
    ativo: true,
    ordem,
    observacaoPublica: '',
    fonte: '',
    affiliateTag: '',
  }, '', 'IMPRESSO');
}

interface BookAccessFieldsProps {
  accesses: BookAccessFormData[];
  onChange: (accesses: BookAccessFormData[]) => void;
  onNormalizeAmazon: (index: number) => Promise<void>;
}

const inputClass =
  'w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200';

export const BookAccessFields: React.FC<BookAccessFieldsProps> = ({ accesses, onChange, onNormalizeAmazon }) => {
  const update = (index: number, access: BookAccessFormData) => {
    onChange(accesses.map((current, currentIndex) => (currentIndex === index ? access : current)));
  };

  const remove = (index: number) => {
    onChange(accesses.filter((_, current) => current !== index).map((access, ordem) => ({ ...access, ordem })));
  };

  return (
    <section className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-wider">Links para acessar</h2>
          <p className="text-xs text-stone-400 mt-1">Cole o endereço e escolha apenas a finalidade do link.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...accesses, createEmptyBookAccess(accesses.length)])}
          className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Adicionar link
        </button>
      </div>

      {accesses.length === 0 ? (
        <p className="text-xs text-stone-500 border border-dashed border-stone-700 rounded-lg p-4 text-center">
          Nenhum link cadastrado.
        </p>
      ) : null}

      {accesses.map((access, index) => {
        const mode = modeOf(access);
        return (
          <div key={access.key} className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_190px_auto] gap-3 items-end">
              <label className="text-xs text-stone-300">
                Link
                <input
                  required
                  type="url"
                  value={access.url}
                  onChange={(event) => update(index, withDetectedDetails(access, event.target.value, mode))}
                  onBlur={() => {
                    if (access.provedor === 'AMAZON' && access.url) void onNormalizeAmazon(index);
                  }}
                  className={inputClass}
                  placeholder="https://..."
                />
              </label>

              <label className="text-xs text-stone-300">
                Finalidade
                <select
                  value={mode}
                  onChange={(event) => update(index, withDetectedDetails(access, access.url, event.target.value as LinkMode))}
                  className={inputClass}
                >
                  <option value="IMPRESSO">Comprar impresso</option>
                  <option value="KINDLE">Comprar e-book</option>
                  <option value="GRATUITO">Acessar gratuitamente</option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-400 hover:text-red-300 p-2"
                aria-label={'Remover link ' + (index + 1)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {access.url ? (
              <p className="text-[11px] text-stone-500 flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" />
                Botao publico: <span className="text-stone-300">{access.textoBotao}</span>
              </p>
            ) : null}
          </div>
        );
      })}
    </section>
  );
};
