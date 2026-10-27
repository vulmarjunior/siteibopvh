import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { EbdAdminStatus } from '../../../types/ebd-admin';

const STATUS_LABELS: Record<EbdAdminStatus, string> = {
  DRAFT: 'Rascunho',
  REVIEW: 'Em revisão',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Arquivado',
};

const STATUS_CLASSES: Record<EbdAdminStatus, string> = {
  DRAFT: 'bg-stone-200 text-stone-800',
  REVIEW: 'bg-amber-100 text-amber-900',
  PUBLISHED: 'bg-emerald-100 text-emerald-900',
  ARCHIVED: 'bg-stone-300 text-stone-700',
};

export function EbdStatusBadge({ status }: { status: EbdAdminStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

export function AdminEbdPageHeader({
  title,
  subtitle,
  backTo = '/admin',
  backLabel = 'Central Administrativa',
  actions,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="bg-stone-950 px-5 py-6 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4">
        <Link to={backTo} className="rounded-lg border border-white/30 p-2" aria-label={backLabel}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">EBD Digital</p>
          <h1 className="mt-1 font-serif text-2xl font-black leading-tight sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-stone-300">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}

export function formatEbdDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('pt-BR');
}

export function formatEbdBytes(bytes: number | null | undefined): string {
  if (!bytes || bytes < 1) return '—';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} MB`;
}

export function EbdFeedback({ error, notice }: { error?: string | null; notice?: string | null }) {
  return (
    <>
      {notice ? <p className="mb-4 rounded-xl bg-emerald-100 p-3 text-sm text-emerald-900">{notice}</p> : null}
      {error ? <p className="mb-4 rounded-xl bg-red-100 p-3 text-sm text-red-900">{error}</p> : null}
    </>
  );
}
