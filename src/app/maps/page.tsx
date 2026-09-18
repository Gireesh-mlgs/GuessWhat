import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { ComingSoonCard } from '@/components/shared/ComingSoonCard';
import { ArrowLeft, Lock, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Map Games — GuessWhat',
  description: 'How well do you know the world? Test your geography trivia on GuessWhat.',
};

export default function MapsCategoryPage() {
  return (
    <div className="relative flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto w-full space-y-10">
      {/* Back button */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Categories</span>
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        badge="Category"
        badgeEmoji="🌍"
        title="MAPS 🌍"
        subtitle="How well do you know the world? Test your knowledge of cities, landmarks, borders, and hidden corners of the globe."
      />

      {/* Featured Game in Development */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-7 sm:p-9 border-2 border-emerald-300 shadow-[0_8px_30px_rgba(16,185,129,0.08)] space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-3xl">
                🌍
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Guess the Place</h2>
                <p className="text-xs text-emerald-700 font-bold">Geography & Landmarks</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full font-black bg-emerald-100 text-emerald-950 border border-emerald-300 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Coming Soon</span>
            </span>
          </div>

          <p className="text-sm text-slate-600 font-semibold leading-relaxed">
            Can you pinpoint famous landmarks, natural wonders, and world capitals from high-res satellite views and street panoramas? World-scale geography challenges are coming to GuessWhat.
          </p>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>In active development for upcoming release</span>
            </div>
            <button
              disabled
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 border-2 border-slate-200 text-slate-400 font-black text-xs cursor-not-allowed uppercase tracking-wider"
            >
              PLAY MAPS (COMING SOON)
            </button>
          </div>
        </div>
      </div>

      {/* Future sub-modes */}
      <div className="w-full max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
          Planned Map Games
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ComingSoonCard
            title="World Capitals"
            emoji="🏛️"
            description="Test your mental atlas by naming national capitals from skyline outlines and aerial photos."
            category="Maps"
          />
          <ComingSoonCard
            title="Flag Frenzy"
            emoji="🚩"
            description="Rapid-fire identification of country and territory flags across all 7 continents."
            category="Maps"
          />
        </div>
      </div>
    </div>
  );
}
