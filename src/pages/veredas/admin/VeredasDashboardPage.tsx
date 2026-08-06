import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabaseClient } from '../../../lib/veredas/supabaseClient';
import { BookOpen, Film, AlertTriangle, FileText, PlusCircle, LogOut, ShieldAlert } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const VeredasDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboard() {
      try {
        const token = localStorage.getItem('veredas_access_token') || (await supabaseClient.auth.getSession()).data.session?.access_token;
        if (!token) {
          navigate('/admin/veredas/login');
          return;
        }

        const res = await fetch('/api/veredas/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem('veredas_access_token');
          navigate('/admin/veredas/login');
          return;
        }

        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem('veredas_access_token');
    localStorage.removeItem('veredas_user');
    try { await supabaseClient.auth.signOut(); } catch (e) {
      // Ignore sign out error
    }
    navigate('/admin/veredas/login');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans">
      <Helmet>
        <title>Painel Veredas IBO — Dashboard</title>
      </Helmet>

      {/* Admin Topbar */}
      <header className="bg-stone-900 border-b border-stone-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-amber-600 flex items-center justify-center font-bold text-stone-950">
            V
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-amber-100">Painel Veredas IBO</h1>
            <span className="text-[10px] text-stone-400">Gestão Pastoral de Curadoria</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/admin/veredas/conteudos/novo"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Novo Conteúdo
          </Link>

          <button
            onClick={handleLogout}
            className="text-xs text-stone-400 hover:text-stone-100 flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="max-w-7xl mx-auto p-6 sm:p-8 space-y-8">
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-32 bg-stone-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-amber-400">
                <BookOpen className="w-6 h-6" />
                <span className="text-2xl font-bold font-mono">{stats.totalLivros}</span>
              </div>
              <h3 className="font-serif font-bold text-sm text-stone-200">Livros Publicados</h3>
              <p className="text-xs text-stone-400">Títulos disponíveis no catálogo público</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-amber-400">
                <Film className="w-6 h-6" />
                <span className="text-2xl font-bold font-mono">{stats.totalVideos}</span>
              </div>
              <h3 className="font-serif font-bold text-sm text-stone-200">Vídeos Publicados</h3>
              <p className="text-xs text-stone-400">Sermões e exposições curadas</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-yellow-500">
                <FileText className="w-6 h-6" />
                <span className="text-2xl font-bold font-mono">{stats.rascunhos}</span>
              </div>
              <h3 className="font-serif font-bold text-sm text-stone-200">Rascunhos</h3>
              <p className="text-xs text-stone-400">Em fase de elaboração editorial</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <span className="text-2xl font-bold font-mono">{stats.relatosPendentes}</span>
              </div>
              <h3 className="font-serif font-bold text-sm text-stone-200">Relatos de Links Quebrados</h3>
              <Link to="/admin/veredas/relatos" className="text-xs text-amber-400 underline block">
                Ver e analisar relatos →
              </Link>
            </div>

          </div>
        ) : null}

      </main>
    </div>
  );
};
