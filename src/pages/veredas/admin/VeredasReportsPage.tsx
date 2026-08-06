import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabaseClient } from '../../../lib/veredas/supabaseClient';
import { AlertTriangle, CheckCircle2, ArrowLeft, ExternalLink } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const VeredasReportsPage: React.FC = () => {
  const [relatos, setRelatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadReports() {
      try {
        const session = (await supabaseClient.auth.getSession()).data.session;
        if (!session) {
          navigate('/admin/veredas/login');
          return;
        }

        const res = await fetch('/api/veredas/admin/relatos', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
          navigate('/admin/veredas/login');
          return;
        }

        const data = await res.json();
        if (Array.isArray(data)) setRelatos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [navigate]);

  const handleResolve = async (id: number) => {
    try {
      const session = (await supabaseClient.auth.getSession()).data.session;
      const res = await fetch(`/api/veredas/admin/relatos/${id}/resolver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ notaAdministrativa: 'Verificado e corrigido pelo curador.' }),
      });

      if (res.ok) {
        setRelatos((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'RESOLVIDO' } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans p-6 sm:p-8">
      <Helmet>
        <title>Relatos de Links — Veredas Admin</title>
      </Helmet>

      <div className="max-w-5xl mx-auto space-y-6">
        
        <Link to="/admin/veredas" className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-amber-400">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
        </Link>

        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <h1 className="font-serif text-2xl font-bold text-amber-100 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Relatos de Links Quebrados
          </h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-stone-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : relatos.length > 0 ? (
          <div className="space-y-4">
            {relatos.map((r) => (
              <div key={r.id} className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                      r.status === 'PENDENTE' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    }`}>
                      {r.status}
                    </span>
                    <span className="text-stone-400">
                      Motivo: <strong>{r.motivo}</strong>
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-amber-100">
                    Livro: {r.acesso?.livro?.item?.titulo || 'Livro ID #' + r.acesso?.livroId}
                  </p>

                  <p className="text-xs text-stone-400">
                    Link: <a href={r.acesso?.url} target="_blank" rel="noopener noreferrer" className="text-amber-400 underline">{r.acesso?.textoBotao} ({r.acesso?.url})</a>
                  </p>

                  {r.observacao && (
                    <p className="text-xs text-stone-300 italic bg-stone-950 p-2 rounded border border-stone-800">
                      "{r.observacao}"
                    </p>
                  )}
                </div>

                {r.status === 'PENDENTE' && (
                  <button
                    onClick={() => handleResolve(r.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold text-xs rounded-lg transition-colors shadow shrink-0"
                  >
                    Marcar Resolvido
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-12 text-center text-stone-400">
            Nenhum relato pendente no momento.
          </div>
        )}

      </div>
    </div>
  );
};
