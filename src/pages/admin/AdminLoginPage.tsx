import { FormEvent, useState } from 'react';
import { AlertCircle, Church, Lock } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveAdminSession } from '../../lib/admin/session';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : { error: response.ok ? 'Resposta inválida do servidor' : 'O servidor de autenticação está temporariamente indisponível' };
      if (!response.ok) throw new Error(data.error || 'Falha ao autenticar');
      saveAdminSession(data.user);
      const destination = (location.state as { from?: string } | null)?.from || '/admin';
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Falha ao autenticar');
    } finally {
      setLoading(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-stone-950 p-5 text-stone-100">
    <Helmet><title>Central Administrativa IBO</title></Helmet>
    <section className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900 p-8 shadow-2xl">
      <div className="mb-7 text-center"><Church className="mx-auto mb-4 h-12 w-12 text-amber-500" /><h1 className="font-serif text-3xl font-bold">Central Administrativa</h1><p className="mt-2 text-sm text-stone-400">Igreja Batista Olaria</p></div>
      {error && <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-red-800 bg-red-950/60 p-3 text-sm text-red-200"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-semibold">E-mail<input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 font-normal outline-none focus:border-amber-500" /></label>
        <label className="block text-sm font-semibold">Senha<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 font-normal outline-none focus:border-amber-500" /></label>
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-60"><Lock className="h-4 w-4" />{loading ? 'Autenticando…' : 'Entrar'}</button>
      </form>
    </section>
  </main>;
}

