import React from 'react';
import { MapPinned } from 'lucide-react';
import { cn } from '@/lib/utils';

const AppLogo = ({ compact = false, className, markClassName, textClassName }) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-blue-600 to-slate-950 text-white shadow-lg shadow-sky-500/20 ring-1 ring-white/60',
          compact && 'size-9 rounded-xl',
          markClassName
        )}
      >
        <MapPinned className={cn('size-5', compact && 'size-4')} />
      </div>
      <div className={cn('flex flex-col leading-tight', textClassName)}>
        <span className={cn('text-[0.7rem] font-medium uppercase tracking-[0.3em] text-slate-400', compact && 'text-[0.62rem]')}>
          Campus
        </span>
        <span className={cn('text-base font-semibold tracking-tight text-slate-950', compact && 'text-sm')}>
          Guide
        </span>
      </div>
    </div>
  );
};

export default AppLogo;
