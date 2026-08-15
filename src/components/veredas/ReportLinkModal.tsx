import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export interface ReportLinkModalProps {
  acessoId: number;
  textoBotao: string;
  fornecedor?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const motivosMap = [
  { value: 'LINK_NAO_ABRE', label: 'O link não abre' },
  { value: 'PAGINA_NAO_ENCONTRADA', label: 'Página não encontrada (Erro 404)' },
  { value: 'CONTEUDO_REMOVIDO', label: 'O conteúdo foi removido' },
  { value: 'EXIGE_LOGIN', label: 'Exige cadastro ou login pago' },
  { value: 'NAO_E_MAIS_GRATUITO', label: 'O conteúdo não é mais gratuito' },
  { value: 'CONTEUDO_INCORRETO', label: 'O link direciona para o livro errado' },
  { value: 'REDIRECIONAMENTO_INDESEJADO', label: 'Redireciona para site indesejado' },
  { value: 'OUTRO', label: 'Outro motivo' },
];

export const ReportLinkModal: React.FC<ReportLinkModalProps> = ({
  acessoId,
  textoBotao,
  fornecedor,
  isOpen,
  onClose,
}) => {
  const [motivo, setMotivo] = useState(motivosMap[0].value);
  const [observacao, setObservacao] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Honeypot trap

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`/api/veredas/acessos/${acessoId}/reportar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivo,
          observacao: observacao.trim() || undefined,
          honeypot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || (data.errors && data.errors[0]) || 'Erro ao enviar reporte');
      }

      setSuccessMsg(data.message || 'Obrigado por nos avisar. Nossa equipe verificará este link.');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao enviar reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="link-problem-title" className="bg-stone-900 border border-stone-800 rounded-xl shadow-2xl max-w-md w-full p-6 text-stone-200 relative">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 p-1 rounded-md"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 id="link-problem-title" className="font-serif text-lg font-bold text-stone-100 mb-1">
          Informar problema no link
        </h3>
        <p className="text-xs text-stone-400 mb-4">
          Aviso para o link <span className="font-semibold text-amber-400">"{textoBotao}"</span> {fornecedor ? `(${fornecedor})` : ''}
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg ? (
          <div className="p-4 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-sm rounded flex items-center gap-3 my-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <p>{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Honeypot field (hidden from humans) */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                name="website_url_check"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Qual o problema encontrado? <span className="text-amber-500">*</span>
              </label>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
              >
                {motivosMap.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Observação adicional (opcional)
              </label>
              <textarea
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Ex: O link abre uma página de erro 404 da editora."
                className="w-full bg-stone-800 border border-stone-700 rounded-lg p-3 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500 resize-none"
              />
              <span className="text-[10px] text-stone-500 block text-right">
                {observacao.length}/500 caracteres
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-lg transition-colors shadow disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar aviso'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
