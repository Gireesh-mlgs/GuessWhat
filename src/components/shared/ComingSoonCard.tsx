import React from 'react';
import { Lock, Sparkles } from 'lucide-react';

export interface ComingSoonCardProps {
  title: string;
  emoji?: string;
  description: string;
  category?: string;
}

export function ComingSoonCard({
  title,
  emoji = '✨',
  description,
  category,
}: ComingSoonCardProps) {
  return (
    <div className="bg-white/80 rounded-3xl p-6 sm:p-7 border-2 border-dashed border-slate-200 shadow-sm flex flex-col justify-between relative select-none">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl opacity-75">{emoji}</span>
            <h4 className="text-lg font-black text-slate-700 tracking-tight">{title}</h4>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full font-black bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Coming Soon</span>
          </span>
        </div>

        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold">
        <span>{category ? `${category} &bull; In Development` : 'In Development'}</span>
        <Sparkles className="w-3.5 h-3.5 text-slate-400" />
      </div>
    </div>
  );
}
