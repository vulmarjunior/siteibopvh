import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '../../../lib/veredas/supabaseClient';
import { BookOpen, Lock, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export const VeredasLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/veredas/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Falha ao autenticar');
      }

      localStorage.setItem('veredas_access_token', data.access_token);
      localStorage.setItem('veredas_user', JSON.stringify(data.usuario));

      navigate('/admin/veredas');
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao realizar login. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
      <Helmet>
        <title>Login Painel Veredas IBO</title>
      </Helmet>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-8 max-w-md w-full space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-stone-950 font-bold mx-auto shadow-inner">
            <BookOpen className="w-7 h-7 text-stone-950" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-amber-100">
            Painel Veredas IBO
          </h1>
          <p className="text-xs text-stone-400">
            Autenticação de curadores e pastores da Igreja Batista Olaria
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              E-mail Administrativo
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pastor@ibopvh.com.br"
              className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3.5 py-2.5 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Senha
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-stone-950 border border-stone-700/80 rounded-lg px-3.5 py-2.5 text-sm text-stone-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm rounded-lg transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            {loading ? 'Autenticando...' : 'Entrar no Painel'}
          </button>
        </form>

      </div>
    </div>
  );
};
