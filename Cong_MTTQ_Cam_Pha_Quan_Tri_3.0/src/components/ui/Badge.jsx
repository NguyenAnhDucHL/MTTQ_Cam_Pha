import React from 'react';
import { cn } from '../../lib/utils';

export function Badge({ className, variant = 'default', children, ...props }) {
  const variants = {
    default: 'bg-slate-100 text-slate-800 border-transparent',
    success: 'bg-emerald-100 text-emerald-800 border-transparent',
    warning: 'bg-amber-100 text-amber-800 border-transparent',
    danger: 'bg-red-100 text-red-800 border-transparent',
    outline: 'text-slate-950 border-slate-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
