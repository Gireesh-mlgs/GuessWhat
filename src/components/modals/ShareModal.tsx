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
    <div className="w-full max-w-md pixel-arcade-card p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 shadow-[0_0_35px_rgba(34,197,94,0.25)]">
      {/* Trophy Badge */}
      <div className="w-18 h-18 mx-auto rounded-2xl bg-[#102417] border-2 border-[#22c55e] p-1 flex items-center justify-center shadow-[0_0_20px_rgba(168,255,62,0.4)]">
        <Trophy className="w-9 h-9 text-[#A8FF3E] stroke-[2.5]" />
      </div>

      <div className="space-y-1">
        <h2 className="font-pixel text-2xl sm:text-3xl text-white tracking-tight uppercase pixel-text-white">
          SPRINT COMPLETED! ★
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 font-medium">
          Server-verified result recorded
        </p>
      </div>

      {/* Score & Streak Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-[#09110d] border-2 border-[#1d3d28]">
          <span className="font-pixel text-[11px] text-[#A8FF3E] uppercase tracking-wider block mb-1">
            TOTAL SCORE
          </span>
          <div className="text-2xl sm:text-3xl font-black text-white font-pixel">
            {session.score}
            <span className="text-xs text-slate-400 ml-1">
              / {session.maxPossibleScore}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#09110d] border-2 border-[#1d3d28]">
          <span className="font-pixel text-[11px] text-[#A8FF3E] uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#A8FF3E] fill-[#A8FF3E]" /> DAILY STREAK
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[#A8FF3E] font-pixel">
            {currentStreak} <span className="text-xs text-slate-400">DAYS</span>
          </div>
        </div>
      </div>

      {/* Spoiler-Safe Result Grid Card */}
      <div className="p-4 rounded-xl bg-[#070d09] border-2 border-[#1d3d28] space-y-2">
        <span className="font-pixel text-xs text-[#A8FF3E] uppercase tracking-wide block">
          SPOILER-SAFE RESULTS
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

      {/* Share Buttons in Arcade Theme */}
      <div className="space-y-2.5 pt-1">
        <button
          onClick={handleNativeShare}
          className="w-full py-4 px-6 arcade-btn-green font-bold text-sm flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#06080d] stroke-[3]" />
              <span>COPIED TO CLIPBOARD!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-[#06080d] stroke-[2.5]" />
              <span>SHARE RESULT</span>
            </>
          )}
        </button>

        <button
          onClick={handleCopy}
          className="w-full py-2.5 px-4 arcade-btn-dark text-xs font-bold flex items-center justify-center gap-1.5"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>COPY FORMATTED TEXT</span>
        </button>
      </div>

      {/* Next Daily Reset Countdown */}
      {session.mode === 'daily' && (
        <div className="pt-2 border-t border-[#1d3d28] flex items-center justify-center gap-2 text-xs text-slate-300">
          <Clock className="w-4 h-4 text-[#A8FF3E]" />
          <span className="font-pixel uppercase text-[11px] text-[#A8FF3E]">NEXT DAILY IN:</span>
          <span className="font-mono font-black text-white text-sm tracking-wider">
            {countdownStr}
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="pt-2 flex items-center justify-center gap-5 text-xs font-pixel uppercase tracking-wide">
        <Link href="/music/banger?mode=unlimited" className="text-[#A8FF3E] hover:underline">
          UNLIMITED PRACTICE &rarr;
        </Link>
        <Link href="/challenge/new" className="text-[#A8FF3E] hover:underline">
          CHALLENGE A FRIEND &rarr;
        </Link>
      </div>
    </div>
  );
}
