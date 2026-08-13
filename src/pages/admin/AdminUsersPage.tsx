import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Loader2, Save, Send, UserCog } from 'lucide-react';
import { getAdminAccessToken } from '../../lib/admin/session';
import type { AdminRole } from '../../lib/admin/permissions';

type AdminUserRow = { id: string; email: string; name: string | null; role: AdminRole; active: boolean; lastAccessAt: string | null; createdAt: string };
const roleLabels: Record<AdminRole, string> = { ADMIN_GERAL: 'Administrador geral', EDITOR: 'Editor', CURADOR_VEREDAS: 'Curador Veredas', OPERADOR: 'Operador' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<AdminRole>('CURADOR_VEREDAS');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const request = useCallback(async (path = '', init?: RequestInit) => {
    const token = await getAdminAccessToken();
    const response = await fetch(`/api/admin/users${path}`, { ...init, headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers || {}), Authorization: `Bearer ${token}` } });
    if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || 'Não foi possível concluir a operação.'); }
    return response;
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true); setError('');
    try { setUsers(await (await request()).json()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao carregar usuários.'); }
    finally { setLoading(false); }
  }, [request]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  async function invite(event: FormEvent) {
    event.preventDefault(); setError(''); setMessage(''); setSaving('invite');
    try {
      await request('/invite', { method: 'POST', body: JSON.stringify({ email, name, role }) });
      setEmail(''); setName(''); setMessage('Convite enviado e perfil administrativo criado.'); await loadUsers();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao enviar convite.'); }
    finally { setSaving(null); }
  }

  function changeUser(id: string, changes: Partial<AdminUserRow>) {
    setUsers((current) => current.map((user) => user.id === id ? { ...user, ...changes } : user));
  }

  async function saveUser(user: AdminUserRow) {
    setSaving(user.id); setError(''); setMessage('');
    try { await request(`/${user.id}`, { method: 'PATCH', body: JSON.stringify({ role: user.role, active: user.active }) }); setMessage(`${user.email} atualizado.`); await loadUsers(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao atualizar usuário.'); await loadUsers(); }
    finally { setSaving(null); }
  }

  return <main className="min-h-screen bg-stone-950 px-5 py-8 text-stone-100">
    <Helmet><title>Usuários e permissões — Central Administrativa</title></Helmet>
    <div className="mx-auto max-w-6xl space-y-7">
      <header><p className="text-xs font-bold uppercase tracking-[.2em] text-amber-500">Central Administrativa</p><h1 className="mt-2 flex items-center gap-3 font-serif text-3xl font-bold"><UserCog className="text-amber-500" />Usuários e permissões</h1><p className="mt-2 text-sm text-stone-400">Convide pessoas e conceda somente o acesso necessário para sua função.</p></header>
      {message && <p role="status" className="rounded-xl border border-emerald-800 bg-emerald-950/50 p-3 text-sm text-emerald-200">{message}</p>}
      {error && <p role="alert" className="rounded-xl border border-red-800 bg-red-950/50 p-3 text-sm text-red-200">{error}</p>}
      <form onSubmit={invite} className="grid gap-4 rounded-2xl border border-stone-800 bg-stone-900 p-5 md:grid-cols-4">
        <label className="text-sm text-stone-300">Nome<input value={name} onChange={(event) => setName(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2" /></label>
        <label className="text-sm text-stone-300">E-mail<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2" /></label>
        <label className="text-sm text-stone-300">Papel<select value={role} onChange={(event) => setRole(event.target.value as AdminRole)} className="mt-1 w-full rounded-xl border border-stone-700 bg-stone-950 px-3 py-2">{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <button disabled={saving === 'invite'} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2 font-bold text-stone-950 disabled:opacity-50">{saving === 'invite' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Convidar</button>
      </form>
      <section className="overflow-hidden rounded-2xl border border-stone-800 bg-stone-900">
        {loading ? <div className="grid place-items-center p-16"><Loader2 className="animate-spin text-amber-500" /></div> : users.map((user) => <article key={user.id} className="grid gap-4 border-b border-stone-800 p-5 last:border-0 md:grid-cols-[1fr_220px_120px_auto] md:items-center"><div><strong>{user.name || user.email}</strong><p className="text-sm text-stone-400">{user.email}</p><p className="mt-1 text-xs text-stone-500">Último acesso: {user.lastAccessAt ? new Date(user.lastAccessAt).toLocaleString('pt-BR') : 'ainda não registrado'}</p></div><select value={user.role} onChange={(event) => changeUser(user.id, { role: event.target.value as AdminRole })} className="rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm">{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={user.active} onChange={(event) => changeUser(user.id, { active: event.target.checked })} className="h-4 w-4 accent-amber-500" />Ativo</label><button onClick={() => void saveUser(user)} disabled={saving === user.id} className="flex items-center justify-center gap-2 rounded-xl border border-stone-700 px-4 py-2 text-sm font-bold hover:bg-stone-800 disabled:opacity-50">{saving === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}Salvar</button></article>)}
      </section>
    </div>
  </main>;
}
