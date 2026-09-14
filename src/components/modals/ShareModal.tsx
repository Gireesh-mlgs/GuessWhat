'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Copy, Check, Share2, Flame, Trophy, Clock } from 'lucide-react';
import type { PublicSessionState } from '@/lib/game/types';
import { getMillisecondsUntilNextUtcMidnight } from '@/lib/game/timing';

interface ShareModalProps {
  session: PublicSessionState;
  currentStreak?: number;
}

export function ShareModal({ session, currentStreak = 1 }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareText, setShareText] = useState<string>('');
  const [msLeft, setMsLeft] = useState<number>(getMillisecondsUntilNextUtcMidnight());

  // Fire celebratory confetti on mount!
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981'],
      });
    } catch {
      // safe fallback
    }

    // Fetch spoiler-safe text
    fetch(`/api/v1/results/${session.id}/share`, { method: 'POST' })
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data?.shareText) {
          setShareText(json.data.shareText);
        }
      })
      .catch(() => {});

    // Countdown timer interval
    const timer = setInterval(() => {
      setMsLeft(getMillisecondsUntilNextUtcMidnight());
    }, 1000);

    return () => clearInterval(timer);
  }, [session.id]);

  const handleCopy = async () => {
    if (!shareText) return;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (!shareText) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SongSprint Results',
          text: shareText,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  // Format countdown hh:mm:ss
  const totalSec = Math.max(0, Math.floor(msLeft / 1000));
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  const countdownStr = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <div className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 text-center space-y-6 animate-in zoom-in-95">
      {/* Trophy Badge */}
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 p-0.5 shadow-xl shadow-cyan-500/25">
        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
          <Trophy className="w-8 h-8 text-cyan-400" />
        </div>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Sprint Completed!
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Server-verified result recorded
        </p>
      </div>

      {/* Score & Streak Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Score
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {session.score}
            <span className="text-xs text-slate-500 font-medium ml-1">
              / {session.maxPossibleScore}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5" /> Daily Streak
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {currentStreak} <span className="text-xs font-bold text-amber-400">days</span>
          </div>
        </div>
      </div>

      {/* Spoiler-Safe Result Grid Card */}
      <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3">
        <span className="text-xs font-semibold text-slate-400 block">
          Spoiler-Safe Results
        </span>
        <div className="flex items-center justify-center gap-2 text-2xl">
          {session.rounds.map((r) => {
            if (r.state !== 'correct') return <span key={r.id}>⬛</span>;
            if (r.solvedAtAttempt === 1 || r.solvedAtAttempt === 2) return <span key={r.id}>🟩</span>;
            if (r.solvedAtAttempt === 3 || r.solvedAtAttempt === 4) return <span key={r.id}>🟨</span>;
            return <span key={r.id}>🟧</span>;
          })}
        </div>
      </div>

      {/* Share Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleNativeShare}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 transition-all transform active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Share Spoiler-Free Result</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopy}
          className="w-full py-2.5 px-4 rounded-xl text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy formatted text</span>
        </button>
      </div>

      {/* Next Daily Reset Countdown */}
      {session.mode === 'daily' && (
        <div className="pt-2 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Next Daily in:</span>
          <span className="font-mono font-bold text-white text-sm tracking-wider">
            {countdownStr}
          </span>
        </div>
      )}

      {/* Navigation to Unlimited or Challenge */}
      <div className="pt-2 flex items-center justify-center gap-4 text-xs font-semibold">
        <Link href="/unlimited" className="text-cyan-400 hover:text-cyan-300">
          Play Unlimited Practice &rarr;
        </Link>
        <Link href="/challenge/new" className="text-purple-400 hover:text-purple-300">
          Challenge a Friend &rarr;
        </Link>
      </div>
    </div>
  );
}
