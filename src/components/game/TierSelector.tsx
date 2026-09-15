'use client';

import React from 'react';
import { DifficultyTier, DIFFICULTY_MULTIPLIERS } from '@/lib/game/scoring';
import { Zap, ShieldCheck } from 'lucide-react';

interface TierSelectorProps {
  selectedTier: DifficultyTier;
  onSelectTier: (tier: DifficultyTier) => void;
  onConfirm: () => void;
  isLoading?: boolean;
  modeLabel?: string;
}

export function TierSelector({
  selectedTier,
  onSelectTier,
  onConfirm,
  isLoading = false,
  modeLabel = 'Daily Challenge',
}: TierSelectorProps) {
  const tiers: DifficultyTier[] = ['Easy', 'Medium', 'Hard', 'Expert', 'Impossible'];

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-[0_10px_35px_rgba(245,158,11,0.12)] space-y-6 animate-in fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-200 border-2 border-amber-400 text-amber-950 text-xs font-black uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          Choose Your Stakes
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Select Difficulty
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-bold">
          Tier is locked for your {modeLabel} run. Higher tiers award bigger score multipliers!
        </p>
      </div>

      <div className="space-y-2.5">
        {tiers.map((tier) => {
          const info = DIFFICULTY_MULTIPLIERS[tier];
          const isSelected = selectedTier === tier;

          return (
            <div
              key={tier}
              onClick={() => onSelectTier(tier)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                isSelected
                  ? 'bg-amber-100/80 border-amber-500 ring-4 ring-amber-300/80 shadow-xs'
                  : 'bg-white border-amber-200 hover:border-amber-300 hover:bg-amber-50/60 text-slate-700'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`font-black text-base ${isSelected ? 'text-amber-950' : 'text-slate-800'}`}>
                    {tier}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-black ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border border-amber-500/40 shadow-xs'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {info.multiplier}× Multiplier
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                  {info.description}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                  isSelected ? 'border-amber-500 bg-amber-400' : 'border-amber-300 bg-white'
                }`}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-md shadow-amber-400/30 border-2 border-amber-500/40 btn-tactile"
        >
          <span>Lock In & Start Sprint ⚡</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-amber-900/80 font-bold">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
        <span>Server-verified fair scoring snapshot version 1.0</span>
      </div>
    </div>
  );
}
