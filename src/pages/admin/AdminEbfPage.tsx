import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Download, FileText, Loader2, MessageCircle, Search, Trash2, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getAdminAccessToken } from '../../lib/admin/session';

type Edition = { id: string; slug: string; name: string; year: number | null; status: string; registrationCount: number };
type Row = { id: number; childName: string; age: number; colorGroup: string; guardianName: string; phone: string; visitor: boolean; createdAt: string };
const colors: Record<string, string> = { Amarelo: '#eab308', Verde: '#16a34a', Azul: '#2563eb', Vermelho: '#dc2626' };
const phone = (value: string) => { const digits = value.replace(/\D/g, ''); return digits.length === 11 ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}` : `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`; };

export default function AdminEbfPage() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [editionId, setEditionId] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('Todos');
  const [visitor, setVisitor] = useState('Todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const request = useCallback(async (path: string, init?: RequestInit) => {
    const token = await getAdminAccessToken();
    const response = await fetch(`/api/admin/ebf${path}`, { ...init, headers: { ...(init?.headers || {}), Authorization: `Bearer ${token}` } });
    if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || 'Não foi possível concluir a operação.'); }
    return response;
  }, []);

  useEffect(() => { void (async () => { try { const data: Edition[] = await (await request('/editions')).json(); setEditions(data); setEditionId((current) => current || data[0]?.id || ''); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao carregar edições.'); } finally { setLoading(false); } })(); }, [request]);
  const loadRows = useCallback(async () => { if (!editionId) { setRows([]); return; } setLoading(true); setError(''); try { setRows(await (await request(`/editions/${editionId}/registrations`)).json()); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao carregar inscrições.'); } finally { setLoading(false); } }, [editionId, request]);
  useEffect(() => { void loadRows(); }, [loadRows]);

  const selectedEdition = editions.find((edition) => edition.id === editionId);
  const filtered = useMemo(() => rows.filter((row) => (group === 'Todos' || row.colorGroup === group) && (visitor === 'Todos' || (row.visitor ? 'Sim' : 'Não') === visitor) && `${row.childName} ${row.guardianName}`.toLowerCase().includes(query.toLowerCase())), [rows, group, visitor, query]);

  async function remove(id: number) { if (!confirm('Cancelar esta inscrição? O registro continuará preservado no histórico.')) return; try { await request(`/editions/${editionId}/registrations/${id}`, { method: 'DELETE' }); setNotice('Inscrição cancelada e preservada no histórico.'); await loadRows(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao cancelar inscrição.'); } }
  async function csv() { try { const response = await request(`/editions/${editionId}/export.csv`); const url = URL.createObjectURL(await response.blob()); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `inscricoes-ebf-${selectedEdition?.slug || 'historico'}.csv`; anchor.click(); URL.revokeObjectURL(url); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Erro ao exportar CSV.'); } }
  function pdf() { const doc = new jsPDF(); doc.setFillColor(6, 78, 59); doc.rect(0, 0, 210, 35, 'F'); doc.setTextColor(255); doc.setFontSize(20); doc.text('Igreja Batista Olaria', 14, 15); doc.setFontSize(13); doc.text(selectedEdition?.name || 'Histórico da EBF', 14, 25); doc.setTextColor(40); doc.setFontSize(10); doc.text(`Emitido em ${new Date().toLocaleString('pt-BR')} · Total: ${filtered.length}`, 14, 45); autoTable(doc, { startY: 52, head: [['Criança', 'Idade', 'Grupo', 'Responsável', 'Telefone', 'Visitante']], body: filtered.map((row) => [row.childName, String(row.age), row.colorGroup, row.guardianName, phone(row.phone), row.visitor ? 'Sim' : 'Não']), theme: 'grid', headStyles: { fillColor: '#065f46' }, styles: { fontSize: 8 } }); doc.save(`inscricoes-ebf-${selectedEdition?.slug || 'historico'}.pdf`); }

  return <main className="min-h-screen bg-stone-100 text-stone-900"><Helmet><title>Histórico da EBF — Central Administrativa</title></Helmet><header className="bg-emerald-950 px-5 py-6 text-white"><div className="mx-auto flex max-w-7xl items-center gap-4"><Link to="/admin" className="rounded-lg border border-white/30 p-2" aria-label="Voltar"><ArrowLeft /></Link><div><p className="text-xs font-bold uppercase tracking-widest text-amber-400">Central Administrativa</p><h1 className="text-2xl font-black">Histórico da EBF</h1></div></div></header><section className="mx-auto max-w-7xl p-5">
    {notice && <p className="mb-4 rounded-xl bg-emerald-100 p-3 text-emerald-900">{notice}</p>}{error && <p className="mb-4 rounded-xl bg-red-100 p-3 text-red-900">{error}</p>}
    <div className="mb-5 rounded-2xl bg-white p-5 shadow"><label className="text-sm font-bold text-stone-600">Edição<select value={editionId} onChange={(event) => setEditionId(event.target.value)} className="mt-2 block w-full rounded-xl border p-3 md:max-w-xl">{editions.map((edition) => <option key={edition.id} value={edition.id}>{edition.name} — {edition.registrationCount} inscrição(ões)</option>)}</select></label>{selectedEdition && <p className="mt-2 text-sm text-stone-500">Status: {selectedEdition.status}. Cada edição possui uma lista independente.</p>}</div>
    {loading ? <div className="grid place-items-center py-20"><Loader2 className="animate-spin" /></div> : <><div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6"><Card title="Total" value={rows.length} icon={<Users />} /><Card title="Visitantes" value={rows.filter((row) => row.visitor).length} />{Object.keys(colors).map((color) => <Card key={color} title={color} value={rows.filter((row) => row.colorGroup === color).length} color={colors[color]} />)}</div><div className="my-5 flex flex-wrap gap-3 rounded-2xl bg-white p-4 shadow"><label className="relative min-w-64 flex-1"><Search className="absolute left-3 top-3" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-xl border p-3 pl-10" placeholder="Buscar criança ou responsável" /></label><select className="rounded-xl border p-3" value={group} onChange={(event) => setGroup(event.target.value)}><option>Todos</option>{Object.keys(colors).map((color) => <option key={color}>{color}</option>)}</select><select className="rounded-xl border p-3" value={visitor} onChange={(event) => setVisitor(event.target.value)}><option>Todos</option><option>Sim</option><option>Não</option></select><button onClick={pdf} disabled={!editionId} className="flex items-center gap-2 rounded-xl bg-red-700 px-4 font-bold text-white"><FileText size={18} /> PDF</button><button onClick={() => void csv()} disabled={!editionId} className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 font-bold"><Download size={18} /> CSV</button></div><div className="overflow-x-auto rounded-2xl bg-white shadow"><table className="w-full text-left text-sm"><thead><tr className="bg-stone-800 text-white">{['Criança', 'Grupo', 'Responsável', 'Contato', 'Visitante', 'Inscrição', ''].map((heading) => <th className="p-3" key={heading}>{heading}</th>)}</tr></thead><tbody>{filtered.map((row) => <tr className="border-b" key={row.id}><td className="p-3 font-bold">{row.childName}<small className="block font-normal text-stone-500">{row.age} anos</small></td><td className="p-3"><span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: colors[row.colorGroup] }}>{row.colorGroup}</span></td><td className="p-3">{row.guardianName}</td><td className="p-3"><a className="flex items-center gap-2 text-emerald-700" target="_blank" rel="noreferrer" href={`https://wa.me/55${row.phone}`}><MessageCircle size={16} />{phone(row.phone)}</a></td><td className="p-3">{row.visitor ? 'Sim' : 'Não'}</td><td className="p-3">{new Date(row.createdAt).toLocaleString('pt-BR')}</td><td className="p-3"><button onClick={() => void remove(row.id)} title="Cancelar" className="rounded-lg p-2 text-red-700"><Trash2 size={18} /></button></td></tr>)}</tbody></table>{!filtered.length && <p className="p-10 text-center text-stone-500">Nenhuma inscrição nesta edição.</p>}</div></>}
  </section></main>;
}

function Card({ title, value, color, icon }: { title: string; value: number; color?: string; icon?: React.ReactNode }) { return <div className="rounded-2xl bg-white p-4 shadow" style={{ borderTop: `4px solid ${color || '#065f46'}` }}><div className="flex justify-between text-stone-500"><span>{title}</span>{icon}</div><strong className="mt-2 block text-3xl">{value}</strong></div>; }
