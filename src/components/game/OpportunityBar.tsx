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
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
        <span>Reveal Schedule</span>
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
          const isFailedSlot = (state === 'exhausted' || state === 'skipped') && isPastAttempt;

          let badgeStyle = 'bg-slate-900/60 border-slate-800 text-slate-500';

          if (isWinningSlot) {
            badgeStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-lg shadow-emerald-500/20';
          } else if (isCurrent) {
            badgeStyle = 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-500/30';
          } else if (isPastAttempt) {
            badgeStyle = 'bg-rose-500/15 border-rose-500/40 text-rose-300/80';
          }

          return (
            <div
              key={slot.opportunity}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${badgeStyle}`}
            >
              <div className="flex items-center gap-1 font-bold text-xs sm:text-sm">
                {isWinningSlot ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : isPastAttempt && !isWinningSlot ? (
                  <X className="w-3.5 h-3.5 text-rose-400" />
                ) : null}
                <span>{slot.durationSec}s</span>
              </div>
              <span className="text-[10px] opacity-70 font-semibold mt-0.5">
                {slot.basePoints} pts
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
