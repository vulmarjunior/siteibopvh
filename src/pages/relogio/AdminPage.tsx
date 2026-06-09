import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Users, Trash2, ChevronLeft, ChevronRight, Loader2, Lock, Download, MessageSquare, CheckCircle, Archive, Settings, Plus, Save, Pencil, X } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const AdminPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<any[]>([]);
  const [themes, setThemes] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'reservations' | 'settings'>('reservations');
  const [newThemeLabel, setNewThemeLabel] = useState('');
  const [editingThemeId, setEditingThemeId] = useState<number | null>(null);
  const [editingThemeLabel, setEditingThemeLabel] = useState('');
  const [editingReservationId, setEditingReservationId] = useState<number | null>(null);
  const [editingReservationData, setEditingReservationData] = useState<any>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error' | 'loading', message: string } | null>(null);

  const getChurchDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const dateStr = getChurchDateStr(currentDate);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/config?password=${password}`);
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        alert('Senha incorreta.');
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reservations?date=${dateStr}&password=${password}`);
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [themesRes, configsRes] = await Promise.all([
        fetch(`/api/admin/themes?password=${password}`),
        fetch(`/api/admin/config?password=${password}`)
      ]);
      if (themesRes.ok) setThemes(await themesRes.json());
      if (configsRes.ok) setConfigs(await configsRes.json());
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'reservations') fetchReservations();
      else fetchSettings();
    }
  }, [isAuthenticated, dateStr, activeTab]);

  const cancelReservation = async (id: number) => {
    console.log('cancelReservation called for ID:', id);
    try {
      console.log('Sending delete request for ID:', id);
      const res = await fetch(`/api/admin/cancel/${id}`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      console.log('Delete response status:', res.status);
      if (res.ok) {
        setConfirmDeleteId(null);
        fetchReservations();
      } else {
        const data = await res.json();
        console.error('Delete failed:', data);
        alert(data.error || 'Erro ao cancelar reserva.');
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Erro de conexão ao tentar cancelar.');
    }
  };

  const updateReservation = async () => {
    if (!editingReservationId || !editingReservationData) return;
    try {
      const res = await fetch(`/api/admin/update/${editingReservationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingReservationData, password }),
      });
      if (res.ok) {
        setEditingReservationId(null);
        fetchReservations();
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
    }
  };

  const saveConfig = async (key: string, value: string) => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, password }),
      });
      if (res.ok) fetchSettings();
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const addTheme = async () => {
    if (!newThemeLabel) return;
    try {
      const res = await fetch('/api/admin/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newThemeLabel, active: true, password }),
      });
      if (res.ok) {
        setNewThemeLabel('');
        fetchSettings();
      }
    } catch (error) {
      console.error('Error adding theme:', error);
    }
  };

  const toggleThemeStatus = async (theme: any) => {
    try {
      const res = await fetch('/api/admin/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...theme, active: !theme.active, password }),
      });
      if (res.ok) fetchSettings();
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  };

  const deleteTheme = async (id: number) => {
    if (!confirm('Excluir este tema permanentemente?')) return;
    try {
      const res = await fetch(`/api/admin/themes/${id}?password=${password}`, { method: 'DELETE' });
      if (res.ok) fetchSettings();
    } catch (error) {
      console.error('Error deleting theme:', error);
    }
  };

  const exportCSV = () => {
    window.open(`/api/admin/export/csv?password=${password}`, '_blank');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-stone-800 border border-white/5 p-8 rounded-3xl shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Lock className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white text-center mb-2">Painel Administrativo</h1>
          <p className="text-stone-500 text-center text-sm mb-8">Relógio de Oração IBO</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Senha de Acesso"
              className="w-full bg-stone-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            <button className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3 rounded-xl transition-all">
              Entrar
            </button>
            <div className="pt-4 border-t border-white/5 mt-4 space-y-2">
              <button 
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/api/debug');
                    const data = await res.json();
                    const debugInfo = JSON.stringify(data, null, 2);
                    console.log('Debug Info:', data);
                    
                    // Create a temporary textarea to show the info and allow copying
                    const overlay = document.createElement('div');
                    overlay.id = 'debug-overlay';
                    overlay.className = 'fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4';
                    overlay.innerHTML = `
                      <div class="bg-stone-900 border border-white/10 p-6 rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col gap-4">
                        <div class="flex justify-between items-center">
                          <h3 class="text-amber-500 font-bold uppercase tracking-widest text-sm">Diagnóstico do Banco</h3>
                          <button onclick="document.getElementById('debug-overlay').remove()" class="text-stone-500 hover:text-white">✕</button>
                        </div>
                        <p class="text-stone-400 text-xs">Copie o texto abaixo para suporte:</p>
                        <textarea readonly class="flex-grow bg-black/50 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-stone-300 focus:outline-none resize-none">${debugInfo}</textarea>
                        <button onclick="navigator.clipboard.writeText(\`${debugInfo.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`).then(() => alert('Copiado!'))" class="bg-white/5 hover:bg-white/10 text-white text-[10px] uppercase tracking-widest py-2 rounded-lg transition-colors">Copiar para Área de Transferência</button>
                        ${data.themesCount === 0 ? `
                          <button onclick="fetch('/api/admin/seed', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: '${password}' }) }).then(r => r.json()).then(d => alert(d.success ? 'Banco inicializado!' : 'Erro: ' + d.error))" class="bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 text-[10px] uppercase tracking-widest py-2 rounded-lg transition-colors">Inicializar Banco (Seed)</button>
                        ` : ''}
                        ${data.status === 'error' ? `
                          <div class="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                            <p class="text-amber-500 text-[10px] font-bold uppercase mb-1">Solução para o erro 42P05:</p>
                            <p class="text-stone-400 text-[10px] leading-relaxed">
                              Sua URL no Netlify deve terminar exatamente com:<br/>
                              <code class="text-white bg-black/30 px-1">?pgbouncer=true&statement_cache_size=0</code>
                            </p>
                          </div>
                        ` : ''}
                      </div>
                    `;
                    document.body.appendChild(overlay);
                  } catch (err) {
                    alert('Erro ao conectar com a API de Debug. Verifique se o deploy do Netlify foi concluído com sucesso.');
                  }
                }}
                className="w-full text-stone-500 text-[10px] uppercase tracking-widest hover:text-stone-300 transition-colors"
              >
                Verificar Conexão com Banco de Dados
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Users className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-white">Administração</h1>
                <p className="text-stone-500 text-sm uppercase tracking-widest">Relógio de Oração</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={exportCSV}
                className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-2 rounded-xl border border-white/5 transition-all text-sm font-bold"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
              
              {activeTab === 'reservations' && (
                <div className="flex items-center gap-2 bg-stone-800 p-2 rounded-2xl border border-white/5">
                  <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d); }} className="p-2 rounded-xl hover:bg-stone-700 text-stone-400 transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                  <span className="px-4 font-bold text-sm">{currentDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
                  <button onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d); }} className="p-2 rounded-xl hover:bg-stone-700 text-stone-400 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-white/5">
            <button 
              onClick={() => setActiveTab('reservations')}
              className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'reservations' ? 'border-amber-500 text-white' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
            >
              Reservas
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'settings' ? 'border-amber-500 text-white' : 'border-transparent text-stone-500 hover:text-stone-300'}`}
            >
              Configurações
            </button>
          </div>

          <div className="bg-stone-800/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="w-10 h-10 text-amber-500 animate-spin" /></div>
            ) : activeTab === 'reservations' ? (
              reservations.length === 0 ? (
                <div className="py-20 text-center"><p className="text-stone-500 uppercase tracking-widest text-sm">Nenhuma reserva para este dia.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-stone-800/50">
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">Horário</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">Intercessor</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">E-mail / Pedido</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500">Temas</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-stone-500 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {reservations.map((res) => (
                        <tr key={res.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4"><span className="font-serif font-bold text-amber-500">{res.timeStart}</span></td>
                          <td className="px-6 py-4">
                            {editingReservationId === res.id ? (
                              <input 
                                value={editingReservationData.name}
                                onChange={e => setEditingReservationData({ ...editingReservationData, name: e.target.value })}
                                className="bg-stone-900 border border-amber-500/30 rounded px-2 py-1 text-sm text-white w-full"
                              />
                            ) : (
                              <div className="font-bold text-white">{res.name}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {editingReservationId === res.id ? (
                              <div className="space-y-2">
                                <input 
                                  value={editingReservationData.email}
                                  onChange={e => setEditingReservationData({ ...editingReservationData, email: e.target.value })}
                                  className="bg-stone-900 border border-amber-500/30 rounded px-2 py-1 text-sm text-white w-full"
                                  placeholder="E-mail"
                                />
                                <textarea 
                                  value={editingReservationData.personalRequest || ''}
                                  onChange={e => setEditingReservationData({ ...editingReservationData, personalRequest: e.target.value })}
                                  className="bg-stone-900 border border-amber-500/30 rounded px-2 py-1 text-sm text-white w-full h-16 resize-none"
                                  placeholder="Pedido pessoal"
                                />
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-stone-400 text-sm">{res.email}</div>
                                {res.personalRequest && (
                                  <div className="text-[10px] text-amber-500/70 italic line-clamp-1">"{res.personalRequest}"</div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {JSON.parse(res.prayerThemes || '[]').map((theme: string, i: number) => (
                                <span key={i} className="text-[9px] bg-stone-700 text-stone-300 px-2 py-0.5 rounded-full uppercase font-bold">{theme}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              {editingReservationId === res.id ? (
                                <>
                                  <button onClick={updateReservation} className="p-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"><Save className="w-4 h-4" /></button>
                                  <button onClick={() => setEditingReservationId(null)} className="p-2 rounded-lg bg-stone-700 text-stone-400 hover:bg-stone-600 transition-all"><X className="w-4 h-4" /></button>
                                </>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => {
                                      setEditingReservationId(res.id);
                                      setEditingReservationData({
                                        name: res.name,
                                        email: res.email,
                                        prayerThemes: JSON.parse(res.prayerThemes || '[]'),
                                        personalRequest: res.personalRequest
                                      });
                                    }} 
                                    className="p-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-stone-950 transition-all"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  
                                  {confirmDeleteId === res.id ? (
                                    <div className="flex gap-1 animate-in fade-in slide-in-from-right-2">
                                      <button 
                                        onClick={() => cancelReservation(res.id)}
                                        className="px-3 py-2 rounded-lg bg-red-500 text-white text-[10px] font-bold uppercase tracking-tighter hover:bg-red-600 transition-all"
                                      >
                                        Confirmar?
                                      </button>
                                      <button 
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="p-2 rounded-lg bg-stone-700 text-stone-300 hover:bg-stone-600 transition-all"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => setConfirmDeleteId(res.id)} 
                                      className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="p-8 space-y-12">
                {/* Global Config */}
                <div>
                  <h3 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-500" />
                    Configurações Gerais
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-stone-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 block">Capacidade por Horário</label>
                      <div className="flex gap-2">
                        <input 
                          type="number"
                          defaultValue={configs.find(c => c.key === 'slot_capacity')?.value || '4'}
                          onBlur={(e) => saveConfig('slot_capacity', e.target.value)}
                          className="bg-stone-800 border border-white/5 rounded-xl px-4 py-2 text-white w-24 focus:outline-none focus:border-amber-500/50"
                        />
                        <span className="text-stone-500 text-xs flex items-center">intercessores por slot</span>
                      </div>
                    </div>

                    <div className="bg-stone-900/50 p-6 rounded-2xl border border-white/5 space-y-4 md:col-span-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 block">Palavra de Encorajamento (E-mail)</label>
                      <textarea 
                        defaultValue={configs.find(c => c.key === 'email_encouragement')?.value || ''}
                        onBlur={(e) => saveConfig('email_encouragement', e.target.value)}
                        placeholder="Texto que aparecerá no final do e-mail de confirmação..."
                        className="w-full bg-stone-800 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 h-32 resize-none"
                      />
                      <p className="text-[10px] text-stone-500 italic">Este texto será exibido no bloco "Palavra de Encorajamento" do e-mail.</p>
                    </div>

                    <div className="bg-stone-900/50 p-6 rounded-2xl border border-white/5 space-y-4">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-stone-500 block">Teste de E-mail</label>
                      <div className="flex gap-2">
                        <input 
                          id="test-email-input"
                          type="email"
                          placeholder="seu@email.com"
                          className="flex-1 bg-stone-800 border border-white/5 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                        />
                        <button 
                          disabled={testStatus?.type === 'loading'}
                          onClick={async () => {
                            const email = (document.getElementById('test-email-input') as HTMLInputElement).value;
                            if (!email) return setTestStatus({ type: 'error', message: 'Informe um e-mail para o teste.' });
                            
                            setTestStatus({ type: 'loading', message: 'Enviando...' });
                            try {
                              const res = await fetch('/api/admin/test-email', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email, password }),
                              });
                              const data = await res.json();
                              if (res.ok) {
                                setTestStatus({ type: 'success', message: 'E-mail de teste enviado com sucesso!' });
                              } else {
                                setTestStatus({ type: 'error', message: `Erro: ${data.error}` });
                              }
                            } catch (err) {
                              setTestStatus({ type: 'error', message: 'Erro ao conectar com o servidor.' });
                            }
                          }}
                          className="bg-amber-500/10 hover:bg-amber-500 hover:text-stone-950 text-amber-500 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-amber-500/20 disabled:opacity-50"
                        >
                          {testStatus?.type === 'loading' ? 'Enviando...' : 'Enviar Teste'}
                        </button>
                      </div>
                      {testStatus && testStatus.type !== 'loading' && (
                        <div className={`mt-2 p-3 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          testStatus.type === 'success' 
                            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}>
                          {testStatus.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Prayer Themes */}
                <div>
                  <h3 className="text-xl font-serif font-bold text-white mb-6 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    Temas de Oração (Pauta)
                  </h3>
                  
                  <div className="flex gap-2 mb-6">
                    <input 
                      value={newThemeLabel}
                      onChange={e => setNewThemeLabel(e.target.value)}
                      placeholder="Novo tema de oração..."
                      className="flex-1 bg-stone-900 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                    <button 
                      onClick={addTheme}
                      className="bg-amber-500 hover:bg-amber-600 text-stone-950 px-6 rounded-xl font-bold flex items-center gap-2 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Adicionar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themes.map(theme => (
                      <div key={theme.id} className={`p-4 rounded-2xl border transition-all flex justify-between items-center ${theme.active ? 'bg-stone-800/50 border-white/10' : 'bg-stone-900/30 border-white/5 opacity-60'}`}>
                        {editingThemeId === theme.id ? (
                          <div className="flex-1 flex gap-2 mr-2">
                            <input 
                              autoFocus
                              value={editingThemeLabel}
                              onChange={e => setEditingThemeLabel(e.target.value)}
                              className="flex-1 bg-stone-900 border border-amber-500/30 rounded-lg px-2 py-1 text-sm text-white focus:outline-none"
                            />
                            <button 
                              onClick={async () => {
                                try {
                                  const res = await fetch('/api/admin/themes', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ ...theme, label: editingThemeLabel, password }),
                                  });
                                  if (res.ok) {
                                    setEditingThemeId(null);
                                    fetchSettings();
                                  }
                                } catch (error) {
                                  console.error('Error updating theme:', error);
                                }
                              }}
                              className="p-1 text-green-500 hover:bg-green-500/10 rounded"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditingThemeId(null)}
                              className="p-1 text-stone-500 hover:bg-stone-700 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-bold text-sm">{theme.label}</span>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => {
                                  setEditingThemeId(theme.id);
                                  setEditingThemeLabel(theme.label);
                                }}
                                className="p-2 rounded-lg text-stone-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => toggleThemeStatus(theme)}
                                className={`p-2 rounded-lg transition-all ${theme.active ? 'text-green-500 hover:bg-green-500/10' : 'text-stone-500 hover:bg-stone-700'}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteTheme(theme.id)}
                                className="p-2 rounded-lg text-stone-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
