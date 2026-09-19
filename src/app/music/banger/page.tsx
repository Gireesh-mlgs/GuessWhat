'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DifficultyTier } from '@/lib/game/scoring';
import type { PublicSessionState } from '@/lib/game/types';
import { TierSelector } from '@/components/game/TierSelector';
import { OpportunityBar } from '@/components/game/OpportunityBar';
import { AudioWavePlayer } from '@/components/audio/AudioWavePlayer';
import { AnswerSearchBox } from '@/components/game/AnswerSearchBox';
import { RoundResultBanner } from '@/components/game/RoundResultBanner';
import { ShareModal } from '@/components/modals/ShareModal';
import { Loader2, ArrowLeft, Play, RotateCcw } from 'lucide-react';

const CATEGORIES = ['All', 'Electronic', 'Pop', 'Rock', 'Soundtrack', 'Hip-Hop', 'Acoustic'];

function BangerGameContent() {
  const searchParams = useSearchParams();
  const urlMode = searchParams.get('mode');
  const [overrideMode, setOverrideMode] = useState<'daily' | 'unlimited' | null>(null);
  const mode = overrideMode ?? (urlMode === 'unlimited' ? 'unlimited' : 'daily');
  const setMode = (m: 'daily' | 'unlimited') => setOverrideMode(m);

  // Daily mode state
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailySession, setDailySession] = useState<PublicSessionState | null>(null);
  const [selectedDailyTier, setSelectedDailyTier] = useState<DifficultyTier>('Medium');
  const [hasCompletedToday, setHasCompletedToday] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  // Unlimited mode state
  const [unlimitedLoading, setUnlimitedLoading] = useState(false);
  const [unlimitedSession, setUnlimitedSession] = useState<PublicSessionState | null>(null);
  const [selectedUnlimitedTier, setSelectedUnlimitedTier] = useState<DifficultyTier>('Easy');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [practiceStats, setPracticeStats] = useState({
    roundsPlayed: 0,
    correctCount: 0,
    totalScore: 0,
    revealsSum: 0,
    streak: 0,
  });

  // Shared gameplay state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streakPopping, setStreakPopping] = useState(false);
  const [autoPlayNext, setAutoPlayNext] = useState(false);

  // Fetch Daily Status on mount
  useEffect(() => {
    fetch('/api/v1/daily/status')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success) {
          setCurrentStreak(json.data.currentStreak || 0);
          if (json.data.hasStarted && json.data.sessionId) {
            return fetch(`/api/v1/sessions/${json.data.sessionId}`)
              .then((r) => r.json())
              .then((sessJson) => {
                if (sessJson?.success) {
                  setDailySession(sessJson.data);
                  if (sessJson.data.status === 'completed') {
                    setHasCompletedToday(true);
                  }
                }
              });
          }
        }
      })
      .catch(() => { })
      .finally(() => setDailyLoading(false));
  }, []);

  // Start Daily Session
  const handleStartDaily = async () => {
    setDailyLoading(true);
    try {
      const res = await fetch('/api/v1/daily/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedDailyTier }),
      });
      const json = await res.json();
      if (json?.success) {
        setDailySession(json.data);
        setAutoPlayNext(true);
        if (json.data.status === 'completed') {
          setHasCompletedToday(true);
        }
      }
    } catch {
      // Error
    } finally {
      setDailyLoading(false);
    }
  };

  // Start Unlimited Session
  const handleStartUnlimited = async () => {
    setUnlimitedLoading(true);
    try {
      const res = await fetch('/api/v1/unlimited/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedUnlimitedTier, category: selectedCategory }),
      });
      const json = await res.json();
      if (json?.success) {
        setUnlimitedSession(json.data);
        setAutoPlayNext(true);
      }
    } catch {
      // Error
    } finally {
      setUnlimitedLoading(false);
    }
  };

  // Handle Next Song for Unlimited Mode
  const handleNextUnlimitedSong = async () => {
    if (!unlimitedSession) return;
    setUnlimitedLoading(true);
    try {
      const res = await fetch(`/api/v1/unlimited/sessions/${unlimitedSession.id}/next`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json?.success) {
        setUnlimitedSession(json.data);
        setAutoPlayNext(true);
      }
    } catch {
      // Error
    } finally {
      setUnlimitedLoading(false);
    }
  };

  const activeSession = mode === 'daily' ? dailySession : unlimitedSession;
  const currentRound = activeSession ? activeSession.rounds[activeSession.activeRoundIndex] : null;

  // Submit Guess or Skip
  const handleSubmitGuess = async (songId: string | null, isSkip = false) => {
    if (!activeSession || !currentRound || isSubmitting) return;
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

        if (mode === 'daily') {
          setDailySession(json.data.session);
          if (json.data.session.status === 'completed') {
            setHasCompletedToday(true);
            if (isCorrect) {
              setCurrentStreak((prev) => prev + 1);
            }
          } else if (json.data.round?.state === 'unresolved') {
            setAutoPlayNext(true);
          }
        } else {
          setUnlimitedSession(json.data.session);
          const updatedRound = json.data.round;
          if (updatedRound.state !== 'unresolved') {
            setPracticeStats((prev) => ({
              roundsPlayed: prev.roundsPlayed + 1,
              correctCount: prev.correctCount + (isCorrect ? 1 : 0),
              totalScore: prev.totalScore + updatedRound.score,
              revealsSum: prev.revealsSum + updatedRound.attemptCount,
              streak: isCorrect ? prev.streak + 1 : 0,
            }));
          } else {
            setAutoPlayNext(true);
          }
        }
      }
    } catch {
      // Error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextRound = () => {
    if (mode === 'daily') {
      if (!dailySession) return;
      const nextIdx = dailySession.activeRoundIndex + 1;
      if (nextIdx < dailySession.rounds.length) {
        setDailySession({
          ...dailySession,
          activeRoundIndex: nextIdx,
        });
        setAutoPlayNext(true);
      }
    } else {
      handleNextUnlimitedSong();
    }
  };

  // Loading state for initial Daily fetch
  if (dailyLoading && mode === 'daily' && !dailySession) {
    return (
      <div className="flex-1 flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-[#A8FF3E]" />
      </div>
    );
  }

  // Round resolution state
  const isRoundResolved = currentRound ? currentRound.state !== 'unresolved' : false;
  const isLastRound =
    mode === 'daily' && activeSession
      ? activeSession.activeRoundIndex === activeSession.rounds.length - 1
      : false;

  return (
    <div className="relative flex-1 flex flex-col items-center px-4 py-6 sm:py-8 max-w-xl mx-auto w-full space-y-6">
      {/* Floating green pixel background particles & retro arcade icons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <span className="absolute top-20 left-[10%] text-2xl text-[#A8FF3E]/40 select-none animate-float-slow font-pixel">🎵</span>
        <span className="absolute top-36 right-[12%] text-2xl text-[#d7ff75]/40 select-none animate-float-delayed font-pixel">★</span>
        <span className="absolute bottom-40 left-[8%] text-2xl text-[#22c55e]/40 select-none animate-float-delayed font-pixel">🎶</span>
        <span className="absolute bottom-28 right-[10%] text-2xl text-[#A8FF3E]/40 select-none animate-float-slow font-pixel">?</span>
        <span className="absolute top-1/2 left-[5%] text-xl text-[#A8FF3E]/30 select-none animate-float-slow">👾</span>
        <span className="absolute top-1/3 right-[6%] text-xl text-[#d7ff75]/30 select-none animate-float-delayed">🕹️</span>
        <div className="absolute top-1/4 left-1/3 w-1.5 h-1.5 bg-[#A8FF3E] animate-pixel-1 pointer-events-none rounded-xs shadow-[0_0_8px_#A8FF3E]" />
        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-[#d7ff75] animate-pixel-2 pointer-events-none rounded-xs shadow-[0_0_10px_#d7ff75]" />
        <div className="absolute top-2/3 left-1/5 w-1 h-1 bg-[#A8FF3E] animate-pixel-twinkle pointer-events-none rounded-xs" />
      </div>

      {/* Navigation & Mode Switcher Bar */}
      <div className="w-full flex items-center justify-between z-10">
        <Link
          href="/music"
          className="inline-flex items-center gap-1.5 font-pixel text-xs text-slate-400 hover:text-[#A8FF3E] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>&lt; MUSIC GAMES</span>
        </Link>

        {/* Arcade Mode Selector */}
        <div className="flex items-center gap-1 p-1 bg-[#09110d] rounded-xl border-2 border-[#22c55e]/60 shadow-[0_2px_0_#14532d]">
          <button
            onClick={() => setMode('daily')}
            className={`px-3 py-1 rounded-lg text-xs font-pixel uppercase tracking-wider transition-all ${
              mode === 'daily'
                ? 'bg-[#A8FF3E] text-[#06080d] font-bold shadow-[0_0_10px_rgba(168,255,62,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ DAILY
          </button>
          <button
            onClick={() => setMode('unlimited')}
            className={`px-3 py-1 rounded-lg text-xs font-pixel uppercase tracking-wider transition-all ${
              mode === 'unlimited'
                ? 'bg-[#A8FF3E] text-[#06080d] font-bold shadow-[0_0_10px_rgba(168,255,62,0.6)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🎵 PRACTICE
          </button>
        </div>
      </div>

      {/* Arcade Game Hero Title Header */}
      <div className="w-full text-center space-y-2 z-10 select-none pt-1">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-md arcade-badge text-[11px] font-bold">
          <span className="w-2 h-2 rounded-xs bg-[#A8FF3E] animate-pulse" />
          <span>STAGE 1 • COIN-OP AUDIO GAME</span>
        </div>
        
        <h1 className="font-pixel text-4xl sm:text-5xl uppercase tracking-tight leading-none">
          <span className="pixel-title-guess">GUESS THE </span>
          <span className="pixel-title-what">SONG</span>
          <span className="text-[#d7ff75] text-2xl sm:text-3xl ml-1 animate-pixel-twinkle">?</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          Identify tracks from sub-second audio clips &bull; Build your daily streak
        </p>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: DAILY SPRINT                                         */}
      {/* ============================================================ */}
      {mode === 'daily' && (
        <>
          {/* Daily Pre-Game: Tier Selection */}
          {!dailySession && (
            <div className="relative z-10 w-full flex justify-center pt-2">
              <TierSelector
                selectedTier={selectedDailyTier}
                onSelectTier={setSelectedDailyTier}
                onConfirm={handleStartDaily}
                isLoading={dailyLoading}
                modeLabel="Daily Sprint ⚡"
              />
            </div>
          )}

          {/* Daily Completed Screen: Share Modal */}
          {dailySession && (dailySession.status === 'completed' || hasCompletedToday) && (
            <div className="relative z-10 w-full flex flex-col items-center justify-center space-y-4 pt-2">
              <ShareModal session={dailySession} currentStreak={currentStreak} />
              <button
                onClick={() => setMode('unlimited')}
                className="inline-flex items-center gap-2 arcade-btn-dark px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <Play className="w-4 h-4 fill-current text-[#A8FF3E]" />
                <span>PLAY UNLIMITED PRACTICE MODE</span>
              </button>
            </div>
          )}

          {/* Daily Active Gameplay */}
          {dailySession && dailySession.status !== 'completed' && !hasCompletedToday && (
            <div className="w-full space-y-5 z-10">
              {/* Header Bar */}
              <div className="w-full flex items-center justify-between text-xs font-bold text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-[#0a140e] border border-[#22c55e]/60 text-[#A8FF3E] font-pixel text-[11px] uppercase tracking-wider shadow-[0_0_8px_rgba(34,197,94,0.2)]">
                    SONG {dailySession.activeRoundIndex + 1} / {dailySession.rounds.length}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-[#060c08] text-slate-300 border border-[#1d3d28] font-pixel text-[11px] uppercase tracking-wider">
                    {dailySession.difficultyTier}
                  </span>
                </div>

                {/* Progress Dots */}
                <div className="flex items-center gap-1.5 py-1">
                  {dailySession.rounds.map((r, idx) => {
                    const isCurrent = idx === dailySession.activeRoundIndex;
                    let dotStyle = 'bg-[#0e1c12] border-[#1d3d28]';
                    if (r.state === 'correct') {
                      dotStyle = 'bg-[#22c55e] border-[#A8FF3E] shadow-[0_0_8px_#22c55e]';
                    } else if (r.state === 'skipped' || r.state === 'exhausted') {
                      dotStyle = 'bg-rose-500 border-rose-400';
                    } else if (isCurrent) {
                      dotStyle = 'bg-[#A8FF3E] border-[#d7ff75] ring-2 ring-[#A8FF3E]/50 animate-pulse shadow-[0_0_10px_#A8FF3E]';
                    }

                    return (
                      <div
                        key={r.id}
                        className={`w-3.5 h-3.5 rounded-xs border transition-all ${dotStyle}`}
                        title={`Song ${idx + 1}: ${r.state}`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
                <div
                  className={`p-3 sm:p-4 rounded-xl bg-[#09110d] border-2 border-[#1d3d28] shadow-[0_4px_0_#14532d] flex flex-col items-center justify-center text-center transition-all ${
                    streakPopping ? 'animate-streak-pop ring-2 ring-[#A8FF3E] scale-105' : ''
                  }`}
                >
                  <span className="font-pixel text-[10px] sm:text-[11px] text-[#A8FF3E] uppercase tracking-wider flex items-center gap-1">
                    <span>🔥</span> STREAK
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white font-pixel mt-0.5">
                    {currentStreak}
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-[#09110d] border-2 border-[#1d3d28] shadow-[0_4px_0_#14532d] flex flex-col items-center justify-center text-center">
                  <span className="font-pixel text-[10px] sm:text-[11px] text-[#A8FF3E] uppercase tracking-wider flex items-center gap-1">
                    <span>★</span> SCORE
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white font-pixel mt-0.5">
                    {dailySession.score}
                  </span>
                </div>

                <div className="p-3 sm:p-4 rounded-xl bg-[#09110d] border-2 border-[#1d3d28] shadow-[0_4px_0_#14532d] flex flex-col items-center justify-center text-center">
                  <span className="font-pixel text-[10px] sm:text-[11px] text-[#A8FF3E] uppercase tracking-wider flex items-center gap-1">
                    <span>⚡</span> MODE
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-[#A8FF3E] font-pixel mt-0.5">
                    DAILY
                  </span>
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

              {/* Audio Wave Player */}
              {currentRound && (
                <AudioWavePlayer
                  key={`daily-audio-${currentRound.id}-${currentRound.currentOpportunity}`}
                  audioUrl={currentRound.audioUrl}
                  startMs={currentRound.startMs}
                  durationMs={isRoundResolved ? 5000 : currentRound.currentDurationMs}
                  autoPlay={autoPlayNext}
                />
              )}

              {/* Controls */}
              {currentRound && (
                <div>
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
                      sessionId={dailySession.id}
                      onSelectAnswer={(id) => handleSubmitGuess(id, false)}
                      onSkip={() => handleSubmitGuess(null, true)}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ============================================================ */}
      {/* MODE 2: UNLIMITED PRACTICE                                   */}
      {/* ============================================================ */}
      {mode === 'unlimited' && (
        <div className="w-full space-y-5 z-10">
          {/* Practice setup if unstarted */}
          {!unlimitedSession ? (
            <div className="w-full pixel-arcade-card p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-1">
                <h2 className="font-pixel text-2xl sm:text-3xl text-white uppercase pixel-text-white">
                  UNLIMITED PRACTICE
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  Train your musical reflexes with endless audio clips
                </p>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="font-pixel text-xs text-[#A8FF3E] uppercase tracking-wider block">
                  GENRE / CATEGORY
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-pixel uppercase transition-all ${
                        selectedCategory === cat
                          ? 'bg-[#A8FF3E] text-[#06080d] font-bold shadow-[0_0_12px_#A8FF3E] border-2 border-[#d7ff75] scale-105'
                          : 'arcade-btn-dark'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tier Selection */}
              <div className="space-y-2">
                <label className="font-pixel text-xs text-[#A8FF3E] uppercase tracking-wider block">
                  DIFFICULTY TIER
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as DifficultyTier[]).map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setSelectedUnlimitedTier(tier)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-pixel uppercase transition-all ${
                        selectedUnlimitedTier === tier
                          ? 'bg-[#A8FF3E] text-[#06080d] font-bold shadow-[0_0_12px_#A8FF3E] border-2 border-[#d7ff75] scale-105'
                          : 'arcade-btn-dark'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Launch Practice */}
              <button
                onClick={handleStartUnlimited}
                disabled={unlimitedLoading}
                className="w-full py-4 arcade-btn-green text-base font-bold flex items-center justify-center gap-2"
              >
                {unlimitedLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#06080d]" />
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-[#06080d] text-[#06080d]" />
                    <span>START PRACTICE ROUND ➜</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Active Unlimited Gameplay */
            <div className="w-full space-y-5">
              {/* Top Bar with Reset button */}
              <div className="flex items-center justify-between text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-[#0a140e] border border-[#22c55e]/60 text-[#A8FF3E] font-pixel text-[11px] uppercase tracking-wider">
                    ROUND {practiceStats.roundsPlayed + 1}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-[#060c08] text-slate-300 border border-[#1d3d28] font-pixel text-[11px] uppercase tracking-wider">
                    {unlimitedSession.difficultyTier} &bull; {selectedCategory}
                  </span>
                </div>
                <button
                  onClick={() => setUnlimitedSession(null)}
                  className="inline-flex items-center gap-1 font-pixel text-xs text-[#A8FF3E] px-3 py-1 rounded-lg border border-[#22c55e]/50 bg-[#09110d] hover:bg-[#102417] uppercase"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>NEW SETUP</span>
                </button>
              </div>

              {/* Practice Stats */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
                <div className="p-3 sm:p-4 rounded-xl bg-[#09110d] border-2 border-[#1d3d28] shadow-[0_4px_0_#14532d] flex flex-col items-center justify-center text-center">
                  <span className="font-pixel text-[10px] sm:text-[11px] text-[#A8FF3E] uppercase tracking-wider">
                    🔥 STREAK
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white font-pixel mt-0.5">
                    {practiceStats.streak}
                  </span>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-[#09110d] border-2 border-[#1d3d28] shadow-[0_4px_0_#14532d] flex flex-col items-center justify-center text-center">
                  <span className="font-pixel text-[10px] sm:text-[11px] text-[#A8FF3E] uppercase tracking-wider">
                    ★ SCORE
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white font-pixel mt-0.5">
                    {practiceStats.totalScore}
                  </span>
                </div>
                <div className="p-3 sm:p-4 rounded-xl bg-[#09110d] border-2 border-[#1d3d28] shadow-[0_4px_0_#14532d] flex flex-col items-center justify-center text-center">
                  <span className="font-pixel text-[10px] sm:text-[11px] text-[#A8FF3E] uppercase tracking-wider">
                    🎯 ACCURACY
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-[#A8FF3E] font-pixel mt-0.5">
                    {practiceStats.roundsPlayed > 0
                      ? Math.round((practiceStats.correctCount / practiceStats.roundsPlayed) * 100)
                      : 0}
                    %
                  </span>
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

              {/* Audio Wave Player */}
              {currentRound && (
                <AudioWavePlayer
                  key={`unlimited-audio-${currentRound.id}-${currentRound.currentOpportunity}`}
                  audioUrl={currentRound.audioUrl}
                  startMs={currentRound.startMs}
                  durationMs={isRoundResolved ? 5000 : currentRound.currentDurationMs}
                  autoPlay={autoPlayNext}
                />
              )}

              {/* Controls */}
              {currentRound && (
                <div>
                  {isRoundResolved ? (
                    <RoundResultBanner
                      state={currentRound.state as 'correct' | 'skipped' | 'exhausted'}
                      score={currentRound.score}
                      solvedAtAttempt={currentRound.solvedAtAttempt}
                      correctAnswer={currentRound.correctAnswer}
                      isLastRound={false}
                      onNext={handleNextRound}
                    />
                  ) : (
                    <AnswerSearchBox
                      sessionId={unlimitedSession.id}
                      onSelectAnswer={(id) => handleSubmitGuess(id, false)}
                      onSkip={() => handleSubmitGuess(null, true)}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GuessTheBangerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-[#A8FF3E]" />
        </div>
      }
    >
      <BangerGameContent />
    </Suspense>
  );
}
