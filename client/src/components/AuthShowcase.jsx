import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import AppLogo from '@/components/AppLogo';
import { Badge } from '@/components/ui/badge';

const AuthShowcase = ({ badge, title, description, highlights, stats, footer }) => {
  return (
    <aside className="relative hidden min-h-[100dvh] overflow-hidden border-r border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(244,247,251,0.96))] px-10 py-8 lg:flex lg:flex-col lg:justify-between xl:px-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(59,130,246,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(148,163,184,0.14),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:34px_34px] opacity-35" />

      <div className="relative z-10 flex items-center justify-between">
        <AppLogo />
        <Badge
          variant="outline"
          className="rounded-full border-sky-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700 shadow-sm backdrop-blur"
        >
          {badge}
        </Badge>
      </div>

      <div className="relative z-10 max-w-xl space-y-8">
        <div className="space-y-4">
          <h2 className="max-w-lg text-5xl font-semibold tracking-[-0.05em] text-slate-950">
            {title}
          </h2>
          <p className="max-w-md text-base leading-7 text-slate-600">{description}</p>
        </div>

        <div className="grid gap-3">
          {highlights.map((highlight) => (
            <div
              key={highlight}
              className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm backdrop-blur"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <CheckCircle2 className="size-4" />
              </div>
              <span>{highlight}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 space-y-5">
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/70 bg-white/75 px-4 py-4 shadow-sm backdrop-blur"
              >
                <p className="text-2xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
        <p className="max-w-md text-sm leading-6 text-slate-500">{footer}</p>
      </div>
    </aside>
  );
};

export default AuthShowcase;
