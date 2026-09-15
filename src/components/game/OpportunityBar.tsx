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
      <div className="flex items-center justify-between text-xs text-amber-950 font-black px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          Reveal Schedule
        </span>
        <span>
          Opportunity {Math.min(5, isResolved ? attemptCount : currentOpportunity)} of 5
        </span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {REVEAL_SCHEDULE.map((slot) => {
          const slotNum = slot.opportunity;
          const isPastAttempt = slotNum <= attemptCount;
          const isCurrent = slotNum === currentOpportunity && !isResolved;
          const isWinningSlot = state === 'correct' && solvedAtAttempt === slotNum;

          let badgeStyle = 'bg-white border-2 border-amber-200/80 text-slate-400';

          if (isWinningSlot) {
            badgeStyle = 'bg-emerald-100 border-2 border-emerald-500 text-emerald-950 shadow-sm';
          } else if (isCurrent) {
            badgeStyle = 'bg-amber-200 border-2 border-amber-500 text-amber-950 ring-4 ring-amber-300/80 shadow-md font-black scale-105';
          } else if (isPastAttempt) {
            badgeStyle = 'bg-rose-50 border-2 border-rose-200 text-rose-700 font-bold';
          }

          return (
            <div
              key={slot.opportunity}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl text-center transition-all ${badgeStyle}`}
            >
              <div className="flex items-center gap-1 font-black text-xs sm:text-sm">
                {isWinningSlot ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                ) : isPastAttempt && !isWinningSlot ? (
                  <X className="w-3.5 h-3.5 text-rose-500 stroke-[2.5]" />
                ) : null}
                <span>{slot.durationSec}s</span>
              </div>
              <span className="text-[10px] font-black mt-0.5 opacity-90">
                {slot.basePoints} pts
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
