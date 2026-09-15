'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import type { PublicSessionState } from '@/lib/game/types';
import { OpportunityBar } from '@/components/game/OpportunityBar';
import { AudioWavePlayer } from '@/components/audio/AudioWavePlayer';
import { AnswerSearchBox } from '@/components/game/AnswerSearchBox';
import { RoundResultBanner } from '@/components/game/RoundResultBanner';
import { ShareModal } from '@/components/modals/ShareModal';
import { Users, Trophy, Clock, ArrowRight, Share2, Copy, Check, Loader2 } from 'lucide-react';

interface Participant {
  rank: number;
  displayName: string;
  score: number;
  skipsCount: number;
  completedAt: number;
  isCurrentPlayer: boolean;
}

interface ChallengeMeta {
  code: string;
  creatorName: string;
  songCount: number;
  difficultyTier: string;
  category: string;
  expiresAt: number;
  isExpired: boolean;
  participants: Participant[];
  totalParticipants: number;
  hasCompleted: boolean;
  myScore?: number | null;
  mySessionId?: string | null;
}

export default function ChallengePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);

  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<ChallengeMeta | null>(null);
  const [session, setSession] = useState<PublicSessionState | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Refresh scoreboard after the current player completes.
  const loadChallenge = async (signal?: AbortSignal) => {
    try {
      const res = await fetch(`/api/v1/challenges/${code}`, { signal });
      const json = await res.json();
      if (json?.success) {
        setChallenge(json.data);
        if (json.data.mySessionId) {
          const sessRes = await fetch(`/api/v1/sessions/${json.data.mySessionId}`);
          const sessJson = await sessRes.json();
          if (sessJson?.success) {
            setSession(sessJson.data);
          }
        }
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const loadInitialChallenge = async () => {
      try {
        const res = await fetch(`/api/v1/challenges/${code}`, { signal: controller.signal });
        const json = await res.json();
        if (!json?.success || controller.signal.aborted) return;

        setChallenge(json.data);
        if (json.data.mySessionId) {
          const sessionResponse = await fetch(`/api/v1/sessions/${json.data.mySessionId}`, {
            signal: controller.signal,
          });
          const sessionJson = await sessionResponse.json();
          if (sessionJson?.success && !controller.signal.aborted) {
            setSession(sessionJson.data);
          }
        }
      } catch {
        // Error
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void loadInitialChallenge();
    return () => controller.abort();
  }, [code]);

  // Join & Start Challenge
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/v1/challenges/${code}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() || 'Challenger' }),
      });
      const json = await res.json();
      if (json?.success) {
        setSession(json.data);
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  const currentRound = session ? session.rounds[session.activeRoundIndex] : null;

  const [autoPlayNext, setAutoPlayNext] = useState(false);

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
        setSession(json.data.session);
        if (json.data.session.status === 'completed') {
          loadChallenge();
        } else if (json.data.round?.state === 'unresolved') {
          // Next clue duration unlocked on skip or incorrect guess:
          // auto-play the new snippet from the beginning!
          setAutoPlayNext(true);
        }
      }
    } catch {
      // Error
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

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-9 h-9 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
        <h2 className="text-2xl font-black text-slate-900">Challenge Not Found</h2>
        <p className="text-sm text-slate-500 font-medium">The challenge code is invalid or has expired.</p>
        <Link href="/challenge/new" className="text-indigo-600 hover:underline font-bold text-sm">
          Create a new challenge &rarr;
        </Link>
      </div>
    );
  }

  // State 1: In-Game Active Session
  if (session && session.status !== 'completed') {
    const isRoundResolved = currentRound ? currentRound.state !== 'unresolved' : false;
    const isLastRound = session.activeRoundIndex === session.rounds.length - 1;

    return (
      <div className="relative flex-1 flex flex-col items-center px-4 py-6 max-w-xl mx-auto w-full space-y-5">
        <div className="w-full flex items-center justify-between text-xs font-bold text-slate-500">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white border-2 border-slate-200 text-slate-800 font-black shadow-2xs">
              Song {session.activeRoundIndex + 1} of {session.rounds.length}
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-black">
              Duel #{challenge.code}
            </span>
          </div>

          <div className="font-mono text-sm text-slate-800 font-black">
            Score: <span className="text-purple-600 font-extrabold">{session.score}</span>
          </div>
        </div>

        {/* Opportunity Bar */}
        {currentRound && (
          <OpportunityBar
            currentOpportunity={currentRound.currentOpportunity}
            attemptCount={currentRound.attemptCount}
            isResolved={isRoundResolved}
            solvedAtAttempt={currentRound.solvedAtAttempt}
            state={currentRound.state}
          />
        )}

        {/* Audio Player */}
        {currentRound && (
          <AudioWavePlayer
            key={`audio-${currentRound.id}-${currentRound.currentOpportunity}`}
            audioUrl={currentRound.audioUrl}
            startMs={currentRound.startMs}
            durationMs={isRoundResolved ? 5000 : currentRound.currentDurationMs}
            autoPlay={autoPlayNext}
          />
        )}

        {/* Search or Round Result */}
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

  // State 2: Completed or Lobby Screen
  return (
    <div className="flex-1 flex flex-col items-center px-4 py-8 max-w-xl mx-auto w-full space-y-6">
      {/* Challenge Header Card */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-100 shadow-[0_10px_35px_rgba(0,0,0,0.04)] text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center shadow-xs">
          <Users className="w-7 h-7 text-purple-600" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-black text-purple-600 uppercase tracking-wider">
            Challenge #{challenge.code}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Created by {challenge.creatorName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            {challenge.songCount} Songs &bull; {challenge.difficultyTier} Tier &bull; {challenge.category} Genre
          </p>
        </div>

        {/* Share Link Button */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 transition-colors btn-tactile"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Share Link'}</span>
          </button>
        </div>

        {/* Join form if not completed */}
        {!session && (
          <form onSubmit={handleJoin} className="space-y-3 pt-3">
            <input
              type="text"
              required
              maxLength={24}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your player name to join..."
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-600 text-sm font-semibold shadow-xs transition-all"
            />
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-500/25 btn-tactile"
            >
              <span>Accept Duel & Start Sprint</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </form>
        )}
      </div>

      {/* Completed Results View */}
      {session && session.status === 'completed' && (
        <ShareModal session={session} />
      )}

      {/* Comparative Scoreboard */}
      <div className="w-full bg-white rounded-3xl p-6 sm:p-7 border-2 border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-slate-900 text-base">Participant Leaderboard</h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">
            {challenge.participants.length} finished
          </span>
        </div>

        {challenge.participants.length === 0 ? (
          <p className="text-center text-xs text-slate-400 font-medium py-6">
            No one has completed this duel yet. Be the first to set a high score!
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {challenge.participants.map((p) => (
              <div
                key={p.rank}
                className={`py-3 flex items-center justify-between ${
                  p.isCurrentPlayer ? 'bg-purple-50 px-3 rounded-2xl font-bold' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 font-black text-sm text-center ${
                      p.rank === 1
                        ? 'text-amber-500'
                        : p.rank === 2
                        ? 'text-slate-400'
                        : p.rank === 3
                        ? 'text-amber-700'
                        : 'text-slate-400'
                    }`}
                  >
                    #{p.rank}
                  </span>
                  <div>
                    <span className="font-bold text-sm text-slate-900">
                      {p.displayName} {p.isCurrentPlayer && '(You)'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      {p.skipsCount} skips
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-black text-purple-600 text-sm">
                    {p.score} pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
