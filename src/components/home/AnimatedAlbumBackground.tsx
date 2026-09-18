'use client';

import React, { useState, useEffect, memo } from 'react';
import { BACKGROUND_ARTWORK, BackgroundArtwork } from '@/lib/music/backgroundArtwork';

interface MovingTileProps {
  artwork: BackgroundArtwork;
}

/**
 * Individual album artwork tile in the moving marquee row.
 * Renders a consistent, stable album cover that glides continuously without in-between swapping.
 */
const MovingAlbumTile = memo(function MovingAlbumTile({ artwork }: MovingTileProps) {
  return (
    <div className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-60 md:h-60 rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-white/[0.08] bg-[#111622]">
      {/* Base Artwork - loaded eagerly and stable without morphing */}
      <img
        src={artwork.url}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="sync"
        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none rounded-2xl filter brightness-[0.96] contrast-[1.05] saturate-[1.0]"
      />

      {/* Subtle sleeve inner border highlight */}
      <div className="absolute inset-0 rounded-2xl border border-white/[0.08] pointer-events-none" />
    </div>
  );
});

// 32 completely unique albums across all 4 rows (8 distinct albums per row with zero overlap)
const ROW_1_ART = BACKGROUND_ARTWORK.slice(0, 8);
const ROW_2_ART = BACKGROUND_ARTWORK.slice(8, 16);
const ROW_3_ART = BACKGROUND_ARTWORK.slice(16, 24);
const ROW_4_ART = BACKGROUND_ARTWORK.slice(24, 32);

interface MarqueeRowProps {
  artworks: BackgroundArtwork[];
  animationClass: string;
}

function MarqueeRow({ artworks, animationClass }: MarqueeRowProps) {
  // Duplicate array 2x so the marquee loops seamlessly with translateX(-50%)
  const doubled = [...artworks, ...artworks];

  return (
    <div className="flex overflow-hidden w-full select-none pointer-events-none">
      <div className={`flex gap-4 sm:gap-6 shrink-0 ${animationClass}`}>
        {doubled.map((art, idx) => (
          <MovingAlbumTile
            key={`${art.id}-${idx}`}
            artwork={art}
          />
        ))}
      </div>
    </div>
  );
}

export function AnimatedAlbumBackground() {
  // Preload all album artwork into browser cache immediately so no image loading occurs while moving
  useEffect(() => {
    BACKGROUND_ARTWORK.forEach((art) => {
      const img = new Image();
      img.src = art.url;
    });
  }, []);

  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden select-none -z-10 bg-[#06080d]"
      aria-hidden="true"
    >
      {/* LAYER 1: Continuous Moving Marquee Rows of Cover Art with bright clarity */}
      <div className="absolute -inset-10 sm:-inset-16 flex flex-col gap-4 sm:gap-6 justify-center opacity-[0.82] -rotate-[1deg] scale-[1.04]">
        <MarqueeRow
          artworks={ROW_1_ART}
          animationClass="animate-marquee-left"
        />
        <MarqueeRow
          artworks={ROW_2_ART}
          animationClass="animate-marquee-right"
        />
        <MarqueeRow
          artworks={ROW_3_ART}
          animationClass="animate-marquee-left-alt"
        />
        <MarqueeRow
          artworks={ROW_4_ART}
          animationClass="animate-marquee-right-alt"
        />
      </div>

      {/* LAYER 2: Lightened Vignette System with Minimal Fade */}
      {/* 2A: Lightened Center Radial Vignette: leaves album art vivid while keeping UI legible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(6, 8, 13, 0.45) 0%, rgba(6, 8, 13, 0.30) 45%, rgba(6, 8, 13, 0.65) 85%, rgba(6, 8, 13, 0.85) 100%)',
        }}
      />

      {/* 2B: Subtle Horizontal Edge Fades */}
      <div className="absolute inset-y-0 left-0 w-16 sm:w-24 bg-gradient-to-r from-[#06080d]/80 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 sm:w-24 bg-gradient-to-l from-[#06080d]/80 to-transparent pointer-events-none" />

      {/* 2C: Subtle Vertical Edge Fades */}
      <div className="absolute top-0 inset-x-0 h-16 sm:h-24 bg-gradient-to-b from-[#06080d]/80 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-16 sm:h-24 bg-gradient-to-t from-[#06080d]/80 to-transparent pointer-events-none" />
    </div>
  );
}
