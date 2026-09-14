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
    <div className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 animate-in fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5" />
          Choose Your Stakes
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Select Difficulty
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Tier is locked for your entire {modeLabel} run. Higher tiers award bigger score multipliers!
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
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-4 ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-900/80 text-slate-400'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`font-black text-base ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                    {tier}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {info.multiplier}× Multiplier
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {info.description}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 flex-shrink-0 ${
                  isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-700 bg-slate-900'
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
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:opacity-95 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all transform active:scale-[0.99]"
        >
          <span>Lock In & Start Sprint</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Server-verified fair scoring snapshot version 1.0</span>
      </div>
    </div>
  );
}
