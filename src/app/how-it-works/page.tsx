'use client';

import React from 'react';
import { HelpCircle, Clock, Zap, Music, CheckCircle2, ShieldCheck } from 'lucide-react';
import { REVEAL_SCHEDULE, DIFFICULTY_MULTIPLIERS } from '@/lib/game/scoring';

export default function HowItWorksPage() {
  return (
    <div className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12 max-w-3xl mx-auto w-full space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-cyan-400" />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">How It Works</h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Rules, reveal timings, scoring multipliers, and fair-play mechanics behind SongSprint.
        </p>
      </div>

      {/* 1. The Core Loop */}
      <section className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-lg">
          <Clock className="w-5 h-5" />
          <h2>1. The 00:00 UTC Daily Reset</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Every calendar day at <strong>00:00 UTC</strong>, SongSprint publishes a fresh set of five curated songs. Every player worldwide gets the exact same ordered tracks and clues.
        </p>
        <ul className="text-xs text-slate-400 space-y-2 list-disc pl-5">
          <li><strong>One Scored Run:</strong> Each player or device gets exactly one scored completion per UTC day.</li>
          <li><strong>Daily Streaks:</strong> Completing the Daily continues your streak. Streaks only update from Daily mode (Unlimited practice and Challenges never modify your streak).</li>
          <li><strong>Locked Tier:</strong> You choose your difficulty before starting, which is locked for that run.</li>
        </ul>
      </section>

      {/* 2. Reveal Schedule Table */}
      <section className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-purple-400 font-extrabold text-lg">
          <Music className="w-5 h-5" />
          <h2>2. Reveal Schedule & Base Points</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Each song gives you up to five answer opportunities with progressively longer playable snippets:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400">
                <th className="py-2.5 px-3">Opportunity</th>
                <th className="py-2.5 px-3">Playable Clip Length</th>
                <th className="py-2.5 px-3">Base Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {REVEAL_SCHEDULE.map((s) => (
                <tr key={s.opportunity} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 text-white font-bold">Opportunity #{s.opportunity}</td>
                  <td className="py-2.5 px-3 font-mono text-cyan-400">{s.durationSec} seconds</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{s.basePoints} pts</td>
                </tr>
              ))}
              <tr className="text-slate-500">
                <td className="py-2.5 px-3">Skip / Exhausted</td>
                <td className="py-2.5 px-3">—</td>
                <td className="py-2.5 px-3">0 pts</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Difficulty Multipliers */}
      <section className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-pink-400 font-extrabold text-lg">
          <Zap className="w-5 h-5" />
          <h2>3. Difficulty Multipliers</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Your round score equals <code className="bg-slate-900 px-2 py-0.5 rounded text-cyan-300">base points × difficulty multiplier</code>.
          Maximum score per song is <strong>25 points</strong> on Impossible tier, yielding a maximum 5-song Daily score of <strong>125 points</strong>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(DIFFICULTY_MULTIPLIERS).map(([tier, info]) => (
            <div key={tier} className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{tier}</span>
                <span className="text-xs font-mono font-extrabold text-pink-400">{info.multiplier}× Multiplier</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{info.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Answer Acceptance & Search Normalization */}
      <section className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-lg">
          <CheckCircle2 className="w-5 h-5" />
          <h2>4. Answer Acceptance & Normalization</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          The game uses server-verified searchable selection. You select a song from eligible candidates:
        </p>
        <ul className="text-xs text-slate-400 space-y-2 list-disc pl-5">
          <li><strong>Accent-Insensitive:</strong> Diacritics are normalized (e.g. <em>Beyoncé</em> matches <em>Beyonce</em>).</li>
          <li><strong>Punctuation & Case:</strong> Commas, hyphens, and apostrophes are ignored.</li>
          <li><strong>Featuring Artists & Edits:</strong> Common suffixes like <code>feat.</code>, <code>[Remastered]</code>, and <code>(Radio Edit)</code> are parsed cleanly.</li>
          <li><strong>Zero Answer Leaks:</strong> Search suggestions return active eligible pool songs matching your query, never exposing hidden game metadata.</li>
        </ul>
      </section>

      {/* 5. Legal Audio Policy */}
      <section className="w-full glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-extrabold text-lg">
          <ShieldCheck className="w-5 h-5" />
          <h2>5. Lawful Audio Policy</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          SongSprint operates strictly on certified Creative Commons (CC-BY 4.0), royalty-free, and lawful music previews. We do not download, store, host, or stream unlicensed commercial music.
        </p>
      </section>
    </div>
  );
}
