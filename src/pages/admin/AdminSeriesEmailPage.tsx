import { CheckCircle2, Clock, Info, Mail, Play, RefreshCw, Send, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getAdminAccessToken } from '../../lib/admin/session';
import AdminPageHeader from '../../components/admin/AdminPageHeader';

type Series = { id: string; title: string; slug: string };
type Dashboard = {
  series: Series & { emailEnabled: boolean };
  selection: { number: string; title: string; theme: string; days: { dia: string; texto: string; descricao: string }[] } | null;
  subscribers: { id: number; email: string; name: string | null; active: boolean; subscribedAt: string; unsubscribedAt: string | null }[];
  runs: { id: string; status: string; recipientCount: number; sentCount: number; failedCount: number; startedAt: string; message: { order: number; title: string } }[];
  automation?: {
    schedule: string;
    resendConfigured: boolean;
    cronSecretConfigured: boolean;
    appUrl: string;
  };
};

export default function AdminSeriesEmailPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [seriesId, setSeriesId] = useState('');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [preview, setPreview] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function request(url: string, init?: RequestInit) {
    const token = await getAdminAccessToken();
    return fetch(url, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init?.headers } });
  }

  async function loadSeries() {
    try {
      const response = await request('/api/admin/series');
      if (response.ok) {
        const rows = await response.json();
        setSeries(rows);
        if (!seriesId && rows[0]) setSeriesId(rows[0].id);
      } else {
        // Fallback para a série Parousia se a lista de séries estiver vazia ou offline
        setSeries([{ id: 'da-ascensao-a-parousia', title: 'Da Ascensão à Parousia', slug: 'da-ascensao-a-parousia' }]);
        if (!seriesId) setSeriesId('da-ascensao-a-parousia');
      }
    } catch {
      setSeries([{ id: 'da-ascensao-a-parousia', title: 'Da Ascensão à Parousia', slug: 'da-ascensao-a-parousia' }]);
      if (!seriesId) setSeriesId('da-ascensao-a-parousia');
    }
  }

  async function loadDashboard() {
    if (!seriesId) return;
    try {
      const response = await request(`/api/admin/series-email/${seriesId}`);
      const body = await response.json();
      if (response.ok) {
        setDashboard(body);
      } else {
        setNotice({ type: 'error', message: body.error || 'Não foi possível carregar as informações da série.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: 'Erro de conexão ao carregar dados do envio semanal.' });
    }
  }

  useEffect(() => {
    void loadSeries();
  }, []);

  useEffect(() => {
    setPreview('');
    void loadDashboard();
  }, [seriesId]);

  async function toggleEnabled() {
    if (!dashboard) return;
    setBusy(true);
    try {
      const nextState = !dashboard.series.emailEnabled;
      const response = await request(`/api/admin/series-email/${seriesId}/config`, {
        method: 'PATCH',
        body: JSON.stringify({ emailEnabled: nextState }),
      });
      if (response.ok) {
        setNotice({
          type: 'success',
          message: nextState
            ? 'Envio automático HABILITADO. O robô enviará toda segunda-feira às 07:00.'
            : 'Envio automático DESABILITADO. Nenhuma mensagem será disparada pelo robô.',
        });
        void loadDashboard();
      } else {
        const body = await response.json();
        setNotice({ type: 'error', message: body.error || 'Falha ao alterar configuração.' });
      }
    } catch {
      setNotice({ type: 'error', message: 'Erro de rede ao salvar configuração.' });
    } finally {
      setBusy(false);
    }
  }

  async function showPreview() {
    setBusy(true);
    try {
      const response = await request(`/api/admin/series-email/${seriesId}/preview`);
      const body = await response.json();
      if (response.ok) {
        setPreview(body.html);
      } else {
        setNotice({ type: 'error', message: body.error || 'Não foi possível gerar a prévia.' });
      }
    } catch {
      setNotice({ type: 'error', message: 'Erro ao gerar prévia do e-mail.' });
    } finally {
      setBusy(false);
    }
  }

  async function sendTest(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await request(`/api/admin/series-email/${seriesId}/test`, {
        method: 'POST',
        body: JSON.stringify({ email: testEmail }),
      });
      const body = await response.json();
      if (response.ok) {
        setNotice({ type: 'success', message: body.message || `Teste enviado para ${testEmail}.` });
      } else {
        setNotice({ type: 'error', message: body.error || 'Erro ao enviar e-mail de teste.' });
      }
    } catch {
      setNotice({ type: 'error', message: 'Erro de rede ao disparar teste.' });
    } finally {
      setBusy(false);
    }
  }

  async function triggerCronNow() {
    if (!confirm('Deseja executar a rotina automatizada agora? Os assinantes ativos que ainda não receberam a leitura desta semana serão notificados.')) {
      return;
    }
    setBusy(true);
    try {
      const response = await request(`/api/admin/series-email/${seriesId}/trigger-cron`, { method: 'POST' });
      const body = await response.json();
      if (response.ok && body.result) {
        const res = body.result;
        if (res.status === 'disabled') {
          setNotice({ type: 'info', message: 'O robô rodou, mas o envio está DESABILITADO nesta série. Habilite o envio para disparar.' });
        } else if (res.status === 'already_completed') {
          setNotice({ type: 'info', message: 'A leitura desta semana já havia sido enviada para todos os assinantes.' });
        } else if (res.status === 'no_subscribers') {
          setNotice({ type: 'info', message: 'Nenhum assinante ativo encontrado para receber.' });
        } else {
          setNotice({ type: 'success', message: `Automação executada: ${res.sent || 0} enviados com sucesso (${res.errors || 0} erros).` });
        }
        void loadDashboard();
      } else {
        setNotice({ type: 'error', message: body.error || 'Falha ao executar o robô.' });
      }
    } catch {
      setNotice({ type: 'error', message: 'Erro ao acionar a rotina do robô.' });
    } finally {
      setBusy(false);
    }
  }

  async function toggleSubscriber(id: number, active: boolean) {
    setBusy(true);
    try {
      const response = await request(`/api/admin/series-email/${seriesId}/subscribers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ active }),
      });
      if (response.ok) {
        setNotice({ type: 'info', message: active ? 'Assinante reativado.' : 'Assinante desativado.' });
        void loadDashboard();
      }
    } catch {
      setNotice({ type: 'error', message: 'Erro ao alterar assinante.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>E-mails das Séries — Central Administrativa</title>
      </Helmet>

      <AdminPageHeader
        category="Editorial & Conteúdo"
        title="E-mails das Séries"
        description="Gestão e monitoramento do envio semanal automatizado das leituras devocionais."
        icon={Mail}
      />

      {notice && (
        <div
          role="status"
          className={`fixed right-5 top-5 z-50 flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl transition-all ${
            notice.type === 'success'
              ? 'border-emerald-500/40 bg-stone-900 text-emerald-300'
              : notice.type === 'error'
              ? 'border-red-500/40 bg-stone-900 text-red-300'
              : 'border-amber-500/40 bg-stone-900 text-amber-300'
          }`}
        >
          {notice.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          ) : notice.type === 'error' ? (
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
          ) : (
            <Info className="h-5 w-5 shrink-0 text-amber-400" />
          )}
          <span className="text-sm font-medium">{notice.message}</span>
          <button
            onClick={() => setNotice(null)}
            className="ml-2 rounded-lg p-1 text-stone-400 hover:bg-stone-800 hover:text-stone-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Seletor de Série */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-800 bg-stone-900/80 p-5">
        <label className="flex items-center gap-3 text-sm text-stone-300">
          <span className="font-semibold text-stone-100">Série Ativa:</span>
          <select
            className="rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-stone-100 outline-none focus:border-amber-500"
            value={seriesId}
            onChange={(event) => setSeriesId(event.target.value)}
          >
            {series.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </label>
      </section>

      {dashboard && (
        <>
          {/* Card Principal de Automação */}
          <section className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-stone-900 to-stone-950 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-3 w-3 rounded-full ${dashboard.series.emailEnabled ? 'animate-pulse bg-emerald-400' : 'bg-stone-500'}`} />
                  <h2 className="font-serif text-xl font-bold text-stone-100">
                    Automação Semanal: {dashboard.series.emailEnabled ? 'ATIVA (Automático)' : 'PAUSADA'}
                  </h2>
                </div>
                <p className="flex items-center gap-2 text-sm text-stone-400">
                  <Clock className="h-4 w-4 text-amber-400" />
                  Disparo agendado: <strong className="text-stone-200">Toda segunda-feira às 07:00 (Porto Velho)</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  disabled={busy}
                  onClick={toggleEnabled}
                  className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                    dashboard.series.emailEnabled
                      ? 'border-stone-700 bg-stone-900 text-stone-300 hover:bg-stone-800'
                      : 'border-emerald-600 bg-emerald-600 text-stone-950 hover:bg-emerald-500'
                  }`}
                >
                  {dashboard.series.emailEnabled ? 'Pausar Automação' : 'Ativar Automação'}
                </button>

                <button
                  disabled={busy}
                  onClick={triggerCronNow}
                  title="Testa a rotina do robô agora mesmo sem esperar a próxima segunda-feira"
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 shadow-md transition-all hover:bg-amber-400 disabled:opacity-50"
                >
                  <Play className="h-4 w-4 fill-current" />
                  {busy ? 'Processando…' : 'Testar Robô Agora'}
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 border-t border-stone-800/80 pt-5 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-800/60 bg-stone-950/60 p-4">
                <p className="text-xs uppercase tracking-wider text-stone-400">Leitura Vigente</p>
                <p className="mt-1 font-semibold text-amber-300">
                  {dashboard.selection ? `#${dashboard.selection.number} ${dashboard.selection.title}` : 'Sem leitura para esta semana'}
                </p>
                <p className="mt-1 text-xs text-stone-400">{dashboard.selection?.theme || 'Tema não definido'}</p>
              </div>

              <div className="rounded-2xl border border-stone-800/60 bg-stone-950/60 p-4">
                <p className="text-xs uppercase tracking-wider text-stone-400">Assinantes Ativos</p>
                <p className="mt-1 text-2xl font-bold text-stone-100">
                  {dashboard.subscribers.filter((item) => item.active).length}
                </p>
                <p className="mt-1 text-xs text-stone-400">membros recebendo toda semana</p>
              </div>

              <div className="rounded-2xl border border-stone-800/60 bg-stone-950/60 p-4">
                <p className="text-xs uppercase tracking-wider text-stone-400">Serviço de Envio</p>
                <p className="mt-1 flex items-center gap-2 font-semibold text-emerald-400">
                  <Sparkles className="h-4 w-4" />
                  Resend API (Transacional)
                </p>
                <p className="mt-1 text-xs text-stone-400">contato@ibopvh.com.br</p>
              </div>
            </div>
          </section>

          {/* Seção de Teste & Prévia */}
          <section className="rounded-3xl border border-stone-800 bg-stone-900/60 p-6">
            <h3 className="mb-4 font-serif text-lg font-bold text-stone-100">Prévia & Envio de Teste</h3>
            <div className="flex flex-wrap items-end gap-4">
              <button
                disabled={busy}
                onClick={showPreview}
                className="flex items-center gap-2 rounded-xl bg-stone-800 px-4 py-2.5 text-sm font-semibold text-stone-100 transition-all hover:bg-stone-700"
              >
                <RefreshCw className="h-4 w-4" />
                Gerar Prévia do E-mail
              </button>

              <form onSubmit={sendTest} className="flex flex-1 flex-wrap items-end gap-2">
                <label className="min-w-64 flex-1 text-sm">
                  <span className="text-xs text-stone-400">Enviar e-mail de teste para:</span>
                  <input
                    required
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    className="mt-1 w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-2 text-sm text-stone-100 outline-none focus:border-amber-500"
                    value={testEmail}
                    onChange={(event) => setTestEmail(event.target.value)}
                  />
                </label>
                <button
                  disabled={busy}
                  type="submit"
                  className="flex items-center gap-2 rounded-xl border border-amber-600/60 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400 transition-all hover:bg-amber-500/20"
                >
                  <Send className="h-4 w-4" />
                  Enviar Teste
                </button>
              </form>
            </div>

            {preview && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-stone-800 bg-white">
                <iframe title="Prévia do E-mail Semanal" srcDoc={preview} className="h-[650px] w-full" />
              </div>
            )}
          </section>

          {/* Histórico das Últimas Execuções do Robô */}
          <section className="rounded-3xl border border-stone-800 bg-stone-900/60 p-6">
            <h3 className="font-serif text-lg font-bold text-stone-100">Histórico de Disparos do Robô</h3>
            <div className="mt-4 space-y-3">
              {dashboard.runs.length ? (
                dashboard.runs.map((run) => (
                  <div
                    key={run.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-800 bg-stone-950/80 p-4"
                  >
                    <div>
                      <strong className="text-stone-200">
                        #{String(run.message?.order || '0').padStart(2, '0')} {run.message?.title || 'Série Parousia'}
                      </strong>
                      <p className="mt-1 text-xs text-stone-500">
                        Disparado em: {new Date(run.startedAt).toLocaleString('pt-BR', { timeZone: 'America/Porto_Velho' })} (horário local)
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          run.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : run.status === 'RUNNING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {run.status === 'COMPLETED' ? 'Concluído' : run.status === 'RUNNING' ? 'Em execução' : 'Falha'}
                      </span>
                      <span className="text-sm text-stone-300">
                        {run.sentCount} enviados · {run.failedCount} falhas
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-500">Nenhum disparo registrado até o momento.</p>
              )}
            </div>
          </section>

          {/* Lista de Assinantes */}
          <section className="rounded-3xl border border-stone-800 bg-stone-900/60 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-100">
                Lista de Assinantes ({dashboard.subscribers.length})
              </h3>
              <span className="text-xs text-stone-400">
                Inscrições realizadas no hotsite da série
              </span>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-stone-500">
                  <tr className="border-b border-stone-800">
                    <th className="pb-3">Nome</th>
                    <th className="pb-3">E-mail</th>
                    <th className="pb-3">Data de Inscrição</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {dashboard.subscribers.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-800/30">
                      <td className="py-3 font-medium text-stone-200">{item.name || '—'}</td>
                      <td className="py-3 text-stone-300">{item.email}</td>
                      <td className="py-3 text-xs text-stone-500">
                        {new Date(item.subscribedAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            item.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-stone-800 text-stone-500'
                          }`}
                        >
                          {item.active ? 'Ativo' : 'Desativado'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          disabled={busy}
                          onClick={() => toggleSubscriber(item.id, !item.active)}
                          className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                        >
                          {item.active ? 'Desativar' : 'Reativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
