import React from 'react';

export interface PageHeaderProps {
  badge?: string;
  badgeEmoji?: string;
  title: string;
  subtitle: string;
}

export function PageHeader({ badge, badgeEmoji, title, subtitle }: PageHeaderProps) {
  return (
    <div className="text-center space-y-3 max-w-xl mx-auto">
      {badge && (
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-950 text-xs font-black shadow-2xs">
          {badgeEmoji && <span>{badgeEmoji}</span>}
          <span>{badge}</span>
        </div>
      )}
      <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
        {title}
      </h1>
      <p className="text-sm sm:text-base text-slate-600 font-semibold leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}
