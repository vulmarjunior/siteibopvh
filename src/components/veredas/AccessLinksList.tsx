import React, { useState } from 'react';
import { ExternalLink, Download, ShoppingCart, Sparkles, AlertTriangle } from 'lucide-react';
import { ReportLinkModal } from './ReportLinkModal';

export interface AccessLinkItem {
  id: number;
  tipo: string;
  formato?: string | null;
  provedor?: string | null;
  fornecedor?: string | null;
  url: string;
  textoBotao: string;
  gratuito: boolean;
  linkAssociado: boolean;
  producaoIbo: boolean;
  observacaoPublica?: string | null;
  fonte?: string | null;
}

export interface AccessLinksListProps {
  acessos: AccessLinkItem[];
}

export const AccessLinksList: React.FC<AccessLinksListProps> = ({ acessos }) => {
  const [reportingLink, setReportingLink] = useState<AccessLinkItem | null>(null);

  if (!acessos || acessos.length === 0) {
    return (
      <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-6 text-center text-stone-400 text-xs sm:text-sm">
        <p>Nenhuma opção de aquisição ou leitura digital cadastrada para este livro no momento.</p>
        <p className="text-[11px] text-stone-500 mt-1">Este título pode estar esgotado ou fora de catálogo.</p>
      </div>
    );
  }

  // Group links
  const gratuitos = acessos.filter((a) => a.gratuito);
  const compras = acessos.filter((a) => !a.gratuito && a.tipo === 'COMPRA');
  const outros = acessos.filter((a) => !a.gratuito && a.tipo !== 'COMPRA');

  return (
    <div className="space-y-6">
      
      {/* 1. Free Access Group */}
      {gratuitos.length > 0 && (
        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h4 className="font-serif font-bold text-stone-100 text-base">
              Acesso Gratuito Legítimo
            </h4>
          </div>
          <p className="text-xs text-stone-400 mb-4">
            Links para amostras, capítulos ou livros inteiros oferecidos gratuitamente por editoras, autores ou pela IBO.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gratuitos.map((acesso) => (
              <div key={acesso.id} className="bg-stone-900 border border-stone-800 rounded-lg p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300">
                      {acesso.producaoIbo ? 'Produção IBO' : acesso.formato || 'Gratuito'}
                    </span>
                    {acesso.fornecedor && (
                      <span className="text-[11px] text-stone-400 font-medium">
                        {acesso.fornecedor}
                      </span>
                    )}
                  </div>
                  {acesso.observacaoPublica && (
                    <p className="text-xs text-stone-400 mt-1 italic">
                      "{acesso.observacaoPublica}"
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <a
                    href={acesso.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs rounded transition-colors shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {acesso.textoBotao}
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setReportingLink(acesso)}
                    className="inline-flex items-center gap-1 text-[10px] text-stone-500 underline hover:text-stone-300"
                  >
                    <AlertTriangle className="h-3 w-3" /> Problema com este link?
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Purchase Group */}
      {compras.length > 0 && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCart className="w-5 h-5 text-amber-500" />
            <h4 className="font-serif font-bold text-stone-100 text-base">
              Opções de Aquisição
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {compras.map((acesso) => (
              <div key={acesso.id} className="bg-stone-950 border border-stone-800/80 rounded-lg p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-medium text-stone-300">
                      {acesso.fornecedor || acesso.provedor || 'Livraria'}
                    </span>

                  </div>
                  {acesso.observacaoPublica && (
                    <p className="text-xs text-stone-400 mt-1">
                      {acesso.observacaoPublica}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <a
                    href={acesso.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded transition-colors shadow"
                  >
                    {acesso.textoBotao}
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setReportingLink(acesso)}
                    className="inline-flex items-center gap-1 text-[10px] text-stone-500 underline hover:text-stone-300"
                  >
                    <AlertTriangle className="h-3 w-3" /> Problema com este link?
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Other Group */}
      {outros.length > 0 && (
        <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-5">
          <h4 className="font-serif font-bold text-stone-200 text-sm mb-3">
            Outras Opções de Consulta
          </h4>
          <div className="space-y-2">
            {outros.map((acesso) => (
              <div key={acesso.id} className="flex items-center justify-between gap-3 text-xs bg-stone-950 p-2.5 rounded border border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-300">{acesso.fornecedor || acesso.textoBotao}</span>
                  {acesso.observacaoPublica && <span className="text-stone-500">- {acesso.observacaoPublica}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={acesso.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-amber-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    Acessar <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setReportingLink(acesso)}
                    className="inline-flex items-center gap-1 text-[10px] text-stone-500 underline hover:text-stone-300"
                  >
                    <AlertTriangle className="h-3 w-3" /> Problema com este link?
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportingLink && (
        <ReportLinkModal
          acessoId={reportingLink.id}
          textoBotao={reportingLink.textoBotao}
          fornecedor={reportingLink.fornecedor}
          isOpen={Boolean(reportingLink)}
          onClose={() => setReportingLink(null)}
        />
      )}

    </div>
  );
};
