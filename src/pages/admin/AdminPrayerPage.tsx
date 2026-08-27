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
  UserPlus,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { getAdminAccessToken } from '../../lib/admin/session';

const DAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const ORDERED_DAYS = [
  { dayOfWeek: 1, name: 'Segunda-feira' },
  { dayOfWeek: 2, name: 'Terça-feira' },
  { dayOfWeek: 3, name: 'Quarta-feira' },
  { dayOfWeek: 4, name: 'Quinta-feira' },
  { dayOfWeek: 5, name: 'Sexta-feira' },
  { dayOfWeek: 6, name: 'Sábado' },
  { dayOfWeek: 0, name: 'Domingo' },
];

type Sentinel = {
  id: number;
  dayOfWeek: number;
  dayOfMonth?: number | null;
  name: string;
  email: string | null;
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
  dayOfWeek: number;
  dayOfMonth?: number | null;
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
  const [quickSentinel, setQuickSentinel] = useState({
    dayOfWeek: 1,
    name: '',
    email: '',
    phone: '',
  });
  const [savingQuickSentinel, setSavingQuickSentinel] = useState(false);

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
        const query = selectedDayFilter !== 'all' ? `?dayOfWeek=${selectedDayFilter}` : '';
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

  // Ações de Intercessores
  async function handleQuickAddSentinel(e: React.FormEvent) {
    e.preventDefault();
    if (!quickSentinel.name.trim()) return;
    setSavingQuickSentinel(true);
    try {
      await request('/sentinels/quick-add', {
        method: 'POST',
        body: JSON.stringify(quickSentinel),
      });
      setNotice(`Intercessor "${quickSentinel.name}" cadastrado com sucesso para toda ${DAY_NAMES[quickSentinel.dayOfWeek]}.`);
      setQuickSentinel({ dayOfWeek: quickSentinel.dayOfWeek, name: '', email: '', phone: '' });
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao cadastrar intercessor.');
    } finally {
      setSavingQuickSentinel(false);
    }
  }

  async function deleteSentinel(s: Sentinel) {
    const dayName = DAY_NAMES[s.dayOfWeek] || `Dia ${s.dayOfWeek}`;
    if (!confirm(`Remover "${s.name}" da escala de ${dayName}?`)) return;
    try {
      await request(`/sentinels/${s.id}`, { method: 'DELETE' });
      setNotice('Intercessor removido com sucesso.');
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Erro ao remover intercessor.');
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
        <title>Relógio de Oração & Intercessão — Central Administrativa</title>
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
            Escala Semanal ({sentinels.length})
          </button>

          <button
            onClick={() => setTab('topics')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              tab === 'topics' ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Heart className="h-4 w-4" />
            Guia de Motivos ({topics.length})
          </button>

          <button
            onClick={() => setTab('praises')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              tab === 'praises' ? 'bg-amber-500 text-stone-950 shadow-md' : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Ações de Graças ({praises.length})
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
            {/* ABA 1: ESCALA SEMANAL & CADASTRO RÁPIDO */}
            {tab === 'sentinels' && (
              <div className="space-y-8">
                {/* Mesa de Cadastro Rápido Pastoral (Culto de Oração) */}
                <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                      <UserPlus className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-serif font-bold text-white">
                        Mesa de Escalação Pastoral (Cadastro Rápido)
                      </h2>
                      <p className="text-xs text-stone-400">
                        Cadastre membros, famílias ou ministérios diretamente no culto de oração ou reunião.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleQuickAddSentinel} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300 mb-1">
                        Dia da Semana *
                      </label>
                      <select
                        value={quickSentinel.dayOfWeek}
                        onChange={(e) => setQuickSentinel({ ...quickSentinel, dayOfWeek: Number(e.target.value) })}
                        className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs text-stone-100 focus:border-amber-500 focus:outline-none"
                      >
                        {ORDERED_DAYS.map((d) => (
                          <option key={d.dayOfWeek} value={d.dayOfWeek}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300 mb-1">
                        Nome / Família / Ministério *
                      </label>
                      <input
                        type="text"
                        required
                        value={quickSentinel.name}
                        onChange={(e) => setQuickSentinel({ ...quickSentinel, name: e.target.value })}
                        placeholder="Ex: Irmão Marcos, Família Silva, Jovens"
                        className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-300 mb-1">
                        E-mail (Opcional)
                      </label>
                      <input
                        type="email"
                        value={quickSentinel.email}
                        onChange={(e) => setQuickSentinel({ ...quickSentinel, email: e.target.value })}
                        placeholder="email@exemplo.com"
                        className="w-full rounded-xl border border-stone-700 bg-stone-900 px-3 py-2 text-xs text-stone-100 placeholder:text-stone-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingQuickSentinel || !quickSentinel.name.trim()}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-stone-950 shadow-md hover:bg-amber-400 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      {savingQuickSentinel ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      <span>Escalar Intercessor</span>
                    </button>
                  </form>
                </div>

                {/* Painel Gráfico de Ocupação da Semana */}
                {(() => {
                  const capacity = Number.parseInt(configs.find((c) => c.key === 'sentinel_capacity')?.value || '4', 10) || 4;
                  const totalCapacity = 7 * capacity;
                  const totalFilled = sentinels.length;
                  const occupancyPercent = totalCapacity > 0 ? Math.round((Math.min(totalFilled, totalCapacity) / totalCapacity) * 100) : 0;
                  const fullyCoveredDays = ORDERED_DAYS.filter((d) => sentinels.filter((s) => s.dayOfWeek === d.dayOfWeek).length >= capacity).length;

                  return (
                    <div className="rounded-3xl border border-stone-800 bg-stone-900 p-6 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                            <Shield className="h-4 w-4 text-amber-500" />
                            Taxa de Ocupação & Cobertura Semanal
                          </h3>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {totalFilled} intercessores ativos em {totalCapacity} vagas totais da semana.
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-stone-800 border border-white/5 px-3 py-1.5 text-right">
                            <span className="text-lg font-serif font-bold text-amber-400">{occupancyPercent}%</span>
                            <span className="text-[10px] text-stone-400 block">Ocupação Geral</span>
                          </div>
                          <div className="rounded-2xl bg-stone-800 border border-white/5 px-3 py-1.5 text-right">
                            <span className="text-lg font-serif font-bold text-emerald-400">{fullyCoveredDays}/7</span>
                            <span className="text-[10px] text-stone-400 block">Dias 100% Cheios</span>
                          </div>
                        </div>
                      </div>

                      {/* Termômetro */}
                      <div className="space-y-1.5">
                        <div className="h-3 w-full rounded-full bg-stone-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
                            style={{ width: `${Math.max(occupancyPercent, 5)}%` }}
                          />
                        </div>
                      </div>

                      {/* Gráfico de Barras dos 7 Dias */}
                      <div className="grid grid-cols-7 gap-2 pt-2 items-end h-28 border-t border-stone-800">
                        {ORDERED_DAYS.map((d) => {
                          const count = sentinels.filter((s) => s.dayOfWeek === d.dayOfWeek).length;
                          const percent = Math.min(100, Math.round((count / capacity) * 100));
                          const isFull = count >= capacity;

                          return (
                            <div key={d.dayOfWeek} className="flex flex-col items-center justify-end h-full">
                              <span className="text-[10px] font-bold text-stone-400 mb-1">{count}/{capacity}</span>
                              <div className="w-full max-w-[36px] bg-stone-800 rounded-lg h-16 p-0.5 flex items-end">
                                <div
                                  className={`w-full rounded transition-all duration-300 ${
                                    isFull ? 'bg-emerald-500' : count > 0 ? 'bg-amber-500' : 'bg-stone-700'
                                  }`}
                                  style={{ height: `${Math.max(percent, 10)}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-bold text-stone-300 mt-1.5">{d.name.split('-')[0]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Grade dos 7 Dias da Semana com Alocações */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-serif font-bold text-white">
                      Escala Recorrente por Dia da Semana
                    </h3>
                    {/* Filtro */}
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <span>Filtrar:</span>
                      <select
                        value={selectedDayFilter}
                        onChange={(e) => setSelectedDayFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        className="rounded-xl border border-stone-700 bg-stone-900 px-3 py-1.5 text-xs text-stone-100"
                      >
                        <option value="all">Semana Completa (Todos os Dias)</option>
                        {ORDERED_DAYS.map((d) => (
                          <option key={d.dayOfWeek} value={d.dayOfWeek}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                    {ORDERED_DAYS.filter((d) => selectedDayFilter === 'all' || selectedDayFilter === d.dayOfWeek).map((d) => {
                      const daySentinels = sentinels.filter((s) => s.dayOfWeek === d.dayOfWeek);

                      return (
                        <div
                          key={d.dayOfWeek}
                          className="flex flex-col justify-between rounded-2xl border border-stone-800 bg-stone-900 p-4 shadow-sm"
                        >
                          <div>
                            <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-800">
                              <span className="font-serif font-bold text-amber-400 text-sm">
                                {d.name.split('-')[0]}
                              </span>
                              <span className="text-[10px] font-bold bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full">
                                {daySentinels.length} {daySentinels.length === 1 ? 'irmão' : 'irmãos'}
                              </span>
                            </div>

                            {daySentinels.length > 0 ? (
                              <div className="space-y-2">
                                {daySentinels.map((s) => (
                                  <div
                                    key={s.id}
                                    className="flex items-center justify-between p-2 rounded-xl bg-stone-850 border border-white/5 group"
                                  >
                                    <div className="truncate pr-1">
                                      <p className="text-xs font-bold text-white truncate">{s.name}</p>
                                      {s.email && <p className="text-[10px] text-stone-400 truncate">{s.email}</p>}
                                    </div>
                                    <button
                                      onClick={() => void deleteSentinel(s)}
                                      className="text-stone-500 hover:text-red-400 p-1 rounded transition-colors shrink-0"
                                      title="Remover"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-stone-500 italic py-4 text-center">
                                Vago
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ABA 2: MOTIVOS DE ORAÇÃO */}
            {tab === 'topics' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-white">Guia de Motivos de Oração da Semana</h2>
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
                            {t.prayedCount} intercessões registradas
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

            {/* ABA 3: TESTEMUNHOS & AÇÕES DE GRAÇAS */}
            {tab === 'praises' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-white">Ações de Graças & Providência Divina</h2>
                    <p className="text-xs text-stone-400 mt-0.5">Testemunhos e orações respondidas publicadas no portal.</p>
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
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-amber-400">{p.authorName || 'Igreja'}</span>
                          <span className="text-xs text-stone-500">{p.date || ''}</span>
                        </div>
                        <h3 className="font-bold text-white text-base">{p.title}</h3>
                        <p className="text-xs text-stone-300 mt-2 leading-relaxed italic">"{p.testimony}"</p>
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

            {/* ABA 4: HISTÓRICO DE INTERCESSÕES */}
            {tab === 'handovers' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">Histórico de Intercessões & Saudações</h2>
                  <p className="text-xs text-stone-400 mt-0.5">Registro das orações realizadas e palavras compartilhadas pelos irmãos.</p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900">
                  {handovers.length === 0 ? (
                    <p className="p-10 text-center text-stone-500">Nenhum registro de oração até o momento.</p>
                  ) : (
                    <div className="divide-y divide-stone-800">
                      {handovers.map((h) => (
                        <div key={h.id} className="p-4 hover:bg-stone-850 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-400">{h.authorName}</span>
                            <span className="text-[11px] text-stone-400">{new Date(h.completedAt).toLocaleString('pt-BR')}</span>
                          </div>
                          {h.message && <p className="text-xs text-stone-200 mt-1 italic">"{h.message}"</p>}
                          {h.verse && <p className="text-[11px] text-amber-500/80 font-bold mt-1">— {h.verse}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ABA 5: CONFIGURAÇÕES */}
            {tab === 'settings' && (
              <div className="space-y-6 max-w-xl">
                <div>
                  <h2 className="text-xl font-serif font-bold text-white">Parâmetros do Ministério</h2>
                  <p className="text-xs text-stone-400 mt-0.5">Ajuste os limites e capacidades do sistema.</p>
                </div>

                <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6 space-y-4">
                  {configs.map((c) => (
                    <div key={c.key}>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-300 mb-1">
                        {c.key === 'sentinel_capacity' ? 'Capacidade de Intercessores por Dia da Semana' : c.key}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          defaultValue={c.value}
                          onBlur={(e) => {
                            if (e.target.value !== c.value) {
                              void saveConfig({ key: c.key, value: e.target.value });
                            }
                          }}
                          className="w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-stone-100"
                        />
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Define quantas vagas são abertas em cada dia da semana (padrão: 4).
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modal Edição de Motivo */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={saveTopic} className="w-full max-w-lg rounded-3xl bg-stone-900 border border-amber-500/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-white text-lg">{editingTopic.id ? 'Editar Motivo' : 'Novo Motivo'}</h3>
              <button type="button" onClick={() => setEditingTopic(null)}><X className="h-5 w-5 text-stone-400" /></button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Título do Pedido *</label>
              <input
                type="text"
                required
                value={editingTopic.title || ''}
                onChange={(e) => setEditingTopic({ ...editingTopic, title: e.target.value })}
                className="w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Descrição / Instrução de Oração</label>
              <textarea
                rows={3}
                value={editingTopic.description || ''}
                onChange={(e) => setEditingTopic({ ...editingTopic, description: e.target.value })}
                className="w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Categoria</label>
              <select
                value={editingTopic.category || 'Geral'}
                onChange={(e) => setEditingTopic({ ...editingTopic, category: e.target.value })}
                className="w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white"
              >
                <option value="Igreja">Igreja & Liderança</option>
                <option value="Missões">Missões & Evangelismo</option>
                <option value="Famílias">Famílias & Jovens</option>
                <option value="Enfermos">Enfermos & Aflitos</option>
                <option value="Geral">Geral</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activeTopic"
                checked={editingTopic.active ?? true}
                onChange={(e) => setEditingTopic({ ...editingTopic, active: e.target.checked })}
                className="rounded border-stone-700 bg-stone-800 text-amber-500"
              />
              <label htmlFor="activeTopic" className="text-xs text-stone-300">Ativo e visível no portal</label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditingTopic(null)} className="px-4 py-2 text-xs text-stone-400">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs">Salvar Motivo</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Edição de Testemunho */}
      {editingPraise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={savePraise} className="w-full max-w-lg rounded-3xl bg-stone-900 border border-amber-500/30 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-white text-lg">{editingPraise.id ? 'Editar Testemunho' : 'Novo Testemunho'}</h3>
              <button type="button" onClick={() => setEditingPraise(null)}><X className="h-5 w-5 text-stone-400" /></button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Título do Testemunho *</label>
              <input
                type="text"
                required
                value={editingPraise.title || ''}
                onChange={(e) => setEditingPraise({ ...editingPraise, title: e.target.value })}
                className="w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1">Relato / Graça Alcançada *</label>
              <textarea
                rows={4}
                required
                value={editingPraise.testimony || ''}
                onChange={(e) => setEditingPraise({ ...editingPraise, testimony: e.target.value })}
                className="w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Autor / Ministério</label>
                <input
                  type="text"
                  value={editingPraise.authorName || ''}
                  onChange={(e) => setEditingPraise({ ...editingPraise, authorName: e.target.value })}
                  placeholder="Ex: Família Santos"
                  className="w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">Data / Período</label>
                <input
                  type="text"
                  value={editingPraise.date || ''}
                  onChange={(e) => setEditingPraise({ ...editingPraise, date: e.target.value })}
                  placeholder="Ex: Agosto de 2026"
                  className="w-full rounded-xl border border-stone-700 bg-stone-800 px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activePraise"
                checked={editingPraise.active ?? true}
                onChange={(e) => setEditingPraise({ ...editingPraise, active: e.target.checked })}
                className="rounded border-stone-700 bg-stone-800 text-amber-500"
              />
              <label htmlFor="activePraise" className="text-xs text-stone-300">Publicado no portal</label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setEditingPraise(null)} className="px-4 py-2 text-xs text-stone-400">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs">Salvar Testemunho</button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}
