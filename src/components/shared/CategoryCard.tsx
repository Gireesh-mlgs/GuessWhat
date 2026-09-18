import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface CategoryCardProps {
  title: string;
  emoji: string;
  description: string;
  buttonText: string;
  href: string;
  badge?: string;
  theme: 'music' | 'movies' | 'maps';
}

const themeStyles = {
  music: {
    cardBorder: 'border-amber-300 hover:border-amber-400',
    cardShadow: 'shadow-[0_8px_30px_rgba(245,158,11,0.09)]',
    iconBg: 'bg-amber-100 border-amber-300 text-amber-600',
    badgeBg: 'bg-amber-100 text-amber-950 border-amber-300',
    btnGradient: 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-amber-400/25 border-amber-400',
    accentText: 'text-amber-600',
  },
  movies: {
    cardBorder: 'border-purple-300 hover:border-purple-400',
    cardShadow: 'shadow-[0_8px_30px_rgba(168,85,247,0.09)]',
    iconBg: 'bg-purple-100 border-purple-300 text-purple-600',
    badgeBg: 'bg-purple-100 text-purple-950 border-purple-300',
    btnGradient: 'bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 text-white shadow-purple-500/25 border-purple-400',
    accentText: 'text-purple-600',
  },
  maps: {
    cardBorder: 'border-emerald-300 hover:border-emerald-400',
    cardShadow: 'shadow-[0_8px_30px_rgba(16,185,129,0.09)]',
    iconBg: 'bg-emerald-100 border-emerald-300 text-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    btnGradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white shadow-emerald-500/25 border-emerald-400',
    accentText: 'text-emerald-600',
  },
};

export function CategoryCard({
  title,
  emoji,
  description,
  buttonText,
  href,
  badge,
  theme,
}: CategoryCardProps) {
  const styles = themeStyles[theme];

  return (
    <div
      className={`bg-white rounded-3xl p-7 sm:p-8 border-2 ${styles.cardBorder} ${styles.cardShadow} flex flex-col justify-between relative group transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div
            className={`w-14 h-14 rounded-2xl ${styles.iconBg} border-2 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform`}
          >
            <span role="img" aria-label={title}>{emoji}</span>
          </div>

          {badge && (
            <span
              className={`text-[11px] px-3 py-1 rounded-full font-black border uppercase tracking-wider ${styles.badgeBg}`}
            >
              {badge}
            </span>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{emoji}</span>
            <span>{title}</span>
          </h2>
          <p className="text-sm text-slate-600 font-semibold mt-2 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-slate-100">
        <Link
          href={href}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-md border btn-tactile ${styles.btnGradient}`}
        >
          <span>{buttonText}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
        </Link>
      </div>
    </div>
  );
}
