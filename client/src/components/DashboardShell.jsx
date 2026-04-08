import React from 'react';
import { LogOut } from 'lucide-react';
import AppLogo from '@/components/AppLogo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const roleBadgeStyles = {
  student: 'border-sky-200 bg-sky-50 text-sky-700',
  owner: 'border-amber-200 bg-amber-50 text-amber-700',
  admin: 'border-violet-200 bg-violet-50 text-violet-700',
};

const DashboardShell = ({
  user,
  role,
  roleLabel,
  title,
  description,
  onLogout,
  headerAction,
  children,
}) => {
  return (
    <div className="relative min-h-[100dvh] bg-stone-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.18),transparent_58%)]" />

      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <AppLogo compact />

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">Campus Guide workspace</p>
            </div>

            <Badge
              variant="outline"
              className={cn(
                'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]',
                roleBadgeStyles[role]
              )}
            >
              {roleLabel}
            </Badge>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="h-10 rounded-full border-white/80 bg-white/80 px-4 text-slate-600 shadow-sm hover:bg-white hover:text-slate-950"
            >
              <LogOut className="size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Badge
              variant="outline"
              className="mb-3 rounded-full border-white/80 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 shadow-sm"
            >
              {roleLabel} workspace
            </Badge>
            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
          </div>

          {headerAction && <div className="flex shrink-0">{headerAction}</div>}
        </div>

        {children}
      </main>
    </div>
  );
};

export default DashboardShell;
