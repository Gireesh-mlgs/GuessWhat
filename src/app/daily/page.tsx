'use client';

import React, { useState, useEffect } from 'react';
import { DifficultyTier } from '@/lib/game/scoring';
import type { PublicSessionState } from '@/lib/game/types';
import { TierSelector } from '@/components/game/TierSelector';
import { OpportunityBar } from '@/components/game/OpportunityBar';
import { AudioWavePlayer } from '@/components/audio/AudioWavePlayer';
import { AnswerSearchBox } from '@/components/game/AnswerSearchBox';
import { RoundResultBanner } from '@/components/game/RoundResultBanner';
import { ShareModal } from '@/components/modals/ShareModal';
import { Flame, Trophy, Loader2 } from 'lucide-react';

export default function DailyPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PublicSessionState | null>(null);
  const [selectedTier, setSelectedTier] = useState<DifficultyTier>('Medium');
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [streakPopping, setStreakPopping] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);

  // Fetch daily status
  useEffect(() => {
    fetch('/api/v1/daily/status')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success) {
          setCurrentStreak(json.data.currentStreak || 0);
          if (json.data.hasStarted && json.data.sessionId) {
            // Resume existing session
            return fetch(`/api/v1/sessions/${json.data.sessionId}`)
              .then((r) => r.json())
              .then((sessJson) => {
                if (sessJson?.success) {
                  setSession(sessJson.data);
                  if (sessJson.data.status === 'completed') {
                    setHasCompletedToday(true);
                  }
                }
              });
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStartDaily = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/daily/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier }),
      });
      const json = await res.json();
      if (json?.success) {
        setSession(json.data);
        setAutoPlayNext(true);
        if (json.data.status === 'completed') {
          setHasCompletedToday(true);
        }
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  const currentRound = session ? session.rounds[session.activeRoundIndex] : null;

  const handleSubmitGuess = async (songId: string | null, isSkip = false) => {
    if (!session || !currentRound || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/rounds/${currentRound.id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submittedSongId: isSkip ? null : songId, isSkip }),
      });
      const json = await res.json();
      if (json?.success) {
        const isCorrect = json.data.round?.state === 'correct';
        if (isCorrect) {
          setStreakPopping(true);
          setTimeout(() => setStreakPopping(false), 600);
        }

        setSession(json.data.session);
        if (json.data.session.status === 'completed') {
          setHasCompletedToday(true);
          if (isCorrect) {
            setCurrentStreak((prev) => prev + 1);
          }
        } else if (json.data.round?.state === 'unresolved') {
          // Next clue duration unlocked on skip or incorrect guess:
          // Auto-play the song from the beginning up to the new duration!
          setAutoPlayNext(true);
        }
      }
    } catch {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextRound = () => {
    if (!session) return;
    const nextIdx = session.activeRoundIndex + 1;
    if (nextIdx < session.rounds.length) {
      setSession({
        ...session,
        activeRoundIndex: nextIdx,
      });
      setAutoPlayNext(true);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-9 h-9 animate-spin text-amber-500" />
      </div>
    );
  }

  // State 1: Select difficulty tier before starting
  if (!session) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        {/* Floating background playful yellow doodles */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <span className="absolute top-20 left-[10%] text-3xl text-amber-300/80 select-none animate-float-slow">🎵</span>
          <span className="absolute top-36 right-[12%] text-3xl text-yellow-400/90 select-none animate-float-delayed">⭐</span>
          <span className="absolute bottom-40 left-[8%] text-3xl text-amber-400/80 select-none animate-float-delayed">🎶</span>
          <span className="absolute bottom-28 right-[10%] text-3xl text-yellow-500/80 select-none animate-float-slow">❓</span>
          <span className="absolute top-1/2 left-[5%] text-2xl text-amber-300/70 select-none animate-float-slow">•</span>
          <span className="absolute top-1/3 right-[6%] text-xl text-yellow-400/80 select-none animate-float-delayed">✨</span>
        </div>
        <div className="relative z-10 w-full flex justify-center">
          <TierSelector
            selectedTier={selectedTier}
            onSelectTier={setSelectedTier}
            onConfirm={handleStartDaily}
            isLoading={loading}
            modeLabel="Daily Sprint ⚡"
          />
        </div>
      </div>
    );
  }

  // State 2: Completed Daily Run
  if (session.status === 'completed' || hasCompletedToday) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="relative z-10 w-full flex justify-center">
          <ShareModal session={session} currentStreak={currentStreak} />
        </div>
      </div>
    );
  }

  // State 3: Active Gameplay Loop
  const isRoundResolved = currentRound ? currentRound.state !== 'unresolved' : false;
  const isLastRound = session.activeRoundIndex === session.rounds.length - 1;

  // Calculate Accuracy
  const resolvedRounds = session.rounds.filter((r) => r.state !== 'unresolved');
  const correctRounds = session.rounds.filter((r) => r.state === 'correct');
  const dailyAccuracy = resolvedRounds.length > 0 ? Math.round((correctRounds.length / resolvedRounds.length) * 100) : 100;

  return (
    <div className="relative flex-1 flex flex-col items-center px-4 py-6 max-w-xl mx-auto w-full space-y-5">
      {/* Floating background playful yellow doodles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <span className="absolute top-20 left-[10%] text-3xl text-amber-300/80 select-none animate-float-slow">🎵</span>
        <span className="absolute top-36 right-[12%] text-3xl text-yellow-400/90 select-none animate-float-delayed">⭐</span>
        <span className="absolute bottom-40 left-[8%] text-3xl text-amber-400/80 select-none animate-float-delayed">🎶</span>
        <span className="absolute bottom-28 right-[10%] text-3xl text-yellow-500/80 select-none animate-float-slow">❓</span>
        <span className="absolute top-1/2 left-[5%] text-2xl text-amber-300/70 select-none animate-float-slow">•</span>
        <span className="absolute top-1/3 right-[6%] text-xl text-yellow-400/80 select-none animate-float-delayed">✨</span>
      </div>

      {/* Top Header Bar: Song X of 5 & Tier */}
      <div className="w-full flex items-center justify-between text-xs font-bold text-slate-600 z-10">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-950 font-black shadow-2xs">
            Song {session.activeRoundIndex + 1} of {session.rounds.length}
          </span>
          <span className="px-3 py-1 rounded-full bg-white text-amber-900 border-2 border-amber-200 font-black">
            {session.difficultyTier}
          </span>
        </div>

        {/* Round Progress Dots */}
        <div className="flex items-center gap-1.5 py-1">
          {session.rounds.map((r, idx) => {
            const isCurrent = idx === session.activeRoundIndex;
            let dotStyle = 'bg-amber-100 border-amber-200';
            if (r.state === 'correct') {
              dotStyle = 'bg-emerald-500 border-emerald-600 shadow-sm';
            } else if (r.state === 'skipped' || r.state === 'exhausted') {
              dotStyle = 'bg-rose-400 border-rose-500';
            } else if (isCurrent) {
              dotStyle = 'bg-amber-500 border-amber-600 ring-4 ring-amber-200 animate-pulse';
            }

            return (
              <div
                key={r.id}
                className={`w-3.5 h-3.5 rounded-full border transition-all ${dotStyle}`}
                title={`Song ${idx + 1}: ${r.state}`}
              />
            );
          })}
        </div>
      </div>

      {/* Prominent Gameplay Stats: 🔥 Streak, ⭐ Score, 🎯 Accuracy in Yellow Fun Theme */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full z-10">
        {/* Streak */}
        <div
          className={`p-3 sm:p-4 rounded-3xl bg-amber-100/90 border-2 border-amber-300 shadow-[0_4px_16px_rgba(245,158,11,0.12)] flex flex-col items-center justify-center text-center transition-all ${
            streakPopping ? 'animate-streak-pop ring-4 ring-amber-400 scale-105' : ''
          }`}
        >
          <span className="text-[11px] sm:text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-1">
            <span>🔥</span> Streak
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
            {currentStreak}
          </span>
        </div>

        {/* Score */}
        <div className="p-3 sm:p-4 rounded-3xl bg-yellow-100/90 border-2 border-yellow-300 shadow-[0_4px_16px_rgba(234,179,8,0.12)] flex flex-col items-center justify-center text-center">
          <span className="text-[11px] sm:text-xs font-black text-yellow-950 uppercase tracking-wider flex items-center gap-1">
            <span>⭐</span> Score
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-950 mt-0.5">
            {session.score}
          </span>
        </div>

        {/* Accuracy */}
        <div className="p-3 sm:p-4 rounded-3xl bg-amber-50 border-2 border-amber-200 shadow-[0_4px_16px_rgba(245,158,11,0.08)] flex flex-col items-center justify-center text-center">
          <span className="text-[11px] sm:text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
            <span>🎯</span> Accuracy
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            {dailyAccuracy}%
          </span>
        </div>
      </div>

      {/* Opportunity Bar (0.1s to 5.0s) */}
      {currentRound && (
        <div className="w-full z-10">
          <OpportunityBar
            currentOpportunity={currentRound.currentOpportunity}
            attemptCount={currentRound.attemptCount}
            isResolved={isRoundResolved}
            solvedAtAttempt={currentRound.solvedAtAttempt}
            state={currentRound.state}
          />
        </div>
      )}

      {/* Audio Waveform Player */}
      {currentRound && (
        <div className="w-full z-10">
          <AudioWavePlayer
            key={`audio-${currentRound.id}-${currentRound.currentOpportunity}`}
            audioUrl={currentRound.audioUrl}
            startMs={currentRound.startMs}
            durationMs={isRoundResolved ? 5000 : currentRound.currentDurationMs}
            autoPlay={autoPlayNext}
          />
        </div>
      )}

      {/* Interactive Controls: Search/Guess vs Resolved Banner */}
      {currentRound && (
        <div className="w-full z-10">
          {isRoundResolved ? (
            <RoundResultBanner
              state={currentRound.state as 'correct' | 'skipped' | 'exhausted'}
              score={currentRound.score}
              solvedAtAttempt={currentRound.solvedAtAttempt}
              correctAnswer={currentRound.correctAnswer}
              isLastRound={isLastRound}
              onNext={handleNextRound}
            />
          ) : (
            <AnswerSearchBox
              sessionId={session.id}
              onSelectAnswer={(id) => handleSubmitGuess(id, false)}
              onSkip={() => handleSubmitGuess(null, true)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      )}
    </div>
  );
}
