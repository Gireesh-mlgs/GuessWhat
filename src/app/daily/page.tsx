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
import { Flame, Trophy, Loader2, ArrowLeft } from 'lucide-react';

export default function DailyPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PublicSessionState | null>(null);
  const [selectedTier, setSelectedTier] = useState<DifficultyTier>('Medium');
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

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
    if (!currentRound || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/v1/rounds/${currentRound.id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submittedSongId: songId, isSkip }),
      });
      const json = await res.json();
      if (json?.success) {
        setSession(json.data.session);
        if (json.data.session.status === 'completed') {
          setHasCompletedToday(true);
          setCurrentStreak((prev) => prev + 1);
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
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  // State 1: Select difficulty tier before starting
  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <TierSelector
          selectedTier={selectedTier}
          onSelectTier={setSelectedTier}
          onConfirm={handleStartDaily}
          isLoading={loading}
          modeLabel="Daily Challenge"
        />
      </div>
    );
  }

  // State 2: Completed Daily Run
  if (session.status === 'completed') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <ShareModal session={session} currentStreak={currentStreak} />
      </div>
    );
  }

  // State 3: Active Gameplay Loop
  const isRoundResolved = currentRound ? currentRound.state !== 'unresolved' : false;
  const isLastRound = session.activeRoundIndex === session.rounds.length - 1;

  return (
    <div className="flex-1 flex flex-col items-center px-4 py-6 max-w-xl mx-auto w-full space-y-5">
      {/* Top Header Bar: Song X of 5, Score, Tier */}
      <div className="w-full flex items-center justify-between text-xs font-bold text-slate-400">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-white/10 text-white">
            Song {session.activeRoundIndex + 1} of {session.rounds.length}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            {session.difficultyTier}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400/30" />
            <span>{currentStreak}d Streak</span>
          </div>
          <div className="font-mono text-sm text-white">
            Score: <span className="text-cyan-400 font-extrabold">{session.score}</span>
          </div>
        </div>
      </div>

      {/* Round Dots Indicator */}
      <div className="w-full flex items-center justify-center gap-2 py-1">
        {session.rounds.map((r, idx) => {
          const isCurrent = idx === session.activeRoundIndex;
          let dotStyle = 'bg-slate-800 border-slate-700';
          if (r.state === 'correct') {
            dotStyle = 'bg-emerald-400 border-emerald-500 shadow-md shadow-emerald-500/30';
          } else if (r.state === 'skipped' || r.state === 'exhausted') {
            dotStyle = 'bg-rose-500/80 border-rose-600';
          } else if (isCurrent) {
            dotStyle = 'bg-cyan-400 border-cyan-300 ring-2 ring-cyan-500/40 animate-pulse';
          }

          return (
            <div
              key={r.id}
              className={`w-3 h-3 rounded-full border transition-all ${dotStyle}`}
              title={`Song ${idx + 1}: ${r.state}`}
            />
          );
        })}
      </div>

      {/* Opportunity Bar (0.1s to 5.0s) */}
      {currentRound && (
        <OpportunityBar
          currentOpportunity={currentRound.currentOpportunity}
          attemptCount={currentRound.attemptCount}
          isResolved={isRoundResolved}
          solvedAtAttempt={currentRound.solvedAtAttempt}
          state={currentRound.state}
        />
      )}

      {/* Audio Waveform Player */}
      {currentRound && (
        <AudioWavePlayer
          audioUrl={currentRound.audioUrl}
          startMs={currentRound.startMs}
          durationMs={isRoundResolved ? 5000 : currentRound.currentDurationMs}
        />
      )}

      {/* Interactive Controls: Search/Guess vs Resolved Banner */}
      {currentRound && (
        <>
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
        </>
      )}
    </div>
  );
}
