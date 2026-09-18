'use client';

import React from 'react';
import Link from 'next/link';
import { HelpCircle, Clock, Zap, Music, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { REVEAL_SCHEDULE, DIFFICULTY_MULTIPLIERS } from '@/lib/game/scoring';

export default function HowItWorksPage() {
  return (
    <div className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12 max-w-3xl mx-auto w-full space-y-8">
      {/* Back button */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-0.5 shadow-md shadow-amber-400/25">
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
            <HelpCircle className="w-7 h-7 text-amber-600" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">How It Works</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-medium">
          Rules, reveal timings, scoring multipliers, and fair-play mechanics behind GuessWhat & Guess the Banger.
        </p>
      </div>

      {/* 1. The Core Loop */}
      <section className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-amber-700 font-extrabold text-lg">
          <Clock className="w-5 h-5 text-amber-600" />
          <h2>1. The 00:00 UTC Daily Reset</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          Every calendar day at <strong>00:00 UTC</strong>, GuessWhat publishes a fresh set of five curated songs for Guess the Banger. Every player worldwide gets the exact same ordered tracks and clues.
        </p>
        <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5 font-medium">
          <li><strong>One Scored Run:</strong> Each player gets exactly one scored completion per UTC day on the leaderboard.</li>
          <li><strong>Daily Streaks:</strong> Completing the Daily continues your streak. Unlimited practice never modifies your daily streak.</li>
          <li><strong>Locked Tier:</strong> You choose your difficulty before starting, which is locked for that run.</li>
        </ul>
      </section>

      {/* 2. Reveal Schedule Table */}
      <section className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-amber-700 font-extrabold text-lg">
          <Music className="w-5 h-5 text-amber-600" />
          <h2>2. Reveal Schedule & Base Points</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          Each song gives you up to five answer opportunities with progressively longer playable snippets:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-amber-100 text-slate-700 font-black">
                <th className="py-2.5 px-3">Opportunity</th>
                <th className="py-2.5 px-3">Playable Clip Length</th>
                <th className="py-2.5 px-3">Base Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 font-semibold text-slate-700">
              {REVEAL_SCHEDULE.map((s) => (
                <tr key={s.opportunity} className="hover:bg-amber-50/60">
                  <td className="py-2.5 px-3 text-slate-900 font-bold">Opportunity #{s.opportunity}</td>
                  <td className="py-2.5 px-3 font-mono text-amber-700">{s.durationSec} seconds</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-bold">{s.basePoints} pts</td>
                </tr>
              ))}
              <tr className="text-slate-400">
                <td className="py-2.5 px-3">Skip / Exhausted</td>
                <td className="py-2.5 px-3">—</td>
                <td className="py-2.5 px-3">0 pts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Difficulty Multipliers */}
      <section className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-amber-700 font-extrabold text-lg">
          <Zap className="w-5 h-5 text-amber-600" />
          <h2>3. Difficulty Multipliers</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          Your round score equals <code className="bg-amber-100 px-2 py-0.5 rounded text-amber-950 font-bold">base points × difficulty multiplier</code>.
          Maximum score per song is <strong>25 points</strong> on Impossible tier, yielding a maximum 5-song Daily score of <strong>125 points</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(DIFFICULTY_MULTIPLIERS).map(([tier, info]) => (
            <div key={tier} className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">{tier}</span>
                <span className="text-xs font-mono font-extrabold text-amber-700">{info.multiplier}× Multiplier</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{info.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Answer Acceptance & Normalization */}
      <section className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h2>4. Answer Acceptance & Normalization</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
          The game uses server-verified searchable selection. You select a song from eligible candidates:
        </p>
        <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5 font-medium">
          <li><strong>Accent-Insensitive:</strong> Diacritics are normalized (e.g. <em>Beyoncé</em> matches <em>Beyonce</em>).</li>
          <li><strong>Punctuation & Case:</strong> Commas, hyphens, and apostrophes are ignored.</li>
          <li><strong>Featuring Artists & Edits:</strong> Common suffixes like <code>feat.</code>, <code>[Remastered]</code>, and <code>(Radio Edit)</code> are parsed cleanly.</li>
          <li><strong>Zero Answer Leaks:</strong> Search suggestions return active eligible pool songs matching your query, never exposing hidden game metadata.</li>
        </ul>
      </section>

      {/* 5. Audio Policy */}
      <section className="w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-amber-700 font-extrabold text-lg">
          <ShieldCheck className="w-5 h-5 text-amber-600" />
          <h2>5. Lawful Audio Policy</h2>
        </div>
        <p className="text-xs text-sm text-slate-600 leading-relaxed font-medium">
          GuessWhat operates strictly on certified Creative Commons (CC-BY 4.0), royalty-free, and lawful music previews. We do not download, store, host, or stream unlicensed commercial music.
        </p>
      </section>
    </div>
  );
}
