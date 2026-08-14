import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Eye, EyeOff, Image, Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAdminAccessToken } from '../../lib/admin/session';

type BannerSlide = {
  id?: string;
  subtitle: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaLink: string;
  imageUrl: string;
  altText: string;
  position: number;
  active: boolean;
};

const emptySlide = (position: number): BannerSlide => ({
  subtitle: '', title: '', description: '', ctaLabel: '', ctaLink: '', imageUrl: '', altText: '', position, active: true,
});

export default function AdminHomeBannersPage() {
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [editing, setEditing] = useState<BannerSlide | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const request = useCallback(async (path = '', init?: RequestInit) => {
    const token = await getAdminAccessToken();
    const response = await fetch(`/api/admin/home-banners${path}`, {
      ...init,
      headers: { ...(init?.body && typeof init.body === 'string' ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || 'Não foi possível concluir a operação.');
    }
    return response;
  }, []);

  const load = useCallback(async () => {
    try {
      const rows = await (await request()).json();
      setSlides(rows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os banners.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => { void load(); }, [load]);

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editing) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return setError('Use uma imagem JPG, PNG ou WebP.');
    if (file.size > 4 * 1024 * 1024) return setError('A imagem deve ter no máximo 4 MB.');
    setUploading(true); setError(''); setNotice('');
    try {
      const response = await request('/upload', { method: 'POST', body: file, headers: { 'Content-Type': file.type } });
      const body = await response.json();
      setEditing((current) => current ? { ...current, imageUrl: body.imageUrl } : current);
      setNotice('Imagem enviada. Salve o banner para publicar a alteração.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível enviar a imagem.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true); setError(''); setNotice('');
    try {
      await request(editing.id ? `/${editing.id}` : '', { method: editing.id ? 'PUT' : 'POST', body: JSON.stringify(editing) });
      setNotice(editing.id ? 'Banner atualizado com sucesso.' : 'Banner adicionado com sucesso.');
      setEditing(null);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível salvar o banner.');
    } finally { setSaving(false); }
  }

  async function remove(slide: BannerSlide) {
    if (!slide.id || !window.confirm(`Excluir permanentemente o banner “${slide.title}”?`)) return;
    setError(''); setNotice('');
    try {
      await request(`/${slide.id}`, { method: 'DELETE' });
      if (editing?.id === slide.id) setEditing(null);
      setNotice('Banner excluído.');
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível excluir o banner.'); }
  }

  const input = 'mt-1 w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2.5 text-sm text-stone-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500';

  return <main className="min-h-screen bg-stone-950 px-5 py-8 text-stone-100">
    <Helmet><title>Banners da página inicial — Central Administrativa</title></Helmet>
    <div className="mx-auto max-w-7xl space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/admin" className="mb-4 inline-flex items-center gap-1 text-xs text-stone-400 hover:text-amber-400"><ArrowLeft className="h-4 w-4" /> Voltar à Central</Link>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-500">Página inicial da igreja</p>
          <h1 className="mt-2 flex items-center gap-3 font-serif text-3xl font-bold"><Image className="text-amber-500" />Gerenciador de banners</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-400">Edite o carrossel principal. A menor posição aparece primeiro; banners inativos permanecem salvos, mas não aparecem no site.</p>
        </div>
        <button onClick={() => setEditing(emptySlide(slides.length ? Math.max(...slides.map((slide) => slide.position)) + 1 : 1))} className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-stone-950 hover:bg-amber-500"><Plus className="h-4 w-4" />Novo banner</button>
      </header>

      {notice && <p className="rounded-xl border border-emerald-700/40 bg-emerald-950/30 p-3 text-sm text-emerald-200">{notice}</p>}
      {error && <p className="rounded-xl border border-red-700/40 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}

      {loading ? <div className="flex items-center gap-2 text-stone-400"><Loader2 className="h-5 w-5 animate-spin" />Carregando banners...</div> : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {slides.map((slide) => <article key={slide.id} className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900">
          <div className="relative aspect-[16/7] bg-stone-800"><img src={slide.imageUrl} alt={slide.altText} className="h-full w-full object-cover" /><span className={`absolute right-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${slide.active ? 'bg-emerald-950/90 text-emerald-300' : 'bg-stone-950/90 text-stone-400'}`}>{slide.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{slide.active ? 'Visível' : 'Oculto'}</span></div>
          <div className="space-y-3 p-5"><div><span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Posição {slide.position}</span><h2 className="mt-1 font-serif text-xl font-bold">{slide.title}</h2><p className="mt-1 line-clamp-2 text-sm text-stone-400">{slide.description}</p></div><div className="flex gap-2"><button onClick={() => setEditing({ ...slide })} className="flex-1 rounded-lg bg-stone-800 px-3 py-2 text-sm font-bold hover:bg-stone-700">Editar</button><button onClick={() => void remove(slide)} className="rounded-lg border border-red-900/60 px-3 py-2 text-red-400 hover:bg-red-950/40" aria-label={`Excluir ${slide.title}`}><Trash2 className="h-4 w-4" /></button></div></div>
        </article>)}
        {!slides.length && <div className="col-span-full rounded-2xl border border-dashed border-stone-700 p-10 text-center text-stone-400">Nenhum banner cadastrado.</div>}
      </div>}

      {editing && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"><div className="mx-auto my-4 max-w-6xl rounded-2xl border border-stone-700 bg-stone-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-800 px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-wider text-amber-500">{editing.id ? 'Editar banner' : 'Novo banner'}</p><h2 className="font-serif text-xl font-bold">Conteúdo e apresentação</h2></div><button onClick={() => setEditing(null)} className="rounded-lg px-3 py-2 text-sm text-stone-400 hover:bg-stone-800">Fechar</button></div>
        {(notice || error) && <div className={`mx-5 mt-5 rounded-xl border p-3 text-sm ${error ? 'border-red-700/40 bg-red-950/30 text-red-200' : 'border-emerald-700/40 bg-emerald-950/30 text-emerald-200'}`}>{error || notice}</div>}
        <form onSubmit={save} className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,.9fr)]">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">Chamada superior<input className={input} maxLength={180} value={editing.subtitle} onChange={(event) => setEditing({ ...editing, subtitle: event.target.value })} required /></label>
            <label className="text-sm sm:col-span-2">Título<input className={input} maxLength={180} value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} required /></label>
            <label className="text-sm sm:col-span-2">Descrição<textarea className={input} rows={4} maxLength={500} value={editing.description} onChange={(event) => setEditing({ ...editing, description: event.target.value })} required /></label>
            <label className="text-sm">Texto do botão<input className={input} maxLength={180} value={editing.ctaLabel} onChange={(event) => setEditing({ ...editing, ctaLabel: event.target.value })} required /></label>
            <label className="text-sm">Link do botão<input className={input} placeholder="/pagina ou #secao" value={editing.ctaLink} onChange={(event) => setEditing({ ...editing, ctaLink: event.target.value })} required /></label>
            <label className="text-sm sm:col-span-2">Descrição acessível da imagem<input className={input} maxLength={180} value={editing.altText} onChange={(event) => setEditing({ ...editing, altText: event.target.value })} required /></label>
            <label className="text-sm">Posição<input type="number" min={0} max={999} className={input} value={editing.position} onChange={(event) => setEditing({ ...editing, position: Number(event.target.value) })} required /></label>
            <label className="mt-6 flex items-center gap-3 rounded-xl border border-stone-700 bg-stone-950 px-4 py-2.5 text-sm"><input type="checkbox" checked={editing.active} onChange={(event) => setEditing({ ...editing, active: event.target.checked })} />Exibir no site</label>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-stone-700 bg-stone-950">
              <div className="relative aspect-[16/8] bg-stone-800">{editing.imageUrl ? <><img src={editing.imageUrl} alt={editing.altText || 'Prévia do banner'} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-950/35 to-transparent" /><div className="absolute inset-0 flex items-center p-5"><div className="max-w-[70%]"><p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">{editing.subtitle || 'Chamada superior'}</p><h3 className="mt-2 font-serif text-2xl font-bold text-white">{editing.title || 'Título do banner'}</h3><p className="mt-2 line-clamp-2 text-xs text-stone-200">{editing.description}</p></div></div></> : <div className="flex h-full items-center justify-center text-sm text-stone-500">Selecione a imagem do banner</div>}</div>
            </div>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-amber-700/60 bg-amber-950/30 px-4 py-3 text-sm font-bold text-amber-300 hover:bg-amber-950/60"><input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void uploadImage(event)} disabled={uploading} />{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}{uploading ? 'Enviando...' : 'Enviar imagem'}</label>
            <p className="text-xs leading-relaxed text-stone-500">Recomendação: imagem horizontal com pelo menos 1600 × 900 px, em JPG, PNG ou WebP, até 4 MB.</p>
            <label className="text-sm">Endereço da imagem<input className={input} value={editing.imageUrl} onChange={(event) => setEditing({ ...editing, imageUrl: event.target.value })} placeholder="Preenchido automaticamente após o envio" required /></label>
            <button type="submit" disabled={saving || uploading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 font-bold text-stone-950 hover:bg-amber-500 disabled:opacity-50">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{saving ? 'Salvando...' : 'Salvar banner'}</button>
          </div>
        </form>
      </div></div>}
    </div>
  </main>;
}
