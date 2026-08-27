import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Loader2,
  Pencil,
  Plus,
  Save,
  Settings,
  Shield,
  Trash2,
  X,
  Users,
  Heart,
  Sparkles,
  Send,
  MessageSquareQuote,
  CheckCircle2,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getAdminAccessToken } from '../../lib/admin/session';

type Sentinel = {
  id: number;
  dayOfMonth: number;
  name: string;
  email: string;
  phone: string | null;
  active: boolean;
  createdAt: string;
};

type Topic = {
  id: number;
  title: string;
  description: string | null;
  category: string;
  prayedCount: number;
  active: boolean;
  order: number;
};

type Praise = {
  id: number;
  title: string;
  testimony: string;
  authorName: string | null;
  date: string | null;
  active: boolean;
  order: number;
};

type Handover = {
  id: number;
  dayOfMonth: number;
  date: string;
  authorName: string;
  message: string | null;
  verse: string | null;
  completedAt: string;
};

type Config = { key: string; value: string };

export default function AdminPrayerPage() {
  const [tab, setTab] = useState<'sentinels' | 'topics' | 'praises' | 'handovers' | 'settings'>('sentinels');
  const [sentinels, setSentinels] = useState<Sentinel[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [praises, setPraises] = useState<Praise[]>([]);
  const [handovers, setHandovers] = useState<Handover[]>([]);
  const [configs, setConfigs] = useState<Config[]>([]);

  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Estados de Criação / Edição
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');
  const [editingTopic, setEditingTopic] = useState<Partial<Topic> | null>(null);
  const [editingPraise, setEditingPraise] = useState<Partial<Praise> | null>(null);

  const request = useCallback(async (path: string, init?: RequestInit) => {
    const token = await getAdminAccessToken();
    const response = await fetch(`/api/admin/prayer${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(init?.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'Não foi possível concluir a operação.');
    }
    return response;
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'sentinels') {
        const query = selectedDayFilter !== 'all' ? `?day=${selectedDayFilter}` : '';
        const res = await (await request(`/sentinels${query}`)).json();
        setSentinels(res);
      } else if (tab === 'topics') {
        const res = await (await request('/topics')).json();
        setTopics(res);
      } else if (tab === 'praises') {
        const res = await (await request('/praises')).json();
        setPraises(res);
      } else if (tab === 'handovers') {
        const res = await (await request('/handovers')).json();
        setHandovers(res);
      } else if (tab === 'settings') {
        const configRes = await (await request('/config')).json();
        setConfigs(configRes);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, [tab, selectedDayFilter, request]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Ações de Sentinelas
  async function deleteSentinel(s: Sentinel) {
    if (!confirm(`Remover ${s.name} do Dia ${s.dayOfMonth}?`)) return;
    try {
      await request(`/sentinels/${s.id}`, { method: 'DELETE' });
      setNotice('Sentinela removido com sucesso.');
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao remover sentinela.');
    }
  }

  // Ações de Motivos (Topics)
  async function saveTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTopic || !editingTopic.title) return;
    try {
      if (editingTopic.id) {
        await request(`/topics/${editingTopic.id}`, {
          method: 'PATCH',
          body: JSON.stringify(editingTopic),
        });
        setNotice('Motivo atualizado com sucesso.');
      } else {
        await request('/topics', {
          method: 'POST',
          body: JSON.stringify(editingTopic),
        });
        setNotice('Motivo criado com sucesso.');
      }
      setEditingTopic(null);
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao salvar motivo.');
    }
  }

  async function deleteTopic(id: number) {
    if (!confirm('Excluir este motivo de oração?')) return;
    try {
      await request(`/topics/${id}`, { method: 'DELETE' });
      setNotice('Motivo excluído com sucesso.');
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao excluir motivo.');
    }
  }

  // Ações de Testemunhos (Praises)
  async function savePraise(e: React.FormEvent) {
    e.preventDefault();
    if (!editingPraise || !editingPraise.title || !editingPraise.testimony) return;
    try {
      if (editingPraise.id) {
        await request(`/praises/${editingPraise.id}`, {
          method: 'PATCH',
          body: JSON.stringify(editingPraise),
        });
        setNotice('Testemunho atualizado com sucesso.');
      } else {
        await request('/praises', {
          method: 'POST',
          body: JSON.stringify(editingPraise),
        });
        setNotice('Testemunho criado com sucesso.');
      }
      setEditingPraise(null);
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao salvar testemunho.');
    }
  }

  async function deletePraise(id: number) {
    if (!confirm('Excluir este testemunho?')) return;
    try {
      await request(`/praises/${id}`, { method: 'DELETE' });
      setNotice('Testemunho excluído com sucesso.');
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao excluir testemunho.');
    }
  }

  // Ações de Configuração
  async function saveConfig(config: Config) {
    try {
      await request(`/config/${encodeURIComponent(config.key)}`, {
        method: 'PUT',
        body: JSON.stringify({ value: config.value }),
      });
      setNotice('Configuração salva com sucesso.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao salvar configuração.');
    }
  }

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-20">
      <Helmet>
        <title>Relógio de Oração (Sentinelas) — Central Administrativa</title>
      </Helmet>

      {/* Header */}
      <header className="border-b border-stone-800 bg-stone-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="rounded-lg border border-stone-700 p-2 hover:bg-stone-800 transition-colors"
              aria-label="Voltar para Central"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-500">
                Pastoral & Eventos
              </p>
              <h1 className="font-serif text-2xl font-bold">Relógio de Oração & Intercessão</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <section className="mx-auto max-w-6xl px-5 py-6">
        <div className="flex flex-wrap gap-2 mb-6 border-b border-stone-800 pb-4">
          <button
            onClick={() => setTab('sentinels')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              tab === 'sentinels' ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Shield className="h-4 w-4" />
            Intercessores (Dias 1..31)
          </button>

          <button
            onClick={() => setTab('topics')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              tab === 'topics' ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Heart className="h-4 w-4" />
            Guia de Motivos
          </button>

          <button
            onClick={() => setTab('praises')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              tab === 'praises' ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Ações de Graças
          </button>

          <button
            onClick={() => setTab('handovers')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              tab === 'handovers' ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <MessageSquareQuote className="h-4 w-4" />
            Histórico de Intercessão
          </button>

          <button
            onClick={() => setTab('settings')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              tab === 'settings' ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Settings className="h-4 w-4" />
            Configurações
          </button>
        </div>

        {/* Alertas */}
        {notice && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-emerald-800 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)}><X className="h-4 w-4" /></button>
          </div>
        )}
        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>
            <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            {/* ABA 1: SENTINELAS */}
            {tab === 'sentinels' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-white">
                      Escala dos Sentinelas ({sentinels.length} ativos)
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Membros cadastrados em cada dia do mês.
                    </p>
                  </div>

                  {/* Filtro de Dia */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">Filtrar por dia:</span>
                    <select
                      value={selectedDayFilter}
                      onChange={(e) => setSelectedDayFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-1.5 text-xs text-stone-100"
                    >
                      <option value="all">Todos os Dias (1 a 31)</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          Dia {d < 10 ? `0${d}` : d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900">
                  {sentinels.length === 0 ? (
                    <p className="p-10 text-center text-stone-500">
                      Nenhum sentinela encontrado para este filtro.
                    </p>
                  ) : (
                    <div className="divide-y divide-stone-800">
                      {sentinels.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-4 hover:bg-stone-850 transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 font-serif font-bold text-amber-400 text-sm">
                              {s.dayOfMonth}
                            </span>
                            <div>
                              <h3 className="font-bold text-white text-sm">{s.name}</h3>
                              <p className="text-xs text-stone-400">{s.email} {s.phone ? `• ${s.phone}` : ''}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[11px] text-stone-500">
                              Cadastrado em {new Date(s.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <button
                              onClick={() => void deleteSentinel(s)}
                              className="rounded-lg border border-red-900/60 p-2 text-red-400 hover:bg-red-950 transition-colors"
                              title="Remover Sentinela"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ABA 2: MOTIVOS DE ORAÇÃO */}
            {tab === 'topics' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-white">Motivos de Oração da Semana</h2>
                    <p className="text-xs text-stone-400 mt-0.5">Gerencie os pedidos que aparecem no portal público.</p>
                  </div>
                  <button
                    onClick={() => setEditingTopic({ title: '', description: '', category: 'Geral', order: topics.length + 1, active: true })}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-stone-950 shadow-md hover:bg-amber-400"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Motivo
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {topics.map((t) => (
                    <div key={t.id} className="flex flex-col justify-between rounded-2xl border border-stone-800 bg-stone-900 p-5">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            {t.category}
                          </span>
                          <span className="text-xs text-stone-500">
                            {t.prayedCount} orações registradas
                          </span>
                        </div>
                        <h3 className="font-bold text-white text-base">{t.title}</h3>
                        {t.description && <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">{t.description}</p>}
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-800">
                        <span className={`text-[11px] font-bold ${t.active ? 'text-emerald-400' : 'text-stone-500'}`}>
                          {t.active ? 'Ativo no portal' : 'Inativo'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingTopic(t)}
                            className="rounded-lg border border-stone-700 p-1.5 hover:bg-stone-800"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4 text-stone-300" />
                          </button>
                          <button
                            onClick={() => void deleteTopic(t.id)}
                            className="rounded-lg border border-red-900/60 p-1.5 text-red-400 hover:bg-red-950"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABA 3: TESTEMUNHOS */}
            {tab === 'praises' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-white">Mural de Gratidão & Testemunhos</h2>
                    <p className="text-xs text-stone-400 mt-0.5">Orações respondidas para edificar a fé da igreja.</p>
                  </div>
                  <button
                    onClick={() => setEditingPraise({ title: '', testimony: '', authorName: '', date: '', order: praises.length + 1, active: true })}
                    className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-stone-950 shadow-md hover:bg-amber-400"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Testemunho
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {praises.map((p) => (
                    <div key={p.id} className="flex flex-col justify-between rounded-2xl border border-stone-800 bg-stone-900 p-5">
                      <div>
                        <h3 className="font-bold text-amber-300 text-base mb-1">{p.title}</h3>
                        <p className="text-xs text-stone-300 italic leading-relaxed">"{p.testimony}"</p>
                        <p className="text-[11px] text-stone-500 mt-3 font-semibold">
                          Por: {p.authorName || 'Anônimo'} {p.date ? `• ${p.date}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-800">
                        <span className={`text-[11px] font-bold ${p.active ? 'text-emerald-400' : 'text-stone-500'}`}>
                          {p.active ? 'Publicado' : 'Oculto'}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingPraise(p)}
                            className="rounded-lg border border-stone-700 p-1.5 hover:bg-stone-800"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4 text-stone-300" />
                          </button>
                          <button
                            onClick={() => void deletePraise(p.id)}
                            className="rounded-lg border border-red-900/60 p-1.5 text-red-400 hover:bg-red-950"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABA 4: HISTÓRICO DE HANDOVERS */}
            {tab === 'handovers' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">Histórico da Guarda (Passagens de Bastão)</h2>
                  <p className="text-xs text-stone-400 mt-0.5">Relatos e bênçãos transmitidas pelos sentinelas.</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900">
                  {handovers.length === 0 ? (
                    <p className="p-10 text-center text-stone-500">Nenhum registro de passagem de bastão ainda.</p>
                  ) : (
                    <div className="divide-y divide-stone-800">
                      {handovers.map((h) => (
                        <div key={h.id} className="p-5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400">
                              Dia {h.dayOfMonth} ({h.date}) — Transmitido por {h.authorName}
                            </span>
                            <span className="text-[11px] text-stone-500">
                              {new Date(h.completedAt).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          {h.message && <p className="text-xs text-stone-300 italic">"{h.message}"</p>}
                          {h.verse && <p className="text-[11px] text-amber-400/80 font-semibold">— {h.verse}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ABA 5: CONFIGURAÇÕES */}
            {tab === 'settings' && (
              <div className="max-w-xl rounded-2xl border border-stone-800 bg-stone-900 p-6 space-y-4">
                <h2 className="font-serif text-xl font-bold">Parâmetros do Relógio</h2>
                <div className="space-y-4 pt-2">
                  {configs.map((config) => (
                    <label key={config.key} className="block text-sm text-stone-300">
                      <span className="font-semibold">{config.key === 'sentinel_capacity' ? 'Capacidade de Sentinelas por Dia' : config.key}</span>
                      <div className="mt-1 flex gap-2">
                        <input
                          value={config.value}
                          onChange={(event) =>
                            setConfigs((current) =>
                              current.map((item) =>
                                item.key === config.key ? { ...item, value: event.target.value } : item
                              )
                            )
                          }
                          className="min-w-0 flex-1 rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-stone-100 text-sm"
                        />
                        <button
                          onClick={() => void saveConfig(config)}
                          className="flex items-center gap-1.5 rounded-xl border border-stone-700 px-4 text-xs font-bold hover:bg-stone-800 text-amber-400"
                        >
                          <Save className="h-4 w-4" /> Salvar
                        </button>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modal de Criação/Edição de Motivo */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-stone-700 bg-stone-900 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingTopic.id ? 'Editar Motivo de Oração' : 'Novo Motivo de Oração'}
              </h3>
              <button onClick={() => setEditingTopic(null)}><X className="h-5 w-5 text-stone-400" /></button>
            </div>
            <form onSubmit={saveTopic} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Título do Pedido *</label>
                <input
                  type="text"
                  required
                  value={editingTopic.title || ''}
                  onChange={(e) => setEditingTopic({ ...editingTopic, title: e.target.value })}
                  placeholder="Ex: Pelas Famílias e Casamentos"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Descrição / Detalhes</label>
                <textarea
                  rows={3}
                  value={editingTopic.description || ''}
                  onChange={(e) => setEditingTopic({ ...editingTopic, description: e.target.value })}
                  placeholder="Detalhes para guiar a intercessão..."
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-sm text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Categoria</label>
                  <select
                    value={editingTopic.category || 'Geral'}
                    onChange={(e) => setEditingTopic({ ...editingTopic, category: e.target.value })}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white"
                  >
                    <option value="Igreja">Igreja</option>
                    <option value="Missões">Missões</option>
                    <option value="Famílias">Famílias</option>
                    <option value="Enfermos">Enfermos</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="topicActive"
                    checked={editingTopic.active ?? true}
                    onChange={(e) => setEditingTopic({ ...editingTopic, active: e.target.checked })}
                    className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="topicActive" className="text-xs font-semibold text-stone-300">
                    Ativo no Portal
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 font-bold text-stone-950 text-sm hover:bg-amber-400"
                >
                  <Save className="h-4 w-4" /> Salvar Motivo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Criação/Edição de Testemunho */}
      {editingPraise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-stone-700 bg-stone-900 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="font-serif text-lg font-bold text-white">
                {editingPraise.id ? 'Editar Testemunho' : 'Novo Testemunho / Gratidão'}
              </h3>
              <button onClick={() => setEditingPraise(null)}><X className="h-5 w-5 text-stone-400" /></button>
            </div>
            <form onSubmit={savePraise} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Título da Vitória *</label>
                <input
                  type="text"
                  required
                  value={editingPraise.title || ''}
                  onChange={(e) => setEditingPraise({ ...editingPraise, title: e.target.value })}
                  placeholder="Ex: Cura e Restauração de Saúde"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Testemunho / Depoimento *</label>
                <textarea
                  rows={3}
                  required
                  value={editingPraise.testimony || ''}
                  onChange={(e) => setEditingPraise({ ...editingPraise, testimony: e.target.value })}
                  placeholder="Relato da bênção alcançada..."
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-sm text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Autor (Opcional)</label>
                  <input
                    type="text"
                    value={editingPraise.authorName || ''}
                    onChange={(e) => setEditingPraise({ ...editingPraise, authorName: e.target.value })}
                    placeholder="Ex: Família Souza"
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Data / Mês (Opcional)</label>
                  <input
                    type="text"
                    value={editingPraise.date || ''}
                    onChange={(e) => setEditingPraise({ ...editingPraise, date: e.target.value })}
                    placeholder="Ex: Agosto de 2026"
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="praiseActive"
                  checked={editingPraise.active ?? true}
                  onChange={(e) => setEditingPraise({ ...editingPraise, active: e.target.checked })}
                  className="rounded border-stone-700 bg-stone-950 text-amber-500 focus:ring-0"
                />
                <label htmlFor="praiseActive" className="text-xs font-semibold text-stone-300">
                  Publicado no Mural
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 font-bold text-stone-950 text-sm hover:bg-amber-400"
                >
                  <Save className="h-4 w-4" /> Salvar Testemunho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
