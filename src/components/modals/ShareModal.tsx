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
        colors: ['#FACC15', '#F59E0B', '#10B981', '#FB923C'],
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
    <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 text-center space-y-6 animate-in zoom-in-95 shadow-[0_12px_40px_rgba(245,158,11,0.12)]">
      {/* Trophy Badge */}
      <div className="w-18 h-18 mx-auto rounded-3xl bg-amber-200 border-2 border-amber-400 p-1 flex items-center justify-center shadow-md shadow-amber-400/30">
        <Trophy className="w-9 h-9 text-amber-950 stroke-[2.5]" />
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Sprint Completed! 🎉
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-bold">
          Server-verified result recorded
        </p>
      </div>

      {/* Score & Streak Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
          <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider block mb-1">
            Total Score
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {session.score}
            <span className="text-xs text-amber-700 font-black ml-1">
              / {session.maxPossibleScore}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-100/70 border-2 border-amber-300">
          <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider block mb-1 flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" /> Daily Streak
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-950">
            {currentStreak} <span className="text-xs font-black text-amber-800">days</span>
          </div>
        </div>
      </div>

      {/* Spoiler-Safe Result Grid Card */}
      <div className="p-4 rounded-2xl bg-amber-50/60 border-2 border-amber-200 space-y-2">
        <span className="text-xs font-black text-amber-950 block">
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

      {/* Share Buttons in Yellow Fun Theme */}
      <div className="space-y-2.5 pt-1">
        <button
          onClick={handleNativeShare}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:opacity-95 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-400/30 border-2 border-amber-500/40 btn-tactile"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-800 stroke-[3]" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span>Share Result</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopy}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-black text-amber-900 hover:text-slate-950 flex items-center justify-center gap-1.5 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy formatted text</span>
        </button>
      </div>

      {/* Next Daily Reset Countdown */}
      {session.mode === 'daily' && (
        <div className="pt-2 border-t border-amber-200 flex items-center justify-center gap-2 text-xs text-amber-950 font-bold">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Next Daily in:</span>
          <span className="font-mono font-black text-slate-900 text-sm tracking-wider">
            {countdownStr}
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="pt-2 flex items-center justify-center gap-5 text-xs font-black">
        <Link href="/music/banger?mode=unlimited" className="text-amber-700 hover:text-amber-900">
          Play Unlimited Practice &rarr;
        </Link>
        <Link href="/challenge/new" className="text-amber-700 hover:text-amber-900">
          Challenge a Friend &rarr;
        </Link>
      </div>
    </div>
  );
}
