import React from 'react';
import { REVEAL_SCHEDULE } from '@/lib/game/scoring';
import { Check, X } from 'lucide-react';

interface OpportunityBarProps {
  currentOpportunity: number; // 1 to 5
  attemptCount: number; // 0 to 5
  isResolved: boolean;
  solvedAtAttempt?: number | null;
  state: 'unresolved' | 'correct' | 'skipped' | 'exhausted';
}

export function OpportunityBar({
  currentOpportunity,
  attemptCount,
  isResolved,
  solvedAtAttempt,
  state,
}: OpportunityBarProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between font-pixel text-xs text-[#A8FF3E] uppercase tracking-wider px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-xs bg-[#A8FF3E] animate-pulse shadow-[0_0_6px_#A8FF3E]" />
          <span>REVEAL SCHEDULE</span>
        </span>
        <span className="text-slate-400">
          SLOT {Math.min(5, isResolved ? attemptCount : currentOpportunity)} / 5
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {REVEAL_SCHEDULE.map((slot) => {
          const slotNum = slot.opportunity;
          const isPastAttempt = slotNum <= attemptCount;
          const isCurrent = slotNum === currentOpportunity && !isResolved;
          const isWinningSlot = state === 'correct' && solvedAtAttempt === slotNum;

          let badgeStyle = 'bg-[#0a120e]/80 border-2 border-[#193d25] text-slate-500';

          if (isWinningSlot) {
            badgeStyle = 'bg-[#22c55e] border-2 border-[#A8FF3E] text-[#06080d] shadow-[0_0_14px_#22c55e] font-pixel';
          } else if (isCurrent) {
            badgeStyle = 'bg-[#A8FF3E] border-2 border-[#d7ff75] text-[#06080d] shadow-[0_0_16px_#A8FF3E] font-pixel scale-105';
          } else if (isPastAttempt) {
            badgeStyle = 'bg-[#1a0e11] border-2 border-[#7f1d1d] text-rose-400';
          }

          return (
            <div
              key={slot.opportunity}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-center transition-all ${badgeStyle}`}
            >
              <div className="flex items-center gap-1 font-bold text-xs sm:text-sm">
                {isWinningSlot ? (
                  <Check className="w-3.5 h-3.5 text-[#06080d] stroke-[3.5]" />
                ) : isPastAttempt && !isWinningSlot ? (
                  <X className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />
                ) : null}
                <span className="font-pixel">{slot.durationSec}s</span>
              </div>
              <span className="font-pixel text-[10px] tracking-wide mt-0.5 opacity-90 uppercase">
                {slot.basePoints} PTS
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
