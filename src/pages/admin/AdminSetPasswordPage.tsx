import { FormEvent, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Church, KeyRound } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { supabaseClient } from '../../lib/veredas/supabaseClient';

export default function AdminSetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    void supabaseClient.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      setHasSession(Boolean(data.session) && !sessionError);
      setCheckingSession(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('A senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    if (password !== confirmation) {
      setError('As senhas informadas não coincidem.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabaseClient.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError('Não foi possível definir a senha. Solicite um novo convite e tente novamente.');
      return;
    }

    setSuccess(true);
    await supabaseClient.auth.signOut();
  }

  return <main className="flex min-h-screen items-center justify-center bg-stone-950 p-5 text-stone-100">
    <Helmet><title>Definir senha | Central Administrativa IBO</title></Helmet>
    <section className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900 p-8 shadow-2xl">
      <div className="mb-7 text-center">
        <Church className="mx-auto mb-4 h-12 w-12 text-amber-500" />
        <h1 className="font-serif text-3xl font-bold">Definir senha</h1>
        <p className="mt-2 text-sm text-stone-400">Central Administrativa IBO</p>
      </div>

      {checkingSession && <p className="text-center text-sm text-stone-300">Validando convite…</p>}

      {!checkingSession && !hasSession && !success && <div role="alert" className="space-y-4 rounded-xl border border-amber-800 bg-amber-950/50 p-4 text-sm text-amber-100">
        <div className="flex gap-2"><AlertCircle className="h-5 w-5 shrink-0" /><span>Este convite é inválido, já foi utilizado ou expirou.</span></div>
        <p>Solicite um novo convite de homologação.</p>
      </div>}

      {error && <div role="alert" className="mb-5 flex gap-2 rounded-xl border border-red-800 bg-red-950/60 p-3 text-sm text-red-200"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}

      {!checkingSession && hasSession && !success && <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-semibold">Nova senha<input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 font-normal outline-none focus:border-amber-500" /></label>
        <label className="block text-sm font-semibold">Confirmar senha<input type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 font-normal outline-none focus:border-amber-500" /></label>
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-3 font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-60"><KeyRound className="h-4 w-4" />{loading ? 'Salvando…' : 'Definir senha'}</button>
      </form>}

      {success && <div className="space-y-5 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        <p className="text-emerald-100">Senha definida com sucesso.</p>
        <Link to="/admin/login" className="inline-flex rounded-xl bg-amber-500 px-5 py-3 font-bold text-stone-950 hover:bg-amber-400">Ir para o login</Link>
      </div>}
    </section>
  </main>;
}
