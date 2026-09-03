import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { BookOpen, Film, GraduationCap, Flame, Plus, Trash2, ArrowLeft, ArrowUp, ArrowDown, Save, AlertCircle, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { BookAccessFields, BookAccessFormData, createEmptyBookAccess } from '../../../components/veredas/BookAccessFields';
import { parseYoutubePlaylistUrl, parseYoutubeUrl } from '../../../lib/veredas/youtube';
import { getStoredAdminUser } from '../../../lib/admin/session';
import { PeopleSelector } from '../../../components/veredas/admin/PeopleSelector';
import { CrossReferencesEditor, CrossReferenceEntry } from '../../../components/veredas/admin/CrossReferencesEditor';

type CourseLessonFormData = {
  key: string;
  titulo: string;
  urlOriginal: string;
  youtubeId: string;
  thumbnailUrl: string;
};

type CourseMaterialFormData = { key: string; titulo: string; url: string };

const isMostlyUppercase = (value: string) => {
  const letters = value.match(/\p{L}/gu) || [];
  if (letters.length < 30) return false;
  const uppercaseLetters = letters.filter((letter) => letter === letter.toLocaleUpperCase('pt-BR')).length;
  return uppercaseLetters / letters.length > 0.85;
};

type VeredasItemDraft = {
  version: 1;
  savedAt: string;
  tipo: 'LIVRO' | 'VIDEO' | 'CURSO' | 'CONFERENCIA';
  titulo: string;
  descricao?: string;
  authorNames?: string[];
  porqueIndicamos: string;
  ressalvas: string;
  nivel: string;
  status: string;
  destaque: boolean;
  categoriaIds: number[];
  itensRelacionados?: CrossReferenceEntry[];
  bookData: {
    subtitulo: string; isbn10: string; isbn13: string; asin: string; editora: string;
    anoPublicacao: string; numeroPaginas: string; capaUrl: string; disponibilidade: string;
  };
  bookAccesses: BookAccessFormData[];
  videoData: {
    urlOriginal: string; youtubeId: string; canal: string; duracaoSegundos: string;
    thumbnailUrl: string; incorporavel: boolean;
  };
  courseData: {
    urlOriginal: string; playlistId: string; canal: string; thumbnailUrl: string;
    aulas: CourseLessonFormData[]; materiais: CourseMaterialFormData[];
  };
};

function draftStorageKey(id: string | undefined, freeLibraryPreset: boolean): string {
  const userId = getStoredAdminUser()?.id || 'admin';
  const itemKey = id ? `edit-${id}` : freeLibraryPreset ? 'new-free-library' : 'new';
  return `ibo:veredas:item-draft:v1:${userId}:${itemKey}`;
}

export const VeredasItemFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFreeLibraryPreset = !isEditing && searchParams.get('biblioteca') === 'gratuita';

  const [tipo, setTipo] = useState<'LIVRO' | 'VIDEO' | 'CURSO' | 'CONFERENCIA'>('LIVRO');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [authorNames, setAuthorNames] = useState<string[]>([]);
  const [suggestedSpeakers, setSuggestedSpeakers] = useState<string[]>([]);
  const [itensRelacionados, setItensRelacionados] = useState<CrossReferenceEntry[]>([]);
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
  const [draftReady, setDraftReady] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const draftKey = draftStorageKey(id, isFreeLibraryPreset);

  useEffect(() => {
    fetch('/api/veredas/categorias')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCategoriasList(data); });

    const restoreDraft = () => {
      try {
        const stored = localStorage.getItem(draftKey);
        if (!stored) return;
        const draft = JSON.parse(stored) as VeredasItemDraft;
        if (draft.version !== 1) return;
        setTipo(draft.tipo);
        setTitulo(draft.titulo);
        setDescricao(draft.descricao || '');
        if (draft.authorNames) setAuthorNames(draft.authorNames);
        if (draft.itensRelacionados) setItensRelacionados(draft.itensRelacionados);
        setPorqueIndicamos(draft.porqueIndicamos);
        setRessalvas(draft.ressalvas);
        setNivel(draft.nivel);
        setStatus(draft.status);
        setDestaque(draft.destaque);
        setCategoriaIds(draft.categoriaIds);
        setBookData(draft.bookData);
        setBookAccesses(draft.bookAccesses);
        setVideoData(draft.videoData);
        setCourseData(draft.courseData);
        setDraftSavedAt(draft.savedAt);
        setSuccessMsg('Seu rascunho anterior foi restaurado automaticamente.');
      } catch {
        localStorage.removeItem(draftKey);
      }
    };

    if (id) {
      fetch(`/api/veredas/admin/items/${id}`)
        .then((r) => r.json())
        .then((item) => {
          if (item && !item.error) {
            setTipo(item.tipo);
            setTitulo(item.titulo);
            setDescricao(item.descricao || '');
            setPorqueIndicamos(item.porqueIndicamos);
            setRessalvas(item.ressalvas || '');
            setNivel(item.nivel);
            setStatus(item.status);
            setDestaque(Boolean(item.destaque));
            if (item.categorias) {
              setCategoriaIds(item.categorias.map((c: any) => c.categoriaId));
            }
            if (item.relacionadosOrigem) {
              setItensRelacionados(
                item.relacionadosOrigem.map((rel: any) => ({
                  destinoId: rel.destinoId,
                  rotulo: rel.rotulo || '',
                  item: rel.destino,
                }))
              );
            }
            if (item.livro) {
              setAuthorNames((item.livro.autores || []).map((author: any) => author.pessoa?.nome).filter(Boolean));
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
              if (item.video.participantes?.length) {
                setAuthorNames(item.video.participantes.map((p: any) => p.pessoa?.nome).filter(Boolean));
              }
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
              if (item.curso.participantes?.length) {
                setAuthorNames(item.curso.participantes.map((p: any) => p.pessoa?.nome).filter(Boolean));
              }
            }
          }
        })
        .finally(() => {
          restoreDraft();
          setDraftReady(true);
        });
    } else {
      restoreDraft();
      setDraftReady(true);
    }
  }, [draftKey, id]);

  useEffect(() => {
    if (!draftReady) return;
    const timer = window.setTimeout(() => {
      const savedAt = new Date().toISOString();
      const draft: VeredasItemDraft = {
        version: 1,
        savedAt,
        tipo,
        titulo,
        descricao,
        authorNames,
        itensRelacionados,
        porqueIndicamos,
        ressalvas,
        nivel,
        status,
        destaque,
        categoriaIds,
        bookData,
        bookAccesses,
        videoData,
        courseData,
      };
      try {
        localStorage.setItem(draftKey, JSON.stringify(draft));
        setDraftSavedAt(savedAt);
      } catch {
        // The form remains usable when storage is unavailable or full.
      }
    }, 800);
    return () => window.clearTimeout(timer);
  }, [authorNames, bookAccesses, bookData, categoriaIds, courseData, descricao, destaque, draftKey, draftReady, itensRelacionados, nivel, porqueIndicamos, ressalvas, status, tipo, titulo, videoData]);

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
        if (Array.isArray(data.suggestedSpeakers) && data.suggestedSpeakers.length > 0) {
          setSuggestedSpeakers(data.suggestedSpeakers);
          setAuthorNames((current) => (current.length === 0 ? data.suggestedSpeakers : current));
          setSuccessMsg('Dados do vídeo e preletor identificados automaticamente.');
        } else {
          setSuccessMsg('Dados do vídeo preenchidos automaticamente.');
        }
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
            setDescricao((current) => current || metadata.description || '');
            setAuthorNames(metadata.authors || []);
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
      setDescricao((current) => current || metadata.description || '');
      setAuthorNames(metadata.authors || []);
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
        descricao: descricao || undefined,
        resumo: porqueIndicamos,
        porqueIndicamos,
        ressalvas: ressalvas || undefined,
        nivel,
        status,
        destaque,
        categoriaIds,
        itensRelacionados: itensRelacionados.map((r, idx) => ({
          destinoId: r.destinoId,
          rotulo: r.rotulo?.trim() || undefined,
          ordem: idx,
        })),
        livro: tipo === 'LIVRO' ? { ...bookData, authorNames, acessos: bookAccesses } : undefined,
        video: tipo === 'VIDEO' ? { ...videoData, pessoaNames: authorNames } : undefined,
        curso: (tipo === 'CURSO' || tipo === 'CONFERENCIA') ? { ...courseData, pessoaNames: authorNames } : undefined,
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
        const validationErrors = Array.isArray(result.errors) ? result.errors.join('\n') : '';
        throw new Error(result.error || validationErrors || 'Erro ao salvar');
      }

      localStorage.removeItem(draftKey);
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
            <div className="flex flex-wrap gap-2 bg-stone-900 border border-stone-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setTipo('LIVRO')}
                className={`px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                  tipo === 'LIVRO' ? 'bg-amber-600 text-stone-950 shadow' : 'text-stone-400'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" /> Livro
              </button>
              <button
                type="button"
                onClick={() => setTipo('VIDEO')}
                className={`px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                  tipo === 'VIDEO' ? 'bg-amber-600 text-stone-950 shadow' : 'text-stone-400'
                }`}
              >
                <Film className="w-3.5 h-3.5" /> Vídeo
              </button>
              <button
                type="button"
                onClick={() => setTipo('CURSO')}
                className={`px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                  tipo === 'CURSO' ? 'bg-amber-600 text-stone-950 shadow' : 'text-stone-400'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" /> Curso/Playlist
              </button>
              <button
                type="button"
                onClick={() => setTipo('CONFERENCIA')}
                className={`px-3.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all ${
                  tipo === 'CONFERENCIA' ? 'bg-indigo-600 text-white shadow' : 'text-stone-400'
                }`}
              >
                <Flame className="w-3.5 h-3.5" /> Conferência
              </button>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="whitespace-pre-line">{errorMsg}</span>
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
                placeholder={
                  tipo === 'LIVRO'
                    ? 'Título do livro'
                    : tipo === 'VIDEO'
                    ? 'Preenchido pelo link do YouTube'
                    : tipo === 'CONFERENCIA'
                    ? 'Título da conferência / simpósio / evento'
                    : 'Título do curso'
                }
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
              <span className="mt-1 block text-[11px] font-normal leading-4 text-stone-500">
                Use maiúsculas apenas no início das frases, em nomes próprios e siglas. Separe ideias longas em parágrafos.
              </span>
              {isMostlyUppercase(porqueIndicamos) ? (
                <span role="alert" className="mt-2 flex items-start gap-1.5 rounded-lg border border-amber-800/60 bg-amber-950/40 p-2 text-[11px] font-normal leading-4 text-amber-300">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Este texto está quase todo em caixa alta. Revise a capitalização para facilitar a leitura antes de publicar.
                </span>
              ) : null}
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
                description={descricao}
                onDescriptionChange={setDescricao}
                authorNames={authorNames}
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
            <CourseFormInternal
              data={courseData}
              onChange={setCourseData}
              setTitle={setTitulo}
              isConference={tipo === 'CONFERENCIA'}
              onDetectSpeaker={(speakers) => {
                setSuggestedSpeakers(speakers);
                setAuthorNames((c) => (c.length === 0 ? speakers : c));
              }}
            />
          )}

          {/* PARTICIPANTES / PRELETORES / AUTORES */}
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
            <PeopleSelector
              label={
                tipo === 'CONFERENCIA'
                  ? 'Preletores / Oradores'
                  : tipo === 'CURSO'
                  ? 'Professores / Instrutores'
                  : tipo === 'VIDEO'
                  ? 'Expositor / Pregador'
                  : 'Autores / Escritores'
              }
              description={
                tipo === 'CONFERENCIA'
                  ? 'Preletores oficiais da conferência, vinculados às plenárias.'
                  : tipo === 'CURSO'
                  ? 'Professores ou instrutores das aulas.'
                  : tipo === 'VIDEO'
                  ? 'Expositor bíblico ou preletor desta mensagem.'
                  : 'Autores, tradutores ou organizadores da obra.'
              }
              people={authorNames}
              onChange={setAuthorNames}
              suggestedPeople={suggestedSpeakers}
              placeholder={
                tipo === 'CONFERENCIA'
                  ? 'Digite o nome do preletor (ex: Terry L. Johnson)...'
                  : tipo === 'VIDEO'
                  ? 'Digite o nome do expositor (ex: Paul Washer)...'
                  : 'Digite o nome e selecione da lista...'
              }
            />
          </div>

          {/* REFERÊNCIAS CRUZADAS */}
          <CrossReferencesEditor
            currentItemId={id ? Number(id) : undefined}
            references={itensRelacionados}
            onChange={setItensRelacionados}
            currentTipo={tipo}
            currentCategoriaIds={categoriaIds}
            currentPeople={authorNames}
          />

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            {draftSavedAt && (
              <span className="mr-auto text-[11px] text-stone-500">
                Rascunho protegido às {new Date(draftSavedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
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
  description,
  onDescriptionChange,
  authorNames,
  onLookupIsbn,
  lookupLoading,
  showAdvanced,
}: {
  data: any;
  onChange: (data: any) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  authorNames: string[];
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
        Sinopse <span className="font-normal text-stone-500">(preenchida automaticamente pela busca)</span>
        <textarea
          rows={6}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder="A sinopse aparecerá aqui quando uma das APIs fornecer esse conteúdo."
          className="mt-1 w-full resize-y rounded-lg border border-stone-700/80 bg-stone-950 p-3 text-xs leading-relaxed text-stone-200 focus:border-amber-500 focus:outline-none"
        />
      </label>

      {authorNames.length > 0 && (
        <div className="rounded-lg border border-stone-800 bg-stone-950 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Autores encontrados</p>
          <p className="mt-1 text-xs text-stone-300">{authorNames.join(', ')}</p>
        </div>
      )}

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

function CourseFormInternal({
  data,
  onChange,
  setTitle,
  isConference = false,
  onDetectSpeaker,
}: {
  data: {
    urlOriginal: string;
    playlistId: string;
    canal: string;
    thumbnailUrl: string;
    aulas: CourseLessonFormData[];
    materiais: CourseMaterialFormData[];
  };
  onChange: React.Dispatch<React.SetStateAction<typeof data>>;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  isConference?: boolean;
  onDetectSpeaker?: (speakers: string[]) => void;
}) {
  const updateLesson = (index: number, patch: Partial<CourseLessonFormData>) => {
    onChange((current) => ({
      ...current,
      aulas: current.aulas.map((aula, i) => (i === index ? { ...aula, ...patch } : aula)),
    }));
  };

  const moveItem = (collection: 'aulas' | 'materiais', from: number, to: number) => {
    if (to < 0) return;
    onChange((current) => {
      const items = [...current[collection]];
      if (to >= items.length) return current;
      const [moved] = items.splice(from, 1);
      items.splice(to, 0, moved);
      return { ...current, [collection]: items };
    });
  };

  const readLesson = async (index: number) => {
    const lesson = data.aulas[index];
    if (!lesson?.urlOriginal) return;
    try {
      const response = await fetch('/api/veredas/admin/importar/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: lesson.urlOriginal }),
      });
      const result = await response.json();
      if (!response.ok) return;
      updateLesson(index, {
        titulo: lesson.titulo || result.title || '',
        youtubeId: result.youtubeId || lesson.youtubeId,
        thumbnailUrl: result.thumbnailUrl || lesson.thumbnailUrl,
      });
      onChange((current) => ({
        ...current,
        canal: current.canal || result.channel || '',
        thumbnailUrl: current.thumbnailUrl || result.thumbnailUrl || '',
      }));
      if (index === 0) setTitle((current) => current || result.title || '');
      if (Array.isArray(result.suggestedSpeakers) && result.suggestedSpeakers.length > 0) {
        onDetectSpeaker?.(result.suggestedSpeakers);
      }
    } catch {
      /* os campos permanecem editáveis */
    }
  };

  const itemLabel = isConference ? 'Plenária' : 'Aula';
  const collectionLabel = isConference ? 'Plenárias & Sessões' : 'Aulas';

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 space-y-5">
      <div>
        <h2
          className={`font-serif font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${
            isConference ? 'text-indigo-400' : 'text-amber-400'
          }`}
        >
          {isConference ? <Flame className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
          {isConference ? 'Conferência / Evento' : 'Curso / Playlist'}
        </h2>
        <p className="mt-2 text-xs text-stone-400">
          {isConference
            ? 'Cadastre a playlist da conferência e organize abaixo cada vídeo como uma plenária ou sessão.'
            : 'Cadastre a playlist como curso e organize abaixo cada vídeo como uma aula.'}
        </p>
      </div>

      <label className="block text-xs font-semibold text-stone-300">
        Link da playlist {isConference ? 'da conferência' : 'do curso'} <span className="text-amber-500">*</span>
        <input
          type="url"
          required
          value={data.urlOriginal}
          onChange={(event) => {
            const parsed = parseYoutubePlaylistUrl(event.target.value);
            onChange((current) => ({
              ...current,
              urlOriginal: event.target.value,
              playlistId: parsed?.playlistId || '',
            }));
          }}
          placeholder="https://www.youtube.com/playlist?list=..."
          className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs"
        />
        {data.playlistId ? (
          <span className="mt-1 block text-[11px] text-emerald-400">Playlist identificada: {data.playlistId}</span>
        ) : null}
      </label>

      <label className="block text-xs font-semibold text-stone-300">
        Canal / Organizador <span className="font-normal text-stone-500">(opcional)</span>
        <input
          value={data.canal}
          onChange={(event) => onChange((current) => ({ ...current, canal: event.target.value }))}
          className="mt-1 w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3 py-2 text-xs"
        />
      </label>

      <div className="flex items-center justify-between border-t border-stone-800 pt-5">
        <div>
          <h3 className="text-sm font-bold text-stone-200">{collectionLabel}</h3>
          <p className="text-[11px] text-stone-500">
            {isConference
              ? 'A ordem abaixo será a ordem de exibição das plenárias do evento.'
              : 'A ordem abaixo será a ordem de navegação do aluno.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            onChange((current) => ({
              ...current,
              aulas: [
                ...current.aulas,
                { key: crypto.randomUUID(), titulo: '', urlOriginal: '', youtubeId: '', thumbnailUrl: '' },
              ],
            }))
          }
          className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 ${
            isConference
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
              : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
          }`}
        >
          <Plus className="w-4 h-4" /> Adicionar {itemLabel.toLowerCase()}
        </button>
      </div>

      {data.aulas.length === 0 ? (
        <p className="rounded-lg border border-dashed border-stone-700 p-5 text-center text-xs text-stone-500">
          Adicione ao menos uma {itemLabel.toLowerCase()}.
        </p>
      ) : null}

      <div className="space-y-3">
        {data.aulas.map((aula, index) => (
          <div key={aula.key} className="rounded-xl border border-stone-800 bg-stone-950 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <strong className={`text-xs ${isConference ? 'text-indigo-300' : 'text-amber-300'}`}>
                {itemLabel} {index + 1}
              </strong>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={index === 0}
                  aria-label={`Mover ${itemLabel.toLowerCase()} ${index + 1} para cima`}
                  onClick={() => moveItem('aulas', index, index - 1)}
                  className="rounded p-1.5 text-stone-400 hover:bg-stone-800 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={index === data.aulas.length - 1}
                  aria-label={`Mover ${itemLabel.toLowerCase()} ${index + 1} para baixo`}
                  onClick={() => moveItem('aulas', index, index + 1)}
                  className="rounded p-1.5 text-stone-400 hover:bg-stone-800 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label={`Remover ${itemLabel.toLowerCase()} ${index + 1}`}
                  onClick={() =>
                    onChange((current) => ({ ...current, aulas: current.aulas.filter((_, i) => i !== index) }))
                  }
                  className="rounded p-1.5 text-stone-500 hover:bg-red-950 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <input
              type="url"
              required
              value={aula.urlOriginal}
              onChange={(event) => {
                const parsed = parseYoutubeUrl(event.target.value);
                updateLesson(index, {
                  urlOriginal: event.target.value,
                  youtubeId: parsed.youtubeId || '',
                  thumbnailUrl: parsed.thumbnailUrl || '',
                });
              }}
              onBlur={() => void readLesson(index)}
              placeholder={`Link do vídeo desta ${itemLabel.toLowerCase()}`}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs"
            />
            <input
              required
              value={aula.titulo}
              onChange={(event) => updateLesson(index, { titulo: event.target.value })}
              placeholder={`Título da ${itemLabel.toLowerCase()}`}
              className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs"
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-stone-800 pt-5">
        <div>
          <h3 className="text-sm font-bold text-stone-200">
            {isConference ? 'Materiais da conferência' : 'Materiais complementares'}
          </h3>
          <p className="text-[11px] text-stone-500">Somente links externos; nenhum arquivo será armazenado.</p>
        </div>
        <button
          type="button"
          onClick={() =>
            onChange((current) => ({
              ...current,
              materiais: [...current.materiais, { key: crypto.randomUUID(), titulo: '', url: '' }],
            }))
          }
          className="px-3 py-2 bg-stone-800 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Adicionar link
        </button>
      </div>

      <div className="space-y-3">
        {data.materiais.map((material, index) => (
          <div
            key={material.key}
            className="grid sm:grid-cols-[auto_1fr_1.5fr_auto] gap-2 rounded-xl border border-stone-800 bg-stone-950 p-4 sm:items-center"
          >
            <strong className="text-xs text-amber-300 sm:pr-2">Link {index + 1}</strong>
            <input
              required
              value={material.titulo}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  materiais: current.materiais.map((item, i) =>
                    i === index ? { ...item, titulo: event.target.value } : item
                  ),
                }))
              }
              placeholder="Nome do material"
              className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs"
            />
            <input
              type="url"
              required
              value={material.url}
              onChange={(event) =>
                onChange((current) => ({
                  ...current,
                  materiais: current.materiais.map((item, i) =>
                    i === index ? { ...item, url: event.target.value } : item
                  ),
                }))
              }
              placeholder="https://..."
              className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs"
            />
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                disabled={index === 0}
                aria-label={`Mover link ${index + 1} para cima`}
                onClick={() => moveItem('materiais', index, index - 1)}
                className="rounded p-2 text-stone-400 hover:bg-stone-800 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={index === data.materiais.length - 1}
                aria-label={`Mover link ${index + 1} para baixo`}
                onClick={() => moveItem('materiais', index, index + 1)}
                className="rounded p-2 text-stone-400 hover:bg-stone-800 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-25"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label={`Remover material ${index + 1}`}
                onClick={() =>
                  onChange((current) => ({
                    ...current,
                    materiais: current.materiais.filter((_, i) => i !== index),
                  }))
                }
                className="rounded p-2 text-stone-500 hover:bg-red-950 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
