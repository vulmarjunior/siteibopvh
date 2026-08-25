import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  category?: string;
  icon?: LucideIcon;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function AdminPageHeader({
  title,
  description,
  category,
  icon: Icon,
  badge,
  actions,
  children,
}: AdminPageHeaderProps) {
  return (
    <header className="mb-6 rounded-2xl border border-stone-800/80 bg-stone-900/60 p-6 backdrop-blur shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {category && (
            <p className="text-xs font-bold uppercase tracking-[.2em] text-amber-500 mb-1">
              {category}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <h1 className="font-serif text-2xl font-bold tracking-tight text-stone-100 sm:text-3xl">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="mt-2 text-sm text-stone-400 max-w-3xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      {children && <div className="mt-5 border-t border-stone-800/60 pt-4">{children}</div>}
    </header>
  );
}
