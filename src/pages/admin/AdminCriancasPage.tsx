import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ArrowLeft, Baby, Download, FileText, Loader2, MessageCircle, Search, Trash2, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAdminAccessToken } from '../../lib/admin/session';

type Edition = { id: string; slug: string; name: string; year: number | null; status: string; registrationCount: number };
type Member = { id: number; kind: 'CRIANCA' | 'FAMILIAR'; name: string; age: number };
type Row = {
  id: number;
  guardianName: string;
  phone: string;
  email: string | null;
  bringsBreakfast: boolean;
  bringsSideDish: boolean;
  bringsDrink: boolean;
  breakfastItems: string | null;
  sideDishItems: string | null;
  notes: string | null;
  createdAt: string;
  members: Member[];
};

const phone = (value: string) => { const digits = value.replace(/\D/g, ''); return digits.length === 11 ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}` : `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`; };
const dateTime = (value: string) => new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

export default function AdminCriancasPage() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [editionId, setEditionId] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState('');
  const [brings, setBrings] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const request = useCallback(async (path: string, init?: RequestInit) => {
    const token = await getAdminAccessToken();
    const response = await fetch(`/api/admin/criancas${path}`, { ...init, headers: { ...(init?.headers || {}), Authorization: `Bearer ${token}` } });
    if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || 'Não foi possível concluir a operação.'); }
    return response;
  }, []);

  useEffect(() => { void (async () => { try { const data: Edition[] = await (await request('/editions')).json(); setEditions(data); setEditionId((current) => current || data[0]?.id || ''); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao carregar edições.'); } finally { setLoading(false); } })(); }, [request]);
  const loadRows = useCallback(async () => { if (!editionId) { setRows([]); return; } setLoading(true); setError(''); try { setRows(await (await request(`/editions/${editionId}/registrations`)).json()); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao carregar inscrições.'); } finally { setLoading(false); } }, [editionId, request]);
  useEffect(() => { void loadRows(); }, [loadRows]);

  const selectedEdition = editions.find((edition) => edition.id === editionId);
  const filtered = useMemo(() => rows.filter((row) => {
    const haystack = `${row.guardianName} ${row.members.map((member) => member.name).join(' ')}`.toLowerCase();
    const bringsMatch = brings === 'Todos'
      || (brings === 'Café da manhã' && row.bringsBreakfast)
      || (brings === 'Acompanhamento' && row.bringsSideDish)
      || (brings === 'Refrigerante/suco' && row.bringsDrink);
    return haystack.includes(query.toLowerCase()) && bringsMatch;
  }), [rows, query, brings]);

  const allMembers = useMemo(() => rows.flatMap((row) => row.members), [rows]);
  const childrenCount = allMembers.filter((member) => member.kind === 'CRIANCA').length;
  const peopleCount = allMembers.length + rows.length;

  async function remove(id: number) { if (!confirm('Cancelar esta inscrição? O registro continuará preservado no histórico.')) return; try { await request(`/editions/${editionId}/registrations/${id}`, { method: 'DELETE' }); setNotice('Inscrição cancelada e preservada no histórico.'); await loadRows(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao cancelar inscrição.'); } }
  async function csv() { try { const response = await request(`/editions/${editionId}/export.csv`); const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `inscricoes-dia-das-criancas-${selectedEdition?.slug || 'historico'}.csv`; anchor.click(); URL.revokeObjectURL(url); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao exportar CSV.'); } }
  function pdf() {
    const flag = (yes: boolean, items?: string | null) => yes ? (items ? `Sim: ${items}` : 'Sim') : '-';
    const doc = new jsPDF();
    doc.setFillColor(12, 74, 110);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255);
    doc.setFontSize(20);
    doc.text('Igreja Batista Olaria', 14, 15);
    doc.setFontSize(13);
    doc.text(selectedEdition?.name || 'Dia das Crianças', 14, 25);
    doc.setTextColor(40);
    doc.setFontSize(10);
    doc.text(`Emitido em ${new Date().toLocaleString('pt-BR')} · Famílias: ${filtered.length} · Crianças: ${filtered.reduce((total, row) => total + row.members.filter((member) => member.kind === 'CRIANCA').length, 0)} · Pessoas: ${filtered.reduce((total, row) => total + 1 + row.members.length, 0)}`, 14, 45);
    autoTable(doc, {
      startY: 52,
      head: [['Responsável', 'Contato', 'Papel', 'Nome', 'Idade', 'Café', 'Acomp.', 'Bebida']],
      body: filtered.flatMap((row) => [
        [
          row.guardianName,
          phone(row.phone),
          'Responsável',
          row.guardianName,
          '—',
          flag(row.bringsBreakfast, row.breakfastItems),
          flag(row.bringsSideDish, row.sideDishItems),
          row.bringsDrink ? 'Sim' : '-',
        ],
        ...row.members.map((member) => [
          row.guardianName,
          phone(row.phone),
          member.kind === 'CRIANCA' ? 'Criança' : 'Familiar',
          member.name,
          String(member.age),
          flag(row.bringsBreakfast, row.breakfastItems),
          flag(row.bringsSideDish, row.sideDishItems),
          row.bringsDrink ? 'Sim' : '-',
        ]),
      ]),
      theme: 'grid',
      headStyles: { fillColor: '#0c4a6e' },
      styles: { fontSize: 8 },
    });
    doc.save(`inscricoes-dia-das-criancas-${selectedEdition?.slug || 'historico'}.pdf`);
  }

  return <main className="min-h-screen bg-stone-100 text-stone-900">
    <Helmet><title>Inscrições Dia das Crianças — Central Administrativa</title></Helmet>
    <header className="bg-sky-950 px-5 py-6 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4">
        <Link to="/admin" className="rounded-lg border border-white/30 p-2" aria-label="Voltar"><ArrowLeft /></Link>
        <div><p className="text-xs font-bold uppercase tracking-widest text-amber-400">Central Administrativa</p><h1 className="text-2xl font-black">Inscrições — Dia das Crianças</h1></div>
      </div>
    </header>
    <section className="mx-auto max-w-7xl p-5">
      {notice && <p className="mb-4 rounded-xl bg-emerald-100 p-3 text-emerald-900">{notice}</p>}{error && <p className="mb-4 rounded-xl bg-red-100 p-3 text-red-900">{error}</p>}
      <div className="mb-5 rounded-2xl bg-white p-5 shadow">
        <label className="text-sm font-bold text-stone-600">Edição
          <select value={editionId} onChange={(event) => setEditionId(event.target.value)} className="mt-2 block w-full rounded-xl border p-3 md:max-w-xl">
            {editions.map((edition) => <option key={edition.id} value={edition.id}>{edition.name} — {edition.registrationCount} inscrição(ões)</option>)}
          </select>
        </label>
        {selectedEdition && <p className="mt-2 text-sm text-stone-500">Status: {selectedEdition.status}. Cada edição possui uma lista independente.</p>}
      </div>
      {loading ? <div className="grid place-items-center py-20"><Loader2 className="animate-spin" /></div> : <>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Card title="Famílias" value={rows.length} icon={<Users />} />
          <Card title="Crianças" value={childrenCount} icon={<Baby />} color="#e11d48" />
          <Card title="Pessoas" value={peopleCount} color="#0284c7" />
          <Card title="Café" value={rows.filter((row) => row.bringsBreakfast).length} color="#d97706" />
          <Card title="Acompanhamento" value={rows.filter((row) => row.bringsSideDish).length} color="#ea580c" />
          <Card title="Bebida" value={rows.filter((row) => row.bringsDrink).length} color="#7c3aed" />
        </div>
        <div className="my-5 flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow">
          <label className="relative min-w-64 flex-1">
            <Search className="absolute left-3 top-3" size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border p-3 pl-10" placeholder="Buscar responsável, criança ou familiar" />
          </label>
          <select className="rounded-xl border p-3" value={brings} onChange={(event) => setBrings(event.target.value)}>
            <option>Todos</option><option>Café da manhã</option><option>Acompanhamento</option><option>Refrigerante/suco</option>
          </select>
          <button onClick={pdf} disabled={!editionId} className="flex items-center gap-2 rounded-xl bg-red-700 px-4 font-bold text-white"><FileText size={18} /> PDF</button>
          <button onClick={() => void csv()} disabled={!editionId} className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 font-bold"><Download size={18} /> CSV</button>
        </div>
        <div className="overflow-x-auto rounded-2xl bg-white shadow">
          <table className="w-full text-left text-sm">
            <thead><tr className="bg-sky-950 text-white">{['Responsável', 'Contato', 'Crianças', 'Familiares', 'Leva', 'Inscrição', ''].map((heading) => <th className="p-3" key={heading}>{heading}</th>)}</tr></thead>
            <tbody>
              {filtered.map((row) => <tr className="border-b align-top" key={row.id}>
                <td className="p-3 font-bold">
                  {row.guardianName}
                  {row.notes && <small className="mt-1 block max-w-56 font-normal italic text-stone-500">Obs.: {row.notes}</small>}
                </td>
                <td className="p-3"><span className="block">{phone(row.phone)}</span>{row.email && <small className="text-stone-500">{row.email}</small>}</td>
                <td className="p-3">{row.members.filter((member) => member.kind === 'CRIANCA').map((member) => <span key={member.id} className="mb-1 block rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-800">{member.name} · {member.age} ano(s)</span>)}</td>
                <td className="p-3">{row.members.filter((member) => member.kind === 'FAMILIAR').map((member) => <span key={member.id} className="mb-1 block rounded-lg bg-sky-50 px-2 py-1 text-xs font-bold text-sky-800">{member.name} · {member.age} ano(s)</span>)}{row.members.every((member) => member.kind !== 'FAMILIAR') && <span className="text-xs text-stone-400">—</span>}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {row.bringsBreakfast && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Café</span>}
                    {row.bringsSideDish && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-800">Acomp.</span>}
                    {row.bringsDrink && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-800">Bebida</span>}
                    {!row.bringsBreakfast && !row.bringsSideDish && !row.bringsDrink && <span className="text-xs text-stone-400">—</span>}
                  </div>
                  {row.bringsBreakfast && row.breakfastItems && <small className="mt-1 block max-w-56 text-xs font-semibold text-amber-700">Café: {row.breakfastItems}</small>}
                  {row.bringsSideDish && row.sideDishItems && <small className="mt-1 block max-w-56 text-xs font-semibold text-orange-700">Acomp.: {row.sideDishItems}</small>}
                </td>
                <td className="p-3 text-xs text-stone-500">{dateTime(row.createdAt)}</td>
                <td className="p-3"><div className="flex gap-2">
                  <a href={`https://wa.me/55${row.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-emerald-600 p-2 text-white" aria-label={`Falar com ${row.guardianName} no WhatsApp`}><MessageCircle size={16} /></a>
                  <button onClick={() => void remove(row.id)} className="rounded-lg bg-stone-200 p-2 text-stone-700" aria-label={`Cancelar inscrição de ${row.guardianName}`}><Trash2 size={16} /></button>
                </div></td>
              </tr>)}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-stone-500">Nenhuma inscrição encontrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </>}
    </section>
  </main>;
}

function Card({ title, value, color, icon }: { title: string; value: number; color?: string; icon?: ReactNode }) { return <div className="rounded-2xl bg-white p-4 shadow" style={{ borderTop: `4px solid ${color || '#0c4a6e'}` }}><div className="flex justify-between text-stone-500"><span>{title}</span>{icon}</div><strong className="mt-2 block text-3xl">{value}</strong></div>; }
