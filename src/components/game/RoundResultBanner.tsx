'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, FastForward, ArrowRight, Music } from 'lucide-react';

interface RoundResultBannerProps {
  state: 'correct' | 'skipped' | 'exhausted';
  score: number;
  solvedAtAttempt?: number | null;
  correctAnswer?: {
    songId: string;
    canonicalTitle: string;
    primaryArtist: string;
  } | null;
  isLastRound: boolean;
  onNext: () => void;
}

export function RoundResultBanner({
  state,
  score,
  solvedAtAttempt,
  correctAnswer,
  isLastRound,
  onNext,
}: RoundResultBannerProps) {
  const isCorrect = state === 'correct';
  const isSkip = state === 'skipped';

  // Trigger celebratory confetti on correct answer!
  useEffect(() => {
    if (isCorrect) {
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#FACC15', '#F59E0B', '#10B981', '#FB923C'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isCorrect]);

  return (
    <div
      className={`w-full rounded-2xl p-6 border-2 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200 shadow-xl ${
        isCorrect
          ? 'bg-[#0b1710] border-[#22c55e] text-[#A8FF3E] shadow-[0_0_24px_rgba(34,197,94,0.3)]'
          : isSkip
          ? 'bg-[#14120a] border-[#eab308] text-[#fef08a]'
          : 'bg-[#180e12] border-[#f43f5e] text-rose-300 animate-wrong-shake'
      }`}
    >
      <div className="flex items-center gap-2 font-pixel text-lg sm:text-xl uppercase tracking-wide">
        {isCorrect ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-[#A8FF3E] stroke-[2.5]" />
            <span>SOLVED IN {solvedAtAttempt} {solvedAtAttempt === 1 ? 'TRY' : 'TRIES'}! (+{score} PTS) ★</span>
          </>
        ) : isSkip ? (
          <>
            <FastForward className="w-6 h-6 text-yellow-400 stroke-[2.5]" />
            <span>ROUND SKIPPED (+0 PTS)</span>
          </>
        ) : (
          <>
            <XCircle className="w-6 h-6 text-rose-400 stroke-[2.5]" />
            <span>OUT OF ATTEMPTS (+0 PTS)</span>
          </>
        )}
      </div>

      {/* Answer Reveal Card */}
      {correctAnswer && (
        <div className="w-full max-w-sm flex items-center gap-3 bg-[#060a08] px-4 py-3 rounded-xl border-2 border-[#22c55e]/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] my-1 text-left">
          <div className="w-10 h-10 rounded-lg bg-[#102417] border border-[#22c55e]/60 flex items-center justify-center shrink-0">
            <Music className="w-5 h-5 text-[#A8FF3E] stroke-[2.5]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="font-bold text-white text-sm sm:text-base truncate">
              {correctAnswer.canonicalTitle}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 truncate mt-0.5">
              <span className="text-[10px] uppercase font-pixel px-1.5 py-0.2 rounded bg-[#22c55e]/20 text-[#A8FF3E] border border-[#22c55e]/40">
                ARTIST
              </span>
              <span className="truncate text-slate-300">{correctAnswer.primaryArtist}</span>
            </div>
          </div>
        </div>
      )}

      {/* Next Round Button in Neon Green Arcade Theme */}
      <button
        onClick={onNext}
        className="w-full max-w-xs py-4 px-6 arcade-btn-green font-bold text-sm flex items-center justify-center gap-2"
      >
        <span>{isLastRound ? 'SEE FINAL RESULTS' : 'NEXT SONG'}</span>
        <ArrowRight className="w-4 h-4 stroke-[3]" />
      </button>
    </div>
  );
}
