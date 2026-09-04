import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  Church,
  Users,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Save,
  X,
  Calendar,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { Pastorate, HistoryItem } from '../../types/history';

export const AdminHistoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pastorates' | 'items'>('pastorates');

  // Estados de Pastorados
  const [pastorates, setPastorates] = useState<Pastorate[]>([]);
  const [loadingPastorates, setLoadingPastorates] = useState(true);
  const [editingPastorate, setEditingPastorate] = useState<Partial<Pastorate> | null>(null);

  // Estados de Itens do Acervo
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<HistoryItem> | null>(null);

  const [saving, setSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPastorates = async () => {
    try {
      setLoadingPastorates(true);
      const res = await fetch('/api/admin/history/pastorates');
      if (res.ok) {
        const data = await res.json();
        setPastorates(data.pastorates || []);
      }
    } catch (err) {
      console.error('Erro ao carregar pastorados:', err);
    } finally {
      setLoadingPastorates(false);
    }
  };

  const loadItems = async () => {
    try {
      setLoadingItems(true);
      const res = await fetch('/api/admin/history/items');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Erro ao carregar acervo:', err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    loadPastorates();
    loadItems();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleSavePastorate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPastorate?.pastorName || !editingPastorate?.startYear || !editingPastorate?.biography) {
      showNotification('Preencha o nome do pastor, ano de início e a biografia.', 'error');
      return;
    }

    try {
      setSaving(true);
      const isEditing = Boolean(editingPastorate.id);
      const endpoint = isEditing
        ? `/api/admin/history/pastorates/${editingPastorate.id}`
        : '/api/admin/history/pastorates';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPastorate),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao salvar pastorado');
      }

      showNotification(isEditing ? 'Pastorado atualizado com sucesso!' : 'Pastorado cadastrado com sucesso!');
      setEditingPastorate(null);
      await loadPastorates();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao processar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePastorate = async (id: string, name: string) => {
    if (!window.confirm(`Deseja realmente remover o registro do pastorado de "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/history/pastorates/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir pastorado');
      showNotification('Pastorado excluído com sucesso.');
      await loadPastorates();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao excluir', 'error');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.year || !editingItem?.title || !editingItem?.description) {
      showNotification('Preencha o ano, título e a descrição.', 'error');
      return;
    }

    try {
      setSaving(true);
      const isEditing = Boolean(editingItem.id);
      const endpoint = isEditing
        ? `/api/admin/history/items/${editingItem.id}`
        : '/api/admin/history/items';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Falha ao salvar item histórico');
      }

      showNotification(isEditing ? 'Item atualizado com sucesso!' : 'Item cadastrado com sucesso!');
      setEditingItem(null);
      await loadItems();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao processar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string, title: string) => {
    if (!window.confirm(`Deseja realmente remover o item histórico "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/history/items/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao excluir item');
      showNotification('Item excluído com sucesso.');
      await loadItems();
    } catch (err: any) {
      showNotification(err.message || 'Erro ao excluir', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 md:p-8">
      <Helmet>
        <title>Memorial & História IBO | Painel Administrativo</title>
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-6">
        <AdminPageHeader
          title="Memorial & História da IBO"
          description="Gestão dos pastorados, períodos ministeriais e do acervo documental da igreja desde 1959."
          icon={Church}
          actions={
            <div className="flex items-center gap-3">
              <Link
                to="/historia"
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800 text-xs font-semibold transition-colors"
              >
                <span>Ver Página Pública</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </Link>
            </div>
          }
        />

        {feedbackMessage && (
          <div
            className={`p-4 rounded-xl text-xs md:text-sm flex items-center gap-3 animate-fade-in ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/80 border border-rose-500/40 text-rose-200'
            }`}
          >
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
          <button
            onClick={() => setActiveTab('pastorates')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all ${
              activeTab === 'pastorates'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Pastorados & Liderança ({pastorates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all ${
              activeTab === 'items'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Acervo & Fotos Históricas ({items.length})</span>
          </button>
        </div>

        {activeTab === 'pastorates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Galeria de Pastorados</h3>
                <p className="text-xs text-stone-400">
                  Cadastre cada pastor que serviu à IBO, seus anos de ministério e principais legados.
                </p>
              </div>

              {!editingPastorate && (
                <button
                  onClick={() =>
                    setEditingPastorate({
                      role: 'Pastor Titular',
                      startYear: 1959,
                      active: true,
                      orderIndex: 0,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Pastorado</span>
                </button>
              )}
            </div>

            {editingPastorate && (
              <form
                onSubmit={handleSavePastorate}
                className="bg-stone-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in"
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <h4 className="font-serif font-bold text-base text-amber-300">
                    {editingPastorate.id ? 'Editar Pastorado' : 'Novo Pastorado da IBO'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingPastorate(null)}
                    className="p-1 rounded-lg text-stone-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Nome do Pastor / Líder *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Pr. Nome Completo"
                      value={editingPastorate.pastorName || ''}
                      onChange={(e) => setEditingPastorate({ ...editingPastorate, pastorName: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Cargo / Função
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Pastor Titular, Pastor Interino"
                      value={editingPastorate.role || ''}
                      onChange={(e) => setEditingPastorate({ ...editingPastorate, role: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Ano de Início *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="1959"
                      value={editingPastorate.startYear || ''}
                      onChange={(e) => setEditingPastorate({ ...editingPastorate, startYear: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Ano de Término (vazio para o atual)
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 1968"
                      value={editingPastorate.endYear || ''}
                      onChange={(e) =>
                        setEditingPastorate({
                          ...editingPastorate,
                          endYear: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      URL da Foto / Retrato Histórico (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="/images/pastores/nome.jpg ou URL externa"
                      value={editingPastorate.photoUrl || ''}
                      onChange={(e) => setEditingPastorate({ ...editingPastorate, photoUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Biografia / Síntese do Ministério *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Descreva o ministério do pastor, desafios enfrentados e a caminhada da igreja naquele tempo."
                      value={editingPastorate.biography || ''}
                      onChange={(e) => setEditingPastorate({ ...editingPastorate, biography: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Principais Legados e Marcos da Época
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Construção da nave do templo, primeiras congregações no interior, etc."
                      value={editingPastorate.keyMilestones || ''}
                      onChange={(e) => setEditingPastorate({ ...editingPastorate, keyMilestones: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPastorate.active !== false}
                        onChange={(e) => setEditingPastorate({ ...editingPastorate, active: e.target.checked })}
                        className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0"
                      />
                      <span>Visível na página pública</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setEditingPastorate(null)}
                    className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Salvando...' : 'Salvar Pastorado'}</span>
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {loadingPastorates ? (
                <div className="p-8 text-center text-xs text-stone-500">Carregando pastorados...</div>
              ) : pastorates.length > 0 ? (
                pastorates.map((p) => (
                  <div
                    key={p.id}
                    className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {p.photoUrl ? (
                        <img
                          src={p.photoUrl}
                          alt={p.pastorName}
                          className="w-12 h-12 rounded-full object-cover border border-amber-500/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center text-amber-400">
                          <Users className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{p.pastorName}</h4>
                          {!p.active && (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                              Oculto
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-amber-400 font-medium">{p.role}</span>
                        <span className="text-[11px] font-mono text-stone-400 ml-2">
                          ({p.startYear} – {p.endYear || 'Presente'})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <button
                        onClick={() => setEditingPastorate(p)}
                        className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-xs flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeletePastorate(p.id, p.pastorName)}
                        className="p-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 transition-colors text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-stone-900/40 rounded-xl border border-stone-800 text-stone-400 text-xs">
                  Nenhum pastorado cadastrado ainda. Clique em &quot;Novo Pastorado&quot; acima para registrar os pastores que fizeram história na IBO!
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Acervo & Fotos Históricas</h3>
                <p className="text-xs text-stone-400">
                  Cadastre fotografias de época, atas de fundação, inaugurações de templos e relatos orais.
                </p>
              </div>

              {!editingItem && (
                <button
                  onClick={() =>
                    setEditingItem({
                      year: 1959,
                      category: 'FUNDACAO',
                      active: true,
                      orderIndex: 0,
                    })
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Item Histórico</span>
                </button>
              )}
            </div>

            {editingItem && (
              <form
                onSubmit={handleSaveItem}
                className="bg-stone-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in"
              >
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <h4 className="font-serif font-bold text-base text-amber-300">
                    {editingItem.id ? 'Editar Item Histórico' : 'Novo Registro no Acervo IBO'}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="p-1 rounded-lg text-stone-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Ano do Acontecimento *
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="Ex: 1959"
                      value={editingItem.year || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, year: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Categoria
                    </label>
                    <select
                      value={editingItem.category || 'FUNDACAO'}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="FUNDACAO">Fundação & Origens</option>
                      <option value="TEMPLO">Construção & Templo</option>
                      <option value="MISSOES">Missões & Frentes Evangelísticas</option>
                      <option value="MINISTERIOS">Ministérios & Sociedades</option>
                      <option value="FOTOS_ANTIGAS">Fotografias Históricas</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Título do Registro *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Primeira Reunião de Oração na Rua Júlio de Castilho"
                      value={editingItem.title || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      URL da Imagem / Foto Digitalizada (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="/images/acervo/foto-1959.jpg ou endereço externo"
                      value={editingItem.imageUrl || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Descrição & Relato *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Conte a história, os nomes das pessoas na foto ou o conteúdo do documento histórico."
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 mb-1">
                      Fonte / Origem do Documento
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Livro de Atas nº 1, Acervo Família Pioneira"
                      value={editingItem.source || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, source: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-5">
                    <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingItem.active !== false}
                        onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
                        className="rounded bg-stone-950 border-stone-800 text-amber-500 focus:ring-0"
                      />
                      <span>Visível na página pública</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-lg bg-stone-800 text-stone-300 text-xs font-semibold hover:bg-stone-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Salvando...' : 'Salvar Item'}</span>
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingItems ? (
                <div className="col-span-2 p-8 text-center text-xs text-stone-500">
                  Carregando acervo histórico...
                </div>
              ) : items.length > 0 ? (
                items.map((it) => (
                  <div
                    key={it.id}
                    className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-amber-400 font-mono mb-2">
                        <span>Ano: {it.year}</span>
                        <span className="text-[10px] text-stone-400 uppercase bg-stone-800 px-2 py-0.5 rounded">
                          {it.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-1">{it.title}</h4>
                      <p className="text-xs text-stone-300 line-clamp-3 leading-relaxed">
                        {it.description}
                      </p>
                      {it.source && (
                        <span className="block text-[10px] text-stone-400 italic mt-2">
                          Fonte: {it.source}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-stone-800">
                      <button
                        onClick={() => setEditingItem(it)}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors text-xs flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteItem(it.id, it.title)}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 transition-colors text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-8 text-center bg-stone-900/40 rounded-xl border border-stone-800 text-stone-400 text-xs">
                  Nenhum registro histórico cadastrado ainda. Clique em &quot;Novo Item Histórico&quot; para registrar os primeiros documentos e fotos da igreja!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHistoryPage;
