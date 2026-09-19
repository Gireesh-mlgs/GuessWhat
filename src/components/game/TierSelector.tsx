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
    <div className="w-full max-w-lg pixel-arcade-card p-6 sm:p-8 space-y-6 animate-in fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md arcade-badge text-[11px] font-bold">
          <Zap className="w-3.5 h-3.5 text-[#A8FF3E] fill-[#A8FF3E]" />
          <span>CHOOSE YOUR STAKES</span>
        </div>
        <h2 className="font-pixel text-2xl sm:text-3xl text-white tracking-tight uppercase pixel-text-white">
          SELECT DIFFICULTY
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-medium">
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
              className={`p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-4 ${
                isSelected
                  ? 'bg-[#153120] border-[#A8FF3E] shadow-[0_0_16px_rgba(168,255,62,0.3)]'
                  : 'bg-[#0a120e] border-[#1d3d28] hover:border-[#22c55e] text-slate-300'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`font-pixel text-base uppercase ${isSelected ? 'text-[#A8FF3E]' : 'text-white'}`}>
                    {tier}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-pixel uppercase ${
                      isSelected
                        ? 'bg-[#A8FF3E] text-[#06080d] font-bold shadow-[0_0_8px_#A8FF3E]'
                        : 'bg-[#14281c] text-[#A8FF3E] border border-[#22c55e]/40'
                    }`}
                  >
                    {info.multiplier}× MULTIPLIER
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  {info.description}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                  isSelected ? 'border-[#A8FF3E] bg-[#A8FF3E]' : 'border-[#22c55e]/50 bg-[#060c08]'
                }`}
              >
                {isSelected && <div className="w-2 h-2 bg-[#06080d] rounded-xs" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="w-full py-4 arcade-btn-green text-base font-bold flex items-center justify-center gap-2"
        >
          <span>LOCK IN &amp; START SPRINT ⚡</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-[#A8FF3E]/80 font-pixel uppercase">
        <ShieldCheck className="w-3.5 h-3.5 text-[#A8FF3E]" />
        <span>SERVER-VERIFIED SCORING SNAPSHOT V1.0</span>
      </div>
    </div>
  );
}
