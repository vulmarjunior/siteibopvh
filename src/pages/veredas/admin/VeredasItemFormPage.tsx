import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabaseClient } from '../../../lib/veredas/supabaseClient';
import { BookOpen, Film, ArrowLeft, Save, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const VeredasItemFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<'LIVRO' | 'VIDEO'>('LIVRO');
  const [titulo, setTitulo] = useState('');
  const [resumo, setResumo] = useState('');
  const [porqueIndicamos, setPorqueIndicamos] = useState('');
  const [ressalvas, setRessalvas] = useState('');
  const [nivel, setNivel] = useState('INTRODUTORIO');
  const [status, setStatus] = useState('RASCUNHO');
  const [destaque, setDestaque] = useState(false);
  const [categoriaIds, setCategoriaIds] = useState<number[]>([]);
  const [categoriasList, setCategoriasList] = useState<any[]>([]);

  // Internal Book State
  const [bookData, setBookData] = useState({
    subtitulo: '',
    isbn10: '',
    isbn13: '',
    asin: '',
    editora: '',
    anoPublicacao: '',
    numeroPaginas: '',
    capaUrl: '',
    disponibilidade: 'DISPONIVEL',
  });

  // Internal Video State
  const [videoData, setVideoData] = useState({
    urlOriginal: '',
    youtubeId: '',
    canal: '',
    duracaoSegundos: '',
    thumbnailUrl: '',
    incorporavel: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/veredas/categorias')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategoriasList(data); });

    if (id) {
      const token = localStorage.getItem('veredas_access_token');
      fetch(`/api/veredas/admin/items/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then((r) => r.json())
        .then((item) => {
          if (item && !item.error) {
            setTipo(item.tipo);
            setTitulo(item.titulo);
            setResumo(item.resumo);
            setPorqueIndicamos(item.porqueIndicamos);
            setRessalvas(item.ressalvas || '');
            setNivel(item.nivel);
            setStatus(item.status);
            setDestaque(Boolean(item.destaque));
            if (item.categorias) {
              setCategoriaIds(item.categorias.map((c: any) => c.categoriaId));
            }
            if (item.livro) {
              setBookData({
                subtitulo: item.livro.subtitulo || '',
                isbn10: item.livro.isbn10 || '',
                isbn13: item.livro.isbn13 || '',
                asin: item.livro.asin || '',
                editora: item.livro.editora || '',
                anoPublicacao: item.livro.anoPublicacao ? String(item.livro.anoPublicacao) : '',
                numeroPaginas: item.livro.numeroPaginas ? String(item.livro.numeroPaginas) : '',
                capaUrl: item.livro.capaUrl || '',
                disponibilidade: item.livro.disponibilidade || 'DISPONIVEL',
              });
            }
            if (item.video) {
              setVideoData({
                urlOriginal: item.video.urlOriginal || '',
                youtubeId: item.video.youtubeId || '',
                canal: item.video.canal || '',
                duracaoSegundos: item.video.duracaoSegundos ? String(item.video.duracaoSegundos) : '',
                thumbnailUrl: item.video.thumbnailUrl || '',
                incorporavel: item.video.incorporavel !== undefined ? Boolean(item.video.incorporavel) : true,
              });
            }
          }
        });
    }
  }, [id]);

  const handleYoutubeParser = async () => {
    if (!videoData.urlOriginal) return;
    try {
      const token = localStorage.getItem('veredas_access_token') || (await supabaseClient.auth.getSession()).data.session?.access_token;
      const res = await fetch('/api/veredas/admin/importar/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: videoData.urlOriginal }),
      });
      const data = await res.json();
      if (data.youtubeId) {
        setVideoData((prev) => ({
          ...prev,
          youtubeId: data.youtubeId,
          thumbnailUrl: data.thumbnailUrl,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const token = localStorage.getItem('veredas_access_token') || (await supabaseClient.auth.getSession()).data.session?.access_token;
      if (!token) {
        navigate('/admin/veredas/login');
        return;
      }

      const payload = {
        tipo,
        titulo,
        resumo,
        porqueIndicamos,
        ressalvas: ressalvas || undefined,
        nivel,
        status,
        destaque,
        categoriaIds,
        livro: tipo === 'LIVRO' ? bookData : undefined,
        video: tipo === 'VIDEO' ? videoData : undefined,
      };

      const res = await fetch('/api/veredas/admin/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || (result.errors && result.errors[0]) || 'Erro ao salvar');
      }

      navigate('/admin/veredas');
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar conteúdo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans p-6 sm:p-8">
      <Helmet>
        <title>{isEditing ? 'Editar' : 'Novo'} Conteúdo — Veredas Admin</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-6">
        
        <Link to="/admin/veredas" className="inline-flex items-center gap-1 text-xs text-stone-400 hover:text-amber-400">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
        </Link>

        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <h1 className="font-serif text-2xl font-bold text-amber-100">
            {isEditing ? 'Editar Conteúdo' : 'Cadastrar Novo Conteúdo'}
          </h1>

          {/* Type selector */}
          {!isEditing && (
            <div className="flex gap-2 bg-stone-900 border border-stone-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setTipo('LIVRO')}
                className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 ${
                  tipo === 'LIVRO' ? 'bg-amber-600 text-stone-950' : 'text-stone-400'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Livro
              </button>
              <button
                type="button"
                onClick={() => setTipo('VIDEO')}
                className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 ${
                  tipo === 'VIDEO' ? 'bg-amber-600 text-stone-950' : 'text-stone-400'
                }`}
              >
                <Film className="w-3.5 h-3.5" /> Vídeo
              </button>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* BASE COMMON FIELDS */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
            <h2 className="font-serif font-bold text-sm text-stone-200 uppercase tracking-wider">
              1. Informações Básicas de Curadoria
            </h2>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Título Editorial <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: O Conhecimento de Deus"
                className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Nível de Profundidade <span className="text-amber-500">*</span>
                </label>
                <select
                  value={nivel}
                  onChange={(e) => setNivel(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="INTRODUTORIO">Introdutório</option>
                  <option value="INTERMEDIARIO">Intermediário</option>
                  <option value="APROFUNDAMENTO">Aprofundamento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">
                  Status de Publicação <span className="text-amber-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="RASCUNHO">Rascunho (Privado)</option>
                  <option value="PUBLICADO">Publicado (Visível na Web)</option>
                  <option value="ARQUIVADO">Arquivado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Por que indicamos? (Nota Pastoral) <span className="text-amber-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={porqueIndicamos}
                onChange={(e) => setPorqueIndicamos(e.target.value)}
                placeholder="Explique o motivo pastoral desta recomendação..."
                className="w-full bg-stone-950 border border-stone-700/80 rounded-lg p-3 text-xs text-stone-200 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Ressalvas ou Observações (Opcional)
              </label>
              <textarea
                rows={2}
                value={ressalvas}
                onChange={(e) => setRessalvas(e.target.value)}
                placeholder="Caso haja ressalvas teológicas ou doutrinárias secundárias..."
                className="w-full bg-stone-950 border border-stone-700/80 rounded-lg p-3 text-xs text-stone-200 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1">
                Resumo Geral <span className="text-amber-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={resumo}
                onChange={(e) => setResumo(e.target.value)}
                placeholder="Breve sinopse do conteúdo..."
                className="w-full bg-stone-950 border border-stone-700/80 rounded-lg p-3 text-xs text-stone-200 focus:outline-none focus:border-amber-500 resize-none"
              />
            </div>

            {/* Categorias */}
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2">
                Categorias Temáticas <span className="text-amber-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {categoriasList.map((cat) => {
                  const selected = categoriaIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setCategoriaIds((prev) =>
                          selected ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        selected
                          ? 'bg-amber-600 border-amber-500 text-stone-950 font-bold'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {cat.nome}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* INTERNAL FORM: BOOK OR VIDEO */}
          {tipo === 'LIVRO' ? (
            <BookFormInternal data={bookData} onChange={setBookData} />
          ) : (
            <VideoFormInternal data={videoData} onChange={setVideoData} onParseYoutube={handleYoutubeParser} />
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-lg transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Salvando...' : 'Salvar Conteúdo'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

/* Separate Internal Component for Book Form */
function BookFormInternal({ data, onChange }: { data: any; onChange: (d: any) => void }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
      <h2 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
        <BookOpen className="w-4 h-4" /> 2. Metadados do Livro
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">Subtítulo</label>
          <input
            type="text"
            value={data.subtitulo}
            onChange={(e) => onChange({ ...data, subtitulo: e.target.value })}
            className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">Editora</label>
          <input
            type="text"
            value={data.editora}
            onChange={(e) => onChange({ ...data, editora: e.target.value })}
            className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">Ano de Publicação</label>
          <input
            type="number"
            value={data.anoPublicacao}
            onChange={(e) => onChange({ ...data, anoPublicacao: e.target.value })}
            placeholder="Ex: 2024"
            className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">Páginas</label>
          <input
            type="number"
            value={data.numeroPaginas}
            onChange={(e) => onChange({ ...data, numeroPaginas: e.target.value })}
            placeholder="Ex: 320"
            className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">URL da Capa</label>
          <input
            type="url"
            value={data.capaUrl}
            onChange={(e) => onChange({ ...data, capaUrl: e.target.value })}
            placeholder="https://..."
            className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200"
          />
        </div>
      </div>
    </div>
  );
}

/* Separate Internal Component for Video Form */
function VideoFormInternal({ data, onChange, onParseYoutube }: { data: any; onChange: (d: any) => void; onParseYoutube: () => void }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
      <h2 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
        <Film className="w-4 h-4" /> 2. Metadados do Vídeo (YouTube)
      </h2>

      <div>
        <label className="block text-xs font-semibold text-stone-300 mb-1">
          URL Original do Vídeo <span className="text-amber-500">*</span>
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            required
            value={data.urlOriginal}
            onChange={(e) => onChange({ ...data, urlOriginal: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200"
          />
          <button
            type="button"
            onClick={onParseYoutube}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-lg border border-stone-700"
          >
            Detectar ID
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">ID do YouTube</label>
          <input
            type="text"
            value={data.youtubeId}
            onChange={(e) => onChange({ ...data, youtubeId: e.target.value })}
            placeholder="Ex: dQw4w9WgXcQ"
            className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-300 mb-1">Canal</label>
          <input
            type="text"
            value={data.canal}
            onChange={(e) => onChange({ ...data, canal: e.target.value })}
            placeholder="Ex: Igreja Batista Olaria"
            className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200"
          />
        </div>
      </div>
    </div>
  );
}
