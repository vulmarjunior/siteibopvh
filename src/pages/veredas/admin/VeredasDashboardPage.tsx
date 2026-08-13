import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearAdminSession, getAdminAccessToken } from '../../../lib/admin/session';
import { BookOpen, Film, AlertTriangle, FileText, PlusCircle, LogOut, Edit, Trash2, CheckCircle, Archive, ExternalLink, LayoutDashboard } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const VeredasDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterTipo, setFilterTipo] = useState<string>('TODOS');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getAdminAccessToken();

      const [resStats, resItems] = await Promise.all([
        fetch('/api/veredas/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/veredas/admin/items', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!resStats.ok || !resItems.ok) {
        await clearAdminSession();
        navigate('/admin/login');
        return;
      }

      const statsData = await resStats.json();
      const itemsData = await resItems.json();

      setStats(statsData);
      if (Array.isArray(itemsData)) {
        setItems(itemsData);
      }
    } catch (err) {
      console.error('Error loading admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  const handlePublish = async (id: number) => {
    setActionLoadingId(id);
    try {
      const token = await getAdminAccessToken();
      const res = await fetch(`/api/veredas/admin/items/${id}/publicar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (id: number) => {
    setActionLoadingId(id);
    try {
      const token = await getAdminAccessToken();
      const res = await fetch(`/api/veredas/admin/items/${id}/arquivar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id: number, titulo: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o conteúdo "${titulo}"?`)) return;

    setActionLoadingId(id);
    try {
      const token = await getAdminAccessToken();
      const res = await fetch(`/api/veredas/admin/items/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = async () => {
    const token = await getAdminAccessToken();
    await fetch('/api/admin/auth/logout', { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : {} }).catch(() => undefined);
    await clearAdminSession();
    navigate('/admin/login');
  };

  const filteredItems = items.filter((item) => {
    if (filterStatus !== 'TODOS' && item.status !== filterStatus) return false;
    if (filterTipo !== 'TODOS' && item.tipo !== filterTipo) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans">
      <Helmet>
        <title>Painel Veredas IBO — Dashboard</title>
      </Helmet>

      {/* Admin Topbar */}
      <header className="bg-stone-900 border-b border-stone-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-stone-950 shadow-md">
            V
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg text-amber-100">Painel Veredas IBO</h1>
            <span className="text-[10px] text-stone-400">Gestão Pastoral de Curadoria</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-stone-700"
          >
            <LayoutDashboard className="w-3.5 h-3.5" /> Central
          </Link>
          <Link
            to="/veredas"
            target="_blank"
            className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors border border-stone-700"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ver Site Público
          </Link>

          <Link
            to="/admin/veredas/conteudos/novo"
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors shadow-md"
          >
            <PlusCircle className="w-4 h-4" /> Novo Conteúdo
          </Link>

          <button
            onClick={handleLogout}
            className="text-xs text-stone-400 hover:text-stone-100 flex items-center gap-1 ml-2"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="max-w-7xl mx-auto p-6 sm:p-8 space-y-8">
        
        {/* Metric Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-stone-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-amber-400">
                <BookOpen className="w-6 h-6" />
                <span className="text-2xl font-bold font-mono">{stats.totalLivros}</span>
              </div>
              <h3 className="font-serif font-bold text-sm text-stone-200">Livros Publicados</h3>
              <p className="text-xs text-stone-400">Livros curados e ativos</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-amber-400">
                <Film className="w-6 h-6" />
                <span className="text-2xl font-bold font-mono">{stats.totalVideos}</span>
              </div>
              <h3 className="font-serif font-bold text-sm text-stone-200">Vídeos Publicados</h3>
              <p className="text-xs text-stone-400">Sermões e exposições</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-yellow-500">
                <FileText className="w-6 h-6" />
                <span className="text-2xl font-bold font-mono">{stats.rascunhos}</span>
              </div>
              <h3 className="font-serif font-bold text-sm text-stone-200">Rascunhos</h3>
              <p className="text-xs text-stone-400">Em preparação editorial</p>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <span className="text-2xl font-bold font-mono">{stats.relatosPendentes}</span>
              </div>
              <h3 className="font-serif font-bold text-sm text-stone-200">Relatos de Links</h3>
              <Link to="/admin/veredas/relatos" className="text-xs text-amber-400 hover:underline block font-semibold">
                Analisar relatos →
              </Link>
            </div>

          </div>
        ) : null}

        {/* Content Management Table Section */}
        <section className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
            <div>
              <h2 className="font-serif font-bold text-xl text-amber-100">
                Gerenciamento de Conteúdos
              </h2>
              <p className="text-xs text-stone-400">
                Edite, publique ou altere rascunhos de livros e vídeos curados
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-medium">Tipo:</span>
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-200 px-3 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="TODOS">Todos os Tipos</option>
                  <option value="LIVRO">Livros</option>
                  <option value="VIDEO">Vídeos</option>
                  <option value="CURSO">Cursos/Playlists</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-medium">Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-stone-950 border border-stone-700 rounded-lg text-xs text-stone-200 px-3 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="TODOS">Todos os Status</option>
                  <option value="PUBLICADO">Publicado</option>
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="ARQUIVADO">Arquivado</option>
                </select>
              </div>
            </div>
          </div>

          {/* List of Contents */}
          {loading ? (
            <div className="text-center py-12 text-stone-500 text-sm">Carregando conteúdos...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <p className="text-stone-400 text-sm">Nenhum conteúdo encontrado para os filtros selecionados.</p>
              <Link
                to="/admin/veredas/conteudos/novo"
                className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Cadastrar Novo Conteúdo
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Título</th>
                    <th className="py-3 px-4">Nível</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {filteredItems.map((item) => {
                    const isLoadingThis = actionLoadingId === item.id;
                    const publicUrl = item.tipo === 'LIVRO' ? `/veredas/livro/${item.slug}` : item.tipo === 'VIDEO' ? `/veredas/video/${item.slug}` : `/veredas/curso/${item.slug}`;

                    return (
                      <tr key={item.id} className="hover:bg-stone-800/30 transition-colors">
                        {/* Tipo Badge */}
                        <td className="py-3.5 px-4 font-mono font-medium">
                          {item.tipo === 'LIVRO' ? (
                            <span className="px-2 py-0.5 rounded bg-amber-950 border border-amber-800 text-amber-300 flex items-center gap-1 w-max">
                              <BookOpen className="w-3 h-3" /> Livro
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 flex items-center gap-1 w-max">
                              <Film className="w-3 h-3" /> Vídeo
                            </span>
                          )}
                        </td>

                        {/* Título & Detalhes */}
                        <td className="py-3.5 px-4 font-medium text-stone-100 max-w-xs sm:max-w-md">
                          <div className="font-bold text-stone-200 hover:text-amber-300 transition-colors truncate">
                            <Link to={`/admin/veredas/conteudos/${item.id}`}>{item.titulo}</Link>
                          </div>
                          <p className="text-[11px] text-stone-400 truncate mt-0.5">{item.resumo}</p>
                        </td>

                        {/* Nível */}
                        <td className="py-3.5 px-4 text-stone-300">
                          {item.nivel === 'INTRODUTORIO' && 'Introdução'}
                          {item.nivel === 'INTERMEDIARIO' && 'Intermediário'}
                          {item.nivel === 'APROFUNDAMENTO' && 'Aprofundamento'}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          {item.status === 'PUBLICADO' && (
                            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-semibold">
                              Publicado
                            </span>
                          )}
                          {item.status === 'RASCUNHO' && (
                            <span className="px-2 py-0.5 rounded bg-yellow-950 border border-yellow-800 text-yellow-300 font-semibold">
                              Rascunho
                            </span>
                          )}
                          {item.status === 'ARQUIVADO' && (
                            <span className="px-2 py-0.5 rounded bg-stone-800 border border-stone-700 text-stone-400">
                              Arquivado
                            </span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Editar Button */}
                            <Link
                              to={`/admin/veredas/conteudos/${item.id}`}
                              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-200 font-medium text-[11px] rounded border border-stone-700 flex items-center gap-1 transition-colors"
                              title="Editar conteúdo"
                            >
                              <Edit className="w-3 h-3" /> Editar
                            </Link>

                            {/* Publicar ou Arquivar Button */}
                            {item.status !== 'PUBLICADO' ? (
                              <button
                                onClick={() => handlePublish(item.id)}
                                disabled={isLoadingThis}
                                className="px-2.5 py-1 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 font-medium text-[11px] rounded border border-emerald-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                                title="Publicar no site"
                              >
                                <CheckCircle className="w-3 h-3" /> Publicar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleArchive(item.id)}
                                disabled={isLoadingThis}
                                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-[11px] rounded border border-stone-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                                title="Arquivar conteúdo"
                              >
                                <Archive className="w-3 h-3" /> Arquivar
                              </button>
                            )}

                            {/* Ver em Produção se for publicado */}
                            {item.status === 'PUBLICADO' && (
                              <Link
                                to={publicUrl}
                                target="_blank"
                                className="p-1 bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 rounded border border-stone-700"
                                title="Ver no catálogo público"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}

                            {/* Excluir Button */}
                            <button
                              onClick={() => handleDelete(item.id, item.titulo)}
                              disabled={isLoadingThis}
                              className="p-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 rounded border border-red-800/80 transition-colors disabled:opacity-50"
                              title="Excluir conteúdo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};
