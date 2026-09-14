'use client';

import React from 'react';
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

  return (
    <div
      className={`w-full rounded-2xl p-5 border text-center flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-200 ${
        isCorrect
          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-100 shadow-xl shadow-emerald-500/10'
          : isSkip
          ? 'bg-slate-800/80 border-slate-700 text-slate-200'
          : 'bg-rose-500/15 border-rose-500/40 text-rose-100'
      }`}
    >
      <div className="flex items-center gap-2 font-black text-lg">
        {isCorrect ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span>Solved in {solvedAtAttempt} try! (+{score} pts)</span>
          </>
        ) : isSkip ? (
          <>
            <FastForward className="w-6 h-6 text-slate-400" />
            <span>Round Skipped (+0 pts)</span>
          </>
        ) : (
          <>
            <XCircle className="w-6 h-6 text-rose-400" />
            <span>Out of Attempts (+0 pts)</span>
          </>
        )}
      </div>

      {/* Answer Reveal */}
      {correctAnswer && (
        <div className="flex items-center gap-3 bg-black/40 px-4 py-2.5 rounded-xl border border-white/10 my-1">
          <Music className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div className="text-left">
            <div className="font-extrabold text-white text-base leading-tight">
              {correctAnswer.canonicalTitle}
            </div>
            <div className="text-xs text-slate-300 font-medium">
              {correctAnswer.primaryArtist}
            </div>
          </div>
        </div>
      )}

      {/* Next Round Button */}
      <button
        onClick={onNext}
        className="w-full max-w-xs py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all transform active:scale-95"
      >
        <span>{isLastRound ? 'See Final Results' : 'Next Song'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
