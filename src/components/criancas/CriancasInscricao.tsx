import { useState, type FormEvent } from 'react';
import { AlertCircle, Baby, CheckCircle2, Croissant, CupSoda, Loader2, Mail, Phone, Plus, Send, Trash2, User, Users, UtensilsCrossed } from 'lucide-react';

type MemberDraft = { name: string; age: string };
type MemberSummary = { name: string; age: number };

interface SubmittedSummary {
  guardianName: string;
  phone: string;
  brings: string[];
  children: MemberSummary[];
  familyMembers: MemberSummary[];
}

const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

function parseMembers(rows: MemberDraft[], kind: 'children' | 'familyMembers'): MemberSummary[] | string {
  const ageLimit = kind === 'children' ? 17 : 120;
  const members: MemberSummary[] = [];
  for (const row of rows) {
    const name = row.name.trim();
    if (!name && row.age.trim() === '') continue;
    if (name.length < 2) return 'Informe o nome completo de cada pessoa (mínimo 2 letras).';
    const age = Number(row.age);
    if (!Number.isInteger(age) || age < 0 || age > ageLimit) return 'Confira as idades informadas.';
    members.push({ name, age });
  }
  return members;
}

const emptyChild = (): MemberDraft => ({ name: '', age: '' });

export default function CriancasInscricao() {
  const [guardianName, setGuardianName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [children, setChildren] = useState<MemberDraft[]>([emptyChild()]);
  const [familyMembers, setFamilyMembers] = useState<MemberDraft[]>([]);
  const [brings, setBrings] = useState({ breakfast: false, sideDish: false, drink: false });
  const [bringsDetails, setBringsDetails] = useState({ breakfast: '', sideDish: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [summary, setSummary] = useState<SubmittedSummary | null>(null);

  function updateMember(list: 'children' | 'familyMembers', index: number, patch: Partial<MemberDraft>) {
    const setter = list === 'children' ? setChildren : setFamilyMembers;
    setter((current) => current.map((member, position) => (position === index ? { ...member, ...patch } : member)));
  }

  function addMember(list: 'children' | 'familyMembers') {
    const setter = list === 'children' ? setChildren : setFamilyMembers;
    setter((current) => [...current, emptyChild()]);
  }

  function removeMember(list: 'children' | 'familyMembers', index: number) {
    const setter = list === 'children' ? setChildren : setFamilyMembers;
    setter((current) => current.filter((_, position) => position !== index));
  }

  function resetForm() {
    setGuardianName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setChildren([emptyChild()]);
    setFamilyMembers([]);
    setBrings({ breakfast: false, sideDish: false, drink: false });
    setBringsDetails({ breakfast: '', sideDish: '' });
    setStatus('idle');
    setErrorMessage('');
    setSummary(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');

    if (guardianName.trim().length < 3) { setStatus('error'); setErrorMessage('Informe o nome do responsável.'); return; }
    if (phone.replace(/\D/g, '').length < 10) { setStatus('error'); setErrorMessage('Informe um telefone com DDD.'); return; }

    const parsedChildren = parseMembers(children, 'children');
    if (typeof parsedChildren === 'string') { setStatus('error'); setErrorMessage(parsedChildren); return; }
    const parsedFamily = parseMembers(familyMembers, 'familyMembers');
    if (typeof parsedFamily === 'string') { setStatus('error'); setErrorMessage(parsedFamily); return; }

    setStatus('sending');
    try {
      const breakfastItems = brings.breakfast ? bringsDetails.breakfast.trim() : '';
      const sideDishItems = brings.sideDish ? bringsDetails.sideDish.trim() : '';
      const bringsSummary = [
        brings.breakfast ? `Café da manhã${breakfastItems ? `: ${breakfastItems}` : ''}` : '',
        brings.sideDish ? `Acompanhamento do almoço${sideDishItems ? `: ${sideDishItems}` : ''}` : '',
        brings.drink ? 'Refrigerante / suco' : '',
      ].filter(Boolean);
      const response = await fetch('/api/criancas/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianName: guardianName.trim(),
          phone: phone.replace(/\D/g, ''),
          email: email.trim() || undefined,
          notes: notes.trim() || undefined,
          bringsBreakfast: brings.breakfast,
          bringsSideDish: brings.sideDish,
          bringsDrink: brings.drink,
          breakfastItems: breakfastItems || undefined,
          sideDishItems: sideDishItems || undefined,
          children: parsedChildren,
          familyMembers: parsedFamily,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Não foi possível concluir a inscrição.');
      setSummary({ guardianName: guardianName.trim(), phone: phone.trim(), brings: bringsSummary, children: parsedChildren, familyMembers: parsedFamily });
      setStatus('success');
    } catch (cause) {
      setStatus('error');
      setErrorMessage(cause instanceof Error ? cause.message : 'Não foi possível concluir a inscrição.');
    }
  }

  return (
    <section id="inscricao" className="scroll-mt-6 bg-gradient-to-b from-amber-50 to-sky-100 px-5 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.24em] text-sky-700">Inscrições</p>
          <h2 className="mt-2 font-serif text-4xl font-bold text-stone-900 md:text-5xl">Faça sua inscrição</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
            As inscrições deverão ser realizadas até o dia <strong>08 de outubro</strong>. Não deixe para a última hora!
            A confirmação é importante para organizarmos toda a programação e alimentação do evento.
            Vai sozinho(a) ou só com adultos? Sem problema — basta informar seus dados como responsável.
          </p>
        </div>

        {status === 'success' && summary ? (
          <div className="mt-10 rounded-[2.5rem] border-4 border-emerald-300 bg-white p-8 text-center shadow-xl md:p-12">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 aria-hidden="true" className="h-9 w-9" />
            </span>
            <h3 className="mt-5 font-serif text-3xl font-bold text-stone-900">Inscrição confirmada!</h3>
            <p className="mt-3 text-lg text-stone-600">
              Obrigado, <strong>{summary.guardianName.split(' ')[0]}</strong>! Recebemos a sua inscrição.
              {email.trim() ? ' Enviamos os detalhes para o seu e-mail.' : ''}
            </p>

            <div className="mx-auto mt-6 max-w-xl space-y-4 text-left">
              {summary.children.length > 0 && (
                <div className="rounded-3xl bg-emerald-50 p-5">
                  <p className="flex items-center gap-2 font-black text-emerald-900"><Baby aria-hidden="true" className="h-5 w-5" /> Crianças</p>
                  <ul className="mt-2 space-y-1 text-emerald-900">
                    {summary.children.map((child) => <li key={`${child.name}-${child.age}`}>{child.name} — {child.age} ano(s)</li>)}
                  </ul>
                </div>
              )}
              {summary.children.length === 0 && summary.familyMembers.length === 0 && (
                <div className="rounded-3xl bg-emerald-50 p-5 text-emerald-900">
                  <p className="font-black">Participação individual</p>
                  <p className="mt-1 text-sm">Você está inscrito(a) como participante do evento.</p>
                </div>
              )}
              {summary.familyMembers.length > 0 && (
                <div className="rounded-3xl bg-sky-50 p-5">
                  <p className="flex items-center gap-2 font-black text-sky-900"><Users aria-hidden="true" className="h-5 w-5" /> Demais familiares</p>
                  <ul className="mt-2 space-y-1 text-sky-900">
                    {summary.familyMembers.map((member) => <li key={`${member.name}-${member.age}`}>{member.name} — {member.age} ano(s)</li>)}
                  </ul>
                </div>
              )}
              {summary.brings.length > 0 && (
                <div className="rounded-3xl bg-amber-50 p-5">
                  <p className="flex items-center gap-2 font-black text-amber-900"><Croissant aria-hidden="true" className="h-5 w-5" /> O que será levado</p>
                  <ul className="mt-2 space-y-1 text-amber-900">
                    {summary.brings.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <p className="mt-4 text-sm font-bold text-emerald-700">Você, responsável, também está contabilizado como participante do evento.</p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button type="button" onClick={resetForm} className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 font-black text-amber-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-300">
                <Plus aria-hidden="true" className="h-4 w-4" /> Inscrever outra família
              </button>
              <a href="#programacao" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3.5 font-bold text-white shadow transition hover:-translate-y-0.5 hover:bg-emerald-500">
                Ver programação
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-10 space-y-8 rounded-[2.5rem] border-4 border-sky-200 bg-white p-6 shadow-xl md:p-10">
            <fieldset className="space-y-4">
              <legend className="flex items-center gap-2 text-lg font-black text-stone-900">
                <User aria-hidden="true" className="h-5 w-5 text-sky-600" /> Responsável
              </legend>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-stone-600">Nome completo *</span>
                  <input value={guardianName} onChange={(event) => setGuardianName(event.target.value)} required minLength={3} className="mt-1 w-full rounded-2xl border-2 border-stone-200 p-3 outline-none transition focus:border-sky-400" placeholder="Seu nome" />
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-stone-600">WhatsApp *</span>
                  <div className="relative mt-1">
                    <Phone aria-hidden="true" className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                    <input value={phone} onChange={(event) => setPhone(maskPhone(event.target.value))} required inputMode="tel" className="w-full rounded-2xl border-2 border-stone-200 p-3 pl-10 outline-none transition focus:border-sky-400" placeholder="(69) 99999-9999" />
                  </div>
                </label>
              </div>
              <label className="block">
                <span className="text-sm font-bold text-stone-600">E-mail (opcional — para enviarmos a confirmação)</span>
                <div className="relative mt-1">
                  <Mail aria-hidden="true" className="absolute left-3 top-3.5 h-4 w-4 text-stone-400" />
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-2xl border-2 border-stone-200 p-3 pl-10 outline-none transition focus:border-sky-400" placeholder="seuemail@exemplo.com" />
                </div>
              </label>
            </fieldset>

            <fieldset className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="flex items-center gap-2 text-lg font-black text-stone-900">
                  <Baby aria-hidden="true" className="h-5 w-5 text-rose-500" /> Crianças (opcional)
                </legend>
                <button type="button" onClick={() => addMember('children')} disabled={children.length >= 10} className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700 transition hover:bg-rose-200 disabled:opacity-40">
                  <Plus aria-hidden="true" className="h-4 w-4" /> Adicionar criança
                </button>
              </div>
              <p className="text-sm text-stone-500">Opcional. Se você vai sozinho(a) ou apenas com outros adultos, deixe esta seção em branco.</p>
              {children.map((child, index) => (
                <div key={index} className="grid gap-3 rounded-3xl bg-rose-50 p-4 md:grid-cols-[1fr_120px_44px]">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-rose-700">Nome da criança</span>
                    <input value={child.name} onChange={(event) => updateMember('children', index, { name: event.target.value })} className="mt-1 w-full rounded-2xl border-2 border-rose-200 p-3 outline-none transition focus:border-rose-400" placeholder="Nome completo" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-rose-700">Idade</span>
                    <input type="number" min={0} max={17} value={child.age} onChange={(event) => updateMember('children', index, { age: event.target.value })} className="mt-1 w-full rounded-2xl border-2 border-rose-200 p-3 outline-none transition focus:border-rose-400" placeholder="0" />
                  </label>
                  <button type="button" onClick={() => removeMember('children', index)} aria-label="Remover criança" className="mt-6 grid h-11 w-11 place-items-center rounded-2xl bg-white text-rose-500 shadow transition hover:bg-rose-100">
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </fieldset>

            <fieldset className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="flex items-center gap-2 text-lg font-black text-stone-900">
                  <Users aria-hidden="true" className="h-5 w-5 text-sky-600" /> Demais familiares
                </legend>
                <button type="button" onClick={() => addMember('familyMembers')} disabled={familyMembers.length >= 15} className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-4 py-2 text-sm font-bold text-sky-700 transition hover:bg-sky-200 disabled:opacity-40">
                  <Plus aria-hidden="true" className="h-4 w-4" /> Adicionar familiar
                </button>
              </div>
              <p className="text-sm text-stone-500">Opcional. Você, responsável, já está contabilizado como participante — liste abaixo apenas os demais familiares que vão (cônjuge, avós, tios, irmãos...) sem se repetir.</p>
              {familyMembers.length === 0 && <p className="rounded-2xl bg-stone-50 p-4 text-sm font-bold text-stone-400">Nenhum familiar adicionado.</p>}
              {familyMembers.map((member, index) => (
                <div key={index} className="grid gap-3 rounded-3xl bg-sky-50 p-4 md:grid-cols-[1fr_120px_44px]">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-sky-700">Nome do familiar</span>
                    <input value={member.name} onChange={(event) => updateMember('familyMembers', index, { name: event.target.value })} className="mt-1 w-full rounded-2xl border-2 border-sky-200 p-3 outline-none transition focus:border-sky-400" placeholder="Nome completo" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-sky-700">Idade</span>
                    <input type="number" min={0} max={120} value={member.age} onChange={(event) => updateMember('familyMembers', index, { age: event.target.value })} className="mt-1 w-full rounded-2xl border-2 border-sky-200 p-3 outline-none transition focus:border-sky-400" placeholder="0" />
                  </label>
                  <button type="button" onClick={() => removeMember('familyMembers', index)} aria-label="Remover familiar" className="mt-6 grid h-11 w-11 place-items-center rounded-2xl bg-white text-sky-500 shadow transition hover:bg-sky-100">
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="flex items-center gap-2 text-lg font-black text-stone-900">O que a família vai levar?</legend>
              <p className="text-sm text-stone-500">Marque os itens que a sua família levará e informe o que trará — isso nos ajuda a organizar o café da manhã, o churrasco e a evitar repetições.</p>
              <div className="grid gap-3 md:grid-cols-3">
                <div className={`rounded-2xl border-2 p-4 transition ${brings.breakfast ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                  <label className="flex cursor-pointer items-center gap-3 font-bold">
                    <input type="checkbox" checked={brings.breakfast} onChange={(event) => setBrings((current) => ({ ...current, breakfast: event.target.checked }))} className="h-5 w-5 accent-emerald-600" />
                    <Croissant aria-hidden="true" className="h-5 w-5" /> Café da manhã
                  </label>
                  {brings.breakfast && (
                    <input value={bringsDetails.breakfast} onChange={(event) => setBringsDetails((current) => ({ ...current, breakfast: event.target.value }))} maxLength={200} placeholder="O que você levará? Ex.: pão, bolo, frutas..." className="mt-3 w-full rounded-xl border-2 border-emerald-200 bg-white p-3 text-sm font-medium text-stone-700 outline-none transition focus:border-emerald-400" />
                  )}
                </div>
                <div className={`rounded-2xl border-2 p-4 transition ${brings.sideDish ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                  <label className="flex cursor-pointer items-center gap-3 font-bold">
                    <input type="checkbox" checked={brings.sideDish} onChange={(event) => setBrings((current) => ({ ...current, sideDish: event.target.checked }))} className="h-5 w-5 accent-emerald-600" />
                    <UtensilsCrossed aria-hidden="true" className="h-5 w-5" /> Acompanhamento do almoço
                  </label>
                  {brings.sideDish && (
                    <input value={bringsDetails.sideDish} onChange={(event) => setBringsDetails((current) => ({ ...current, sideDish: event.target.value }))} maxLength={200} placeholder="O que você levará? Ex.: farofa, salada, arroz..." className="mt-3 w-full rounded-xl border-2 border-emerald-200 bg-white p-3 text-sm font-medium text-stone-700 outline-none transition focus:border-emerald-400" />
                  )}
                </div>
                <div className={`rounded-2xl border-2 p-4 transition ${brings.drink ? 'border-emerald-400 bg-emerald-50 text-emerald-900' : 'border-stone-200 bg-stone-50 text-stone-600'}`}>
                  <label className="flex cursor-pointer items-center gap-3 font-bold">
                    <input type="checkbox" checked={brings.drink} onChange={(event) => setBrings((current) => ({ ...current, drink: event.target.checked }))} className="h-5 w-5 accent-emerald-600" />
                    <CupSoda aria-hidden="true" className="h-5 w-5" /> Refrigerante / suco
                  </label>
                </div>
              </div>
              <label className="block pt-2">
                <span className="text-sm font-bold text-stone-600">Observações (opcional)</span>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={500} rows={3} className="mt-1 w-full rounded-2xl border-2 border-stone-200 p-3 outline-none transition focus:border-sky-400" placeholder="Restrições alimentares, necessidades especiais ou algum recado para a equipe." />
              </label>
            </fieldset>

            {status === 'error' && (
              <p className="flex items-start gap-2 rounded-2xl bg-red-100 p-4 font-bold text-red-800">
                <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" /> {errorMessage}
              </p>
            )}

            <button type="submit" disabled={status === 'sending'} className="flex w-full items-center justify-center gap-2 rounded-full bg-sky-600 px-7 py-4 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60">
              {status === 'sending' ? <><Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" /> Enviando inscrição...</> : <><Send aria-hidden="true" className="h-5 w-5" /> Confirmar inscrição</>}
            </button>
            <p className="text-center text-xs text-stone-400">Ao enviar, você concorda com o uso dos dados informados exclusivamente para a organização do evento.</p>
          </form>
        )}
      </div>
    </section>
  );
}
