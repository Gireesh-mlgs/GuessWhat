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
      className={`w-full rounded-3xl p-6 border-2 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200 shadow-sm ${
        isCorrect
          ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-950 shadow-emerald-500/10'
          : isSkip
          ? 'bg-amber-50 border-2 border-amber-300 text-amber-950'
          : 'bg-rose-50 border-2 border-rose-300 text-rose-950 animate-wrong-shake'
      }`}
    >
      <div className="flex items-center gap-2 font-black text-lg sm:text-xl">
        {isCorrect ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-emerald-600 stroke-[2.5]" />
            <span>Solved in {solvedAtAttempt} {solvedAtAttempt === 1 ? 'try' : 'tries'}! (+{score} pts) 🎉</span>
          </>
        ) : isSkip ? (
          <>
            <FastForward className="w-6 h-6 text-amber-700 stroke-[2.5]" />
            <span>Round Skipped (+0 pts)</span>
          </>
        ) : (
          <>
            <XCircle className="w-6 h-6 text-rose-500 stroke-[2.5]" />
            <span>Out of Attempts (+0 pts)</span>
          </>
        )}
      </div>

      {/* Answer Reveal Card */}
      {correctAnswer && (
        <div className="w-full max-w-sm flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border-2 border-amber-300 shadow-xs my-1 text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-200 border border-amber-300 flex items-center justify-center flex-shrink-0">
            <Music className="w-5 h-5 text-amber-950 stroke-[2.5]" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="font-black text-slate-900 text-sm sm:text-base truncate">
              {correctAnswer.canonicalTitle}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-950 font-bold truncate mt-0.5">
              <span className="text-[10px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-950 border border-amber-300">
                Artist
              </span>
              <span className="truncate">{correctAnswer.primaryArtist}</span>
            </div>
          </div>
        </div>
      )}

      {/* Next Round Button in Yellow Fun Theme */}
      <button
        onClick={onNext}
        className="w-full max-w-xs py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-400/30 border-2 border-amber-500/40 btn-tactile"
      >
        <span>{isLastRound ? 'See Final Results' : 'Next Song'}</span>
        <ArrowRight className="w-4 h-4 stroke-[3]" />
      </button>
    </div>
  );
}
