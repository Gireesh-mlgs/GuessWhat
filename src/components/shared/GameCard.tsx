import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

export interface GameCardProps {
  title: string;
  emoji?: string;
  description: string;
  href: string;
  buttonText?: string;
  badge?: string;
  theme?: 'amber' | 'purple' | 'emerald';
}

export function GameCard({
  title,
  emoji = '🎮',
  description,
  href,
  buttonText = 'PLAY',
  badge,
  theme = 'amber',
}: GameCardProps) {
  const isAmber = theme === 'amber';
  const isPurple = theme === 'purple';

  const borderColor = isAmber
    ? 'border-amber-300 hover:border-amber-400'
    : isPurple
    ? 'border-purple-300 hover:border-purple-400'
    : 'border-emerald-300 hover:border-emerald-400';

  const badgeStyles = isAmber
    ? 'bg-amber-100 text-amber-950 border-amber-300'
    : isPurple
    ? 'bg-purple-100 text-purple-950 border-purple-300'
    : 'bg-emerald-100 text-emerald-950 border-emerald-300';

  const btnStyles = isAmber
    ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-amber-400/25 border-amber-400 hover:opacity-95'
    : isPurple
    ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white shadow-purple-500/25 border-purple-400 hover:opacity-95'
    : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-emerald-500/25 border-emerald-400 hover:opacity-95';

  return (
    <div
      className={`bg-white rounded-3xl p-7 sm:p-8 border-2 ${borderColor} shadow-[0_8px_30px_rgba(234,179,8,0.08)] flex flex-col justify-between relative group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl" role="img" aria-label={title}>{emoji}</span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
          </div>
          {badge && (
            <span
              className={`text-[11px] px-3 py-1 rounded-full font-black border uppercase tracking-wider ${badgeStyles}`}
            >
              {badge}
            </span>
          )}
        </div>

        <p className="text-sm text-slate-600 font-semibold leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100">
        <Link
          href={href}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md border btn-tactile ${btnStyles}`}
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
          <span>{buttonText}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
        </Link>
      </div>
    </div>
  );
}
