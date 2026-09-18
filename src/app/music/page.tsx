import React from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/PageHeader';
import { GameCard } from '@/components/shared/GameCard';
import { ComingSoonCard } from '@/components/shared/ComingSoonCard';
import { ArrowLeft, Trophy } from 'lucide-react';

export const metadata = {
  title: 'Music Games — GuessWhat',
  description: 'Test your musical ear. Play Guess the Banger and guess songs from short audio clips.',
};

export default function MusicCategoryPage() {
  return (
    <div className="relative flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto w-full space-y-10">
      {/* Back button */}
      <div className="w-full flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Categories</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1 text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1 rounded-full transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* Header */}
      <PageHeader
        badge="Category"
        badgeEmoji="🎵"
        title="MUSIC 🎵"
        subtitle="Test your music knowledge. Listen to audio snippets, identify tracks, and prove your ear."
      />

      {/* Primary Active Game: Guess the Banger */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-xs font-black uppercase tracking-wider text-slate-500 mb-3 px-1">
          Active Game
        </div>
        <GameCard
          title="Guess the Banger"
          emoji="🔥"
          description="Guess the song from sub-second audio snippets. Choose your difficulty, test your reflexes, and build your daily streak."
          href="/music/banger"
          buttonText="PLAY"
          badge="Active Now"
          theme="amber"
        />
      </div>

      {/* Upcoming Games Grid */}
      <div className="w-full max-w-2xl mx-auto space-y-3">
        <div className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
          More Music Games (In Development)
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ComingSoonCard
            title="Guess the Artist"
            emoji="🎤"
            description="Identify legendary artists and bands from album art hints, genre tags, and discography teasers."
            category="Music"
          />
          <ComingSoonCard
            title="Guess the Lyrics"
            emoji="📜"
            description="Fill in the blanks of iconic choruses and unforgettable verses against the clock."
            category="Music"
          />
        </div>
      </div>
    </div>
  );
}
