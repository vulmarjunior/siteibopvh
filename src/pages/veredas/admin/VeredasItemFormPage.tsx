import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { BookOpen, Film, GraduationCap, Plus, Trash2, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { BookAccessFields, BookAccessFormData, createEmptyBookAccess } from '../../../components/veredas/BookAccessFields';
import { parseYoutubePlaylistUrl, parseYoutubeUrl } from '../../../lib/veredas/youtube';

type CourseLessonFormData = {
  key: string;
  titulo: string;
  urlOriginal: string;
  youtubeId: string;
  thumbnailUrl: string;
};

type CourseMaterialFormData = { key: string; titulo: string; url: string };

export const VeredasItemFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFreeLibraryPreset = !isEditing && searchParams.get('biblioteca') === 'gratuita';

  const [tipo, setTipo] = useState<'LIVRO' | 'VIDEO' | 'CURSO'>('LIVRO');
  const [titulo, setTitulo] = useState('');
  const [porqueIndicamos, setPorqueIndicamos] = useState('');
  const [ressalvas, setRessalvas] = useState('');
  const [nivel, setNivel] = useState('INTRODUTORIO');
  const [status, setStatus] = useState('RASCUNHO');
  const [destaque, setDestaque] = useState(false);
  const [categoriaIds, setCategoriaIds] = useState<number[]>([]);
  const [categoriasList, setCategoriasList] = useState<any[]>([]);
  const [newTheme, setNewTheme] = useState('');
  const [creatingTheme, setCreatingTheme] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

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
  const [bookAccesses, setBookAccesses] = useState<BookAccessFormData[]>([]);


  // Internal Video State
  const [videoData, setVideoData] = useState({
    urlOriginal: '',
    youtubeId: '',
    canal: '',
    duracaoSegundos: '',
    thumbnailUrl: '',
    incorporavel: true,
  });

  const [courseData, setCourseData] = useState({
    urlOriginal: '', playlistId: '', canal: '', thumbnailUrl: '',
    aulas: [] as CourseLessonFormData[], materiais: [] as CourseMaterialFormData[],
  });

  const [loading, setLoading] = useState(false);
  const [bookLookupLoading, setBookLookupLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/veredas/categorias')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategoriasList(data); });

    if (id) {
      fetch(`/api/veredas/admin/items/${id}`)
        .then((r) => r.json())
        .then((item) => {
          if (item && !item.error) {
            setTipo(item.tipo);
            setTitulo(item.titulo);
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
              setBookAccesses((item.livro.acessos || []).map((access: any, index: number) => ({
                key: `access-${access.id || index}`,
                tipo: access.tipo || 'COMPRA',
                formato: access.formato || 'IMPRESSO',
                provedor: access.provedor || 'OUTRO',
                fornecedor: access.fornecedor || '',
                url: access.url || '',
                textoBotao: access.textoBotao || 'Acessar',
                gratuito: Boolean(access.gratuito),
                linkAssociado: Boolean(access.linkAssociado),
                producaoIbo: Boolean(access.producaoIbo),
                ativo: access.ativo !== false,
                ordem: access.ordem ?? index,
                observacaoPublica: access.observacaoPublica || '',
                fonte: access.fonte || '',
                affiliateTag: '',
              })));
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
            if (item.curso) {
              setCourseData({
                urlOriginal: item.curso.urlOriginal || '',
                playlistId: item.curso.playlistId || '',
                canal: item.curso.canal || '',
                thumbnailUrl: item.curso.thumbnailUrl || '',
                aulas: (item.curso.aulas || []).map((aula: any, index: number) => ({
                  key: `lesson-${aula.id || index}`,
                  titulo: aula.titulo || '',
                  urlOriginal: aula.urlOriginal || '',
                  youtubeId: aula.youtubeId || '',
                  thumbnailUrl: aula.thumbnailUrl || '',
                })),
                materiais: (item.curso.materiais || []).map((material: any, index: number) => ({
                  key: `material-${material.id || index}`, titulo: material.titulo || '', url: material.url || '',
                })),
              });
            }
          }
        });
    }
  }, [id]);

  useEffect(() => {
    if (!isFreeLibraryPreset || bookAccesses.length > 0) return;
    setTipo('LIVRO');
    setBookAccesses([{ ...createEmptyBookAccess(0), tipo: 'LEITURA_ONLINE', formato: 'WEB', gratuito: true, textoBotao: 'Acessar gratuitamente' }]);
  }, [isFreeLibraryPreset, bookAccesses.length]);

  const handleYoutubeParser = async () => {
    if (!videoData.urlOriginal) return;
    try {
      const res = await fetch('/api/veredas/admin/importar/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoData.urlOriginal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Não foi possível ler o vídeo');
      if (data.youtubeId) {
        setVideoData((prev) => ({
          ...prev,
          youtubeId: data.youtubeId,
          canal: data.channel || prev.canal,
          thumbnailUrl: data.thumbnailUrl,
        }));
        setTitulo((current) => current || data.title || '');
        setSuccessMsg('Dados do vídeo preenchidos automaticamente.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao consultar o vídeo');
    }
  };

  const handleAmazonParser = async (index: number) => {
    const access = bookAccesses[index];
    if (!access?.url) return;

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/veredas/admin/importar/amazon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: access.url, affiliateTag: access.affiliateTag || undefined }),
      });
      const parsed = await res.json();
      if (!res.ok) throw new Error(parsed.error || 'Link da Amazon invalido');

      setBookAccesses((current) =>
        current.map((item, currentIndex) =>
          currentIndex === index
            ? {
                ...item,
                url: parsed.canonicalUrl || item.url,
                linkAssociado: Boolean(item.affiliateTag) || /[?&]tag=/.test(parsed.canonicalUrl || item.url) || item.linkAssociado,
                fornecedor: item.fornecedor || 'Amazon',
              }
            : item
        )
      );
      if (parsed.asin) {
        setBookData((current) => ({ ...current, asin: parsed.asin }));

        if (/^\d{9}[\dX]$/.test(parsed.asin)) {
          const metadataResponse = await fetch('/api/veredas/admin/importar/isbn', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isbn: parsed.asin }),
          });
          const metadataResult = await metadataResponse.json();
          if (metadataResponse.ok && metadataResult.metadata) {
            const metadata = metadataResult.metadata;
            setTitulo((current) => current || metadata.title || '');
            setBookData((current) => ({
              ...current,
              asin: parsed.asin,
              subtitulo: current.subtitulo || metadata.subtitle || '',
              isbn10: current.isbn10 || metadata.isbn10 || parsed.asin,
              isbn13: current.isbn13 || metadata.isbn13 || '',
              editora: current.editora || metadata.publisher || '',
              anoPublicacao: current.anoPublicacao || (metadata.publishedYear ? String(metadata.publishedYear) : ''),
              numeroPaginas: current.numeroPaginas || (metadata.pageCount ? String(metadata.pageCount) : ''),
              capaUrl: metadata.coverUrl || current.capaUrl,
            }));
            setSuccessMsg('Link Amazon validado e dados bibliograficos preenchidos.');
          }
        }

        setSuccessMsg((current) => current || ('Link Amazon validado. ASIN ' + parsed.asin + ' identificado.'));
      } else {
        setSuccessMsg('Link Amazon validado com sucesso.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao validar link da Amazon');
    }
  };

  const handleIsbnLookup = async () => {
    const isbn = bookData.isbn13 || bookData.isbn10;
    if (!isbn) {
      setErrorMsg('Informe o ISBN-13 ou ISBN-10 antes de buscar');
      return;
    }

    setBookLookupLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/veredas/admin/importar/isbn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isbn }),
      });
      const result = await res.json();
      if (!res.ok || !result.metadata) throw new Error(result.error || 'Livro nao encontrado');

      const metadata = result.metadata;
      setTitulo((current) => current || metadata.title || '');
      setBookData((current) => ({
        ...current,
        subtitulo: current.subtitulo || metadata.subtitle || '',
        isbn10: current.isbn10 || metadata.isbn10 || '',
        isbn13: current.isbn13 || metadata.isbn13 || '',
        editora: current.editora || metadata.publisher || '',
        anoPublicacao: current.anoPublicacao || (metadata.publishedYear ? String(metadata.publishedYear) : ''),
        numeroPaginas: current.numeroPaginas || (metadata.pageCount ? String(metadata.pageCount) : ''),
        capaUrl: metadata.coverUrl || current.capaUrl,
      }));
      setSuccessMsg(
        metadata.coverUrl
          ? 'Dados do livro e capa preenchidos com sucesso.'
          : 'Dados do livro preenchidos. Nenhuma capa foi encontrada para esta edicao.',
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao buscar dados do livro');
    } finally {
      setBookLookupLoading(false);
    }
  };
  const handleCreateTheme = async () => {
    const nome = newTheme.trim();
    if (!nome) return;

    setCreatingTheme(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/veredas/admin/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome }),
      });
      const categoria = await response.json();
      if (!response.ok) throw new Error(categoria.error || 'Falha ao criar tema');

      setCategoriasList((current) =>
        current.some((item) => item.id === categoria.id) ? current : [...current, categoria],
      );
      setCategoriaIds((current) => current.includes(categoria.id) ? current : [...current, categoria.id]);
      setNewTheme('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao criar tema');
    } finally {
      setCreatingTheme(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        tipo,
        titulo,
        resumo: porqueIndicamos,
        porqueIndicamos,
        ressalvas: ressalvas || undefined,
        nivel,
        status,
        destaque,
        categoriaIds,
        livro: tipo === 'LIVRO' ? { ...bookData, acessos: bookAccesses } : undefined,
        video: tipo === 'VIDEO' ? videoData : undefined,
        curso: tipo === 'CURSO' ? courseData : undefined,
      };

      const endpoint = isEditing ? `/api/veredas/admin/items/${id}` : '/api/veredas/admin/items';
      const res = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
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
              <button
                type="button"
                onClick={() => setTipo('CURSO')}
                className={`px-4 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 ${
                  tipo === 'CURSO' ? 'bg-amber-600 text-stone-950' : 'text-stone-400'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Curso/Playlist
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
        {successMsg && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs rounded-lg">
            {successMsg}
          </div>
        )}
        {isFreeLibraryPreset ? (
          <div className="p-4 bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs rounded-lg">
            <strong className="block mb-1">Cadastro para a Biblioteca Gratuita</strong>
            Cadastre o livro normalmente e informe abaixo o endereço legítimo de acesso gratuito. Ao publicar, ele aparecerá automaticamente na Biblioteca Gratuita.
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* BASE COMMON FIELDS */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-5">
            <h2 className="font-serif font-bold text-sm text-stone-200 uppercase tracking-wider">
              Informações da recomendação
            </h2>

            <label className="block text-xs font-semibold text-stone-300">
              Título <span className="text-amber-500">*</span>
              <input
                type="text"
                required
                value={titulo}
                onChange={(event) => setTitulo(event.target.value)}
                placeholder={tipo === 'LIVRO' ? 'Título do livro' : tipo === 'VIDEO' ? 'Preenchido pelo link do YouTube' : 'Título do curso'}
                className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </label>

            <label className="block text-xs font-semibold text-stone-300">
              Por que indicamos? <span className="text-amber-500">*</span>
              <textarea
                required
                rows={4}
                value={porqueIndicamos}
                onChange={(event) => setPorqueIndicamos(event.target.value)}
                placeholder="Explique de forma pastoral por que este conteúdo é recomendado..."
                className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg p-3 text-xs text-stone-200 focus:outline-none focus:border-amber-500 resize-y"
              />
            </label>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-2">
                Temas <span className="text-amber-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {categoriasList.map((category) => {
                  const selected = categoriaIds.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setCategoriaIds((current) =>
                        selected ? current.filter((categoryId) => categoryId !== category.id) : [...current, category.id]
                      )}
                      className={'px-3 py-1 rounded-full text-xs font-medium border transition-colors ' + (
                        selected
                          ? 'bg-amber-600 border-amber-500 text-stone-950 font-bold'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                      )}
                    >
                      {category.nome}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={newTheme}
                  onChange={(event) => setNewTheme(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      void handleCreateTheme();
                    }
                  }}
                  placeholder="Criar novo tema"
                  className="flex-1 bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200"
                />
                <button
                  type="button"
                  onClick={() => void handleCreateTheme()}
                  disabled={creatingTheme || newTheme.trim().length < 2}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-amber-300 font-bold text-xs rounded-lg border border-stone-700"
                >
                  {creatingTheme ? 'Criando...' : 'Adicionar tema'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block text-xs font-semibold text-stone-300">
                Nível de profundidade <span className="text-amber-500">*</span>
                <select value={nivel} onChange={(event) => setNivel(event.target.value)} className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200">
                  <option value="INTRODUTORIO">Introdutório</option>
                  <option value="INTERMEDIARIO">Intermediário</option>
                  <option value="APROFUNDAMENTO">Aprofundamento</option>
                </select>
                <span className="mt-1 block text-[11px] font-normal text-stone-500">Escolha o nível adequado para o leitor, mesmo em conteúdos gratuitos.</span>
              </label>
              <label className="block text-xs font-semibold text-stone-300">
                Status
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200">
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="PUBLICADO">Publicado</option>
                  <option value="ARQUIVADO">Arquivado</option>
                </select>
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced((current) => !current)}
              className="text-xs font-semibold text-stone-400 hover:text-amber-400"
            >
              {showAdvanced ? 'Ocultar opções avançadas' : 'Mostrar opções avançadas'}
            </button>

            {showAdvanced ? (
              <div className="border-t border-stone-800 pt-4 space-y-4">
                <label className="block text-xs font-semibold text-stone-300">
                  Ressalvas pastorais
                  <textarea
                    rows={2}
                    value={ressalvas}
                    onChange={(event) => setRessalvas(event.target.value)}
                    className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg p-3 text-xs text-stone-200"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs text-stone-300">
                  <input type="checkbox" checked={destaque} onChange={(event) => setDestaque(event.target.checked)} />
                  Destacar na página inicial
                </label>
              </div>
            ) : null}
          </div>
          {/* INTERNAL FORM: BOOK OR VIDEO */}
          {tipo === 'LIVRO' ? (
            <>
              <BookFormInternal
                data={bookData}
                onChange={setBookData}
                onLookupIsbn={handleIsbnLookup}
                lookupLoading={bookLookupLoading}
                showAdvanced={showAdvanced}
              />
              <BookAccessFields
                accesses={bookAccesses}
                onChange={setBookAccesses}
                onNormalizeAmazon={handleAmazonParser}
              />
            </>
          ) : tipo === 'VIDEO' ? (
            <VideoFormInternal data={videoData} onChange={setVideoData} onParseYoutube={handleYoutubeParser} />
          ) : (
            <CourseFormInternal data={courseData} onChange={setCourseData} setTitle={setTitulo} />
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
function BookFormInternal({
  data,
  onChange,
  onLookupIsbn,
  lookupLoading,
  showAdvanced,
}: {
  data: any;
  onChange: (data: any) => void;
  onLookupIsbn: () => void;
  lookupLoading: boolean;
  showAdvanced: boolean;
}) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
      <h2 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
        <BookOpen className="w-4 h-4" /> Livro
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
        <label className="text-xs font-semibold text-stone-300">
          ISBN
          <input
            type="text"
            inputMode="numeric"
            value={data.isbn13 || data.isbn10}
            onChange={(event) => {
              const value = event.target.value;
              onChange({ ...data, isbn13: value.replace(/\D/g, '').length > 10 ? value : '', isbn10: value.replace(/[^0-9X]/gi, '').length <= 10 ? value : '' });
            }}
            placeholder="ISBN-13 ou ISBN-10"
            className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200"
          />
        </label>
        <button
          type="button"
          onClick={onLookupIsbn}
          disabled={lookupLoading || (!data.isbn13 && !data.isbn10)}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-50 text-amber-300 font-bold text-xs rounded-lg border border-stone-700"
        >
          {lookupLoading ? 'Buscando...' : 'Buscar dados e capa'}
        </button>
      </div>

      <label className="block text-xs font-semibold text-stone-300">
        Link da capa <span className="font-normal text-stone-500">(opcional)</span>
        <input
          type="url"
          value={data.capaUrl}
          onChange={(event) => onChange({ ...data, capaUrl: event.target.value })}
          placeholder="Cole aqui o link da imagem quando a busca não encontrar a capa"
          className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200"
        />
        <span className="mt-1 block text-[11px] font-normal text-stone-500">
          Se a busca por ISBN não encontrar a capa, cole o endereço da imagem neste campo.
        </span>
      </label>
      {data.capaUrl ? (
        <div className="flex items-start gap-3 rounded-lg border border-stone-800 bg-stone-950 p-3">
          <img
            src={data.capaUrl}
            alt="Prévia da capa do livro"
            className="w-20 aspect-[2/3] object-cover rounded border border-stone-700"
          />
          <div className="text-xs text-stone-400">
            <p className="font-semibold text-stone-200">{data.subtitulo || data.editora || 'Capa encontrada'}</p>
            <p className="mt-1">Os dados permanecem editáveis nas opções avançadas.</p>
          </div>
        </div>
      ) : null}

      {showAdvanced ? (
        <div className="border-t border-stone-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="text-xs text-stone-300">
            Subtítulo
            <input value={data.subtitulo} onChange={(event) => onChange({ ...data, subtitulo: event.target.value })} className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs" />
          </label>
          <label className="text-xs text-stone-300">
            Editora
            <input value={data.editora} onChange={(event) => onChange({ ...data, editora: event.target.value })} className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs" />
          </label>
          <label className="text-xs text-stone-300">
            Ano
            <input type="number" value={data.anoPublicacao} onChange={(event) => onChange({ ...data, anoPublicacao: event.target.value })} className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs" />
          </label>
          <label className="text-xs text-stone-300">
            Páginas
            <input type="number" value={data.numeroPaginas} onChange={(event) => onChange({ ...data, numeroPaginas: event.target.value })} className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs" />
          </label>
          <label className="text-xs text-stone-300">
            ASIN Amazon
            <input value={data.asin} onChange={(event) => onChange({ ...data, asin: event.target.value })} className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs" />
          </label>
        </div>
      ) : null}
    </div>
  );
}

function VideoFormInternal({
  data,
  onChange,
  onParseYoutube,
}: {
  data: any;
  onChange: (data: any) => void;
  onParseYoutube: () => void;
}) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-4">
      <h2 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2">
        <Film className="w-4 h-4" /> Vídeo
      </h2>

      <label className="block text-xs font-semibold text-stone-300">
        Link do YouTube <span className="text-amber-500">*</span>
        <input
          type="url"
          required
          value={data.urlOriginal}
          onChange={(event) => onChange({ ...data, urlOriginal: event.target.value })}
          onBlur={() => void onParseYoutube()}
          placeholder="https://www.youtube.com/watch?v=..."
          className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs text-stone-200"
        />
      </label>

      {data.thumbnailUrl ? (
        <div className="flex items-center gap-3 rounded-lg border border-stone-800 bg-stone-950 p-3">
          <img src={data.thumbnailUrl} alt="Prévia do vídeo" className="w-32 aspect-video object-cover rounded" />
          <div className="text-xs text-stone-400">
            <p className="font-semibold text-stone-200">{data.canal || 'YouTube'}</p>
            <p className="mt-1">Título, canal e miniatura foram identificados automaticamente.</p>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-stone-500">Ao sair do campo, título, canal e miniatura serão preenchidos automaticamente.</p>
      )}

      <label className="flex items-start gap-3 rounded-lg border border-stone-800 bg-stone-950 p-3 text-xs text-stone-300">
        <input
          type="checkbox"
          checked={Boolean(data.incorporavel)}
          onChange={(event) => onChange({ ...data, incorporavel: event.target.checked })}
          className="mt-0.5 h-4 w-4 accent-amber-500"
        />
        <span>
          <strong className="block text-stone-200">Reproduzir dentro do Veredas</strong>
          Desative somente quando o YouTube bloquear a incorporação. Vídeos antigos podem precisar desta opção reativada manualmente.
        </span>
      </label>
    </div>
  );
}

function CourseFormInternal({ data, onChange, setTitle }: {
  data: { urlOriginal: string; playlistId: string; canal: string; thumbnailUrl: string; aulas: CourseLessonFormData[]; materiais: CourseMaterialFormData[] };
  onChange: React.Dispatch<React.SetStateAction<typeof data>>;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
}) {
  const updateLesson = (index: number, patch: Partial<CourseLessonFormData>) => {
    onChange((current) => ({ ...current, aulas: current.aulas.map((aula, i) => i === index ? { ...aula, ...patch } : aula) }));
  };

  const readLesson = async (index: number) => {
    const lesson = data.aulas[index];
    if (!lesson?.urlOriginal) return;
    try {
      const response = await fetch('/api/veredas/admin/importar/youtube', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: lesson.urlOriginal }),
      });
      const result = await response.json();
      if (!response.ok) return;
      updateLesson(index, { titulo: lesson.titulo || result.title || '', youtubeId: result.youtubeId || lesson.youtubeId, thumbnailUrl: result.thumbnailUrl || lesson.thumbnailUrl });
      onChange((current) => ({ ...current, canal: current.canal || result.channel || '', thumbnailUrl: current.thumbnailUrl || result.thumbnailUrl || '' }));
      if (index === 0) setTitle((current) => current || result.title || '');
    } catch { /* os campos permanecem editáveis */ }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-5">
      <div>
        <h2 className="font-serif font-bold text-sm text-amber-400 uppercase tracking-wider flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Curso/Playlist</h2>
        <p className="mt-2 text-xs text-stone-400">Cadastre a playlist como curso e organize abaixo cada vídeo como uma aula.</p>
      </div>
      <label className="block text-xs font-semibold text-stone-300">Link da playlist <span className="text-amber-500">*</span>
        <input type="url" required value={data.urlOriginal} onChange={(event) => {
          const parsed = parseYoutubePlaylistUrl(event.target.value);
          onChange((current) => ({ ...current, urlOriginal: event.target.value, playlistId: parsed?.playlistId || '' }));
        }} placeholder="https://www.youtube.com/playlist?list=..." className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs" />
        {data.playlistId ? <span className="mt-1 block text-[11px] text-emerald-400">Playlist identificada: {data.playlistId}</span> : null}
      </label>
      <label className="block text-xs font-semibold text-stone-300">Canal <span className="font-normal text-stone-500">(opcional)</span>
        <input value={data.canal} onChange={(event) => onChange((current) => ({ ...current, canal: event.target.value }))} className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs" />
      </label>
      <div className="flex items-center justify-between border-t border-stone-800 pt-5">
        <div><h3 className="text-sm font-bold text-stone-200">Aulas</h3><p className="text-[11px] text-stone-500">A ordem abaixo será a ordem de navegação do aluno.</p></div>
        <button type="button" onClick={() => onChange((current) => ({ ...current, aulas: [...current.aulas, { key: crypto.randomUUID(), titulo: '', urlOriginal: '', youtubeId: '', thumbnailUrl: '' }] }))} className="px-3 py-2 bg-amber-600 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> Adicionar aula</button>
      </div>
      {data.aulas.length === 0 ? <p className="rounded-lg border border-dashed border-stone-700 p-5 text-center text-xs text-stone-500">Adicione ao menos uma aula.</p> : null}
      <div className="space-y-3">
        {data.aulas.map((aula, index) => (
          <div key={aula.key} className="rounded-xl border border-stone-800 bg-stone-950 p-4 space-y-3">
            <div className="flex items-center justify-between"><strong className="text-xs text-amber-300">Aula {index + 1}</strong><button type="button" aria-label={`Remover aula ${index + 1}`} onClick={() => onChange((current) => ({ ...current, aulas: current.aulas.filter((_, i) => i !== index) }))} className="text-stone-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></div>
            <input type="url" required value={aula.urlOriginal} onChange={(event) => { const parsed = parseYoutubeUrl(event.target.value); updateLesson(index, { urlOriginal: event.target.value, youtubeId: parsed.youtubeId || '', thumbnailUrl: parsed.thumbnailUrl || '' }); }} onBlur={() => void readLesson(index)} placeholder="Link do vídeo desta aula" className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs" />
            <input required value={aula.titulo} onChange={(event) => updateLesson(index, { titulo: event.target.value })} placeholder="Título da aula" className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-stone-800 pt-5">
        <div><h3 className="text-sm font-bold text-stone-200">Materiais complementares</h3><p className="text-[11px] text-stone-500">Somente links externos; nenhum arquivo será armazenado.</p></div>
        <button type="button" onClick={() => onChange((current) => ({ ...current, materiais: [...current.materiais, { key: crypto.randomUUID(), titulo: '', url: '' }] }))} className="px-3 py-2 bg-stone-800 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> Adicionar link</button>
      </div>
      <div className="space-y-3">
        {data.materiais.map((material, index) => (
          <div key={material.key} className="grid sm:grid-cols-[1fr_1.5fr_auto] gap-2 rounded-xl border border-stone-800 bg-stone-950 p-4">
            <input required value={material.titulo} onChange={(event) => onChange((current) => ({ ...current, materiais: current.materiais.map((item, i) => i === index ? { ...item, titulo: event.target.value } : item) }))} placeholder="Nome do material" className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs" />
            <input type="url" required value={material.url} onChange={(event) => onChange((current) => ({ ...current, materiais: current.materiais.map((item, i) => i === index ? { ...item, url: event.target.value } : item) }))} placeholder="https://..." className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs" />
            <button type="button" aria-label={`Remover material ${index + 1}`} onClick={() => onChange((current) => ({ ...current, materiais: current.materiais.filter((_, i) => i !== index) }))} className="p-2 text-stone-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
