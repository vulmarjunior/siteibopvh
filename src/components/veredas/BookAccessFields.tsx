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

export function createEmptyBookAccess(ordem = 0): BookAccessFormData {
  return {
    key: `access-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    tipo: 'COMPRA',
    formato: 'IMPRESSO',
    provedor: 'AMAZON',
    fornecedor: 'Amazon',
    url: '',
    textoBotao: 'Comprar na Amazon',
    gratuito: false,
    linkAssociado: false,
    producaoIbo: false,
    ativo: true,
    ordem,
    observacaoPublica: '',
    fonte: '',
    affiliateTag: '',
  };
}

interface BookAccessFieldsProps {
  accesses: BookAccessFormData[];
  onChange: (accesses: BookAccessFormData[]) => void;
  onNormalizeAmazon: (index: number) => Promise<void>;
}

const inputClass =
  'w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200';

export const BookAccessFields: React.FC<BookAccessFieldsProps> = ({
  accesses,
  onChange,
  onNormalizeAmazon,
}) => {
  const update = (index: number, values: Partial<BookAccessFormData>) => {
    onChange(accesses.map((access, current) => (current === index ? { ...access, ...values } : access)));
  };

  const remove = (index: number) => {
    onChange(accesses.filter((_, current) => current !== index).map((access, ordem) => ({ ...access, ordem })));
  };

  return (
    <section className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-wider">
            3. Links de aquisicao e acesso
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Cadastre Amazon, editora, livrarias, sebos ou fontes gratuitas. Links de associado recebem aviso publico.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...accesses, createEmptyBookAccess(accesses.length)])}
          className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Adicionar link
        </button>
      </div>

      {accesses.length === 0 && (
        <p className="text-xs text-stone-500 border border-dashed border-stone-700 rounded-lg p-4 text-center">
          Nenhum link cadastrado. O livro ainda pode ser salvo sem opcao de aquisicao.
        </p>
      )}

      {accesses.map((access, index) => (
        <div key={access.key} className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <strong className="text-xs text-stone-200">Link {index + 1}</strong>
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-red-400 hover:text-red-300 p-1"
              aria-label={`Remover link ${index + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs text-stone-300">
              Tipo
              <select value={access.tipo} onChange={(e) => update(index, { tipo: e.target.value })} className={inputClass}>
                <option value="COMPRA">Compra</option>
                <option value="LEITURA_ONLINE">Leitura online</option>
                <option value="DOWNLOAD_INTEGRAL">Download integral</option>
                <option value="AMOSTRA">Amostra</option>
                <option value="PAGINA_OFICIAL">Pagina oficial</option>
                <option value="EMPRESTIMO">Emprestimo</option>
                <option value="MATERIAL_COMPLEMENTAR">Material complementar</option>
              </select>
            </label>

            <label className="text-xs text-stone-300">
              Provedor
              <select
                value={access.provedor}
                onChange={(e) => {
                  const provedor = e.target.value;
                  update(index, {
                    provedor,
                    fornecedor: provedor === 'AMAZON' && !access.fornecedor ? 'Amazon' : access.fornecedor,
                  });
                }}
                className={inputClass}
              >
                <option value="AMAZON">Amazon</option>
                <option value="EDITORA">Editora</option>
                <option value="LIVRARIA">Livraria</option>
                <option value="ESTANTE_VIRTUAL">Estante Virtual</option>
                <option value="GOOGLE_DRIVE">Google Drive</option>
                <option value="ONEDRIVE">OneDrive</option>
                <option value="SITE_AUTOR">Site do autor</option>
                <option value="SITE_INSTITUCIONAL">Site institucional</option>
                <option value="BIBLIOTECA_DIGITAL">Biblioteca digital</option>
                <option value="OUTRO">Outro</option>
              </select>
            </label>

            <label className="text-xs text-stone-300">
              Formato
              <select value={access.formato} onChange={(e) => update(index, { formato: e.target.value })} className={inputClass}>
                <option value="IMPRESSO">Impresso</option>
                <option value="KINDLE">Kindle</option>
                <option value="PDF">PDF</option>
                <option value="EPUB">EPUB</option>
                <option value="WEB">Web</option>
                <option value="OUTRO">Outro</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs text-stone-300">
              Fornecedor
              <input value={access.fornecedor} onChange={(e) => update(index, { fornecedor: e.target.value })} className={inputClass} placeholder="Amazon, Editora Fiel..." />
            </label>
            <label className="text-xs text-stone-300">
              Texto do botao
              <input required value={access.textoBotao} onChange={(e) => update(index, { textoBotao: e.target.value })} className={inputClass} />
            </label>
          </div>

          <label className="block text-xs text-stone-300">
            URL
            <div className="flex flex-col sm:flex-row gap-2">
              <input required type="url" value={access.url} onChange={(e) => update(index, { url: e.target.value })} className={inputClass} placeholder="https://..." />
              {access.provedor === 'AMAZON' && (
                <button
                  type="button"
                  onClick={() => onNormalizeAmazon(index)}
                  disabled={!access.url}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-amber-300 text-xs font-bold rounded-lg border border-stone-700 whitespace-nowrap flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Validar Amazon
                </button>
              )}
            </div>
          </label>

          {access.provedor === 'AMAZON' && (
            <label className="block text-xs text-stone-300">
              Tag de afiliado Amazon (opcional)
              <input
                value={access.affiliateTag}
                onChange={(e) => update(index, { affiliateTag: e.target.value })}
                className={inputClass}
                placeholder="exemplo-20"
              />
            </label>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs text-stone-300">
              Fonte (opcional)
              <input value={access.fonte} onChange={(e) => update(index, { fonte: e.target.value })} className={inputClass} />
            </label>
            <label className="text-xs text-stone-300">
              Observacao publica
              <input value={access.observacaoPublica} onChange={(e) => update(index, { observacaoPublica: e.target.value })} className={inputClass} />
            </label>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-stone-300">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={access.gratuito} onChange={(e) => update(index, { gratuito: e.target.checked })} />
              Gratuito
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={access.linkAssociado} onChange={(e) => update(index, { linkAssociado: e.target.checked })} />
              Link de associado
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={access.producaoIbo} onChange={(e) => update(index, { producaoIbo: e.target.checked })} />
              Producao IBO
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={access.ativo} onChange={(e) => update(index, { ativo: e.target.checked })} />
              Ativo
            </label>
          </div>
        </div>
      ))}
    </section>
  );
};
