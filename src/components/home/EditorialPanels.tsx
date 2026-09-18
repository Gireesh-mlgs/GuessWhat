'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Compass } from 'lucide-react';

interface ModePanelData {
  id: string;
  title: string;
  line1: string;
  line2: string;
  href: string;
  image: string;
  accentHint: string;
}

const MODES: ModePanelData[] = [
  {
    id: 'music',
    title: 'MUSIC',
    line1: 'Guess songs & artists',
    line2: 'from audio clips',
    href: '/music',
    image: '/images/modes/music-panel.jpg?v=2',
    accentHint: 'rgba(236, 72, 153, 0.2)',
  },
  {
    id: 'movies',
    title: 'MOVIES',
    line1: 'Guess iconic cinema',
    line2: 'from scenes & quotes',
    href: '/movies',
    image: '/images/modes/movies-panel.png?v=2',
    accentHint: 'rgba(245, 158, 11, 0.2)',
  },
  {
    id: 'maps',
    title: 'MAPS',
    line1: 'Guess world places',
    line2: 'and famous landmarks',
    href: '/maps',
    image: '/images/modes/maps-panel.jpg?v=2',
    accentHint: 'rgba(56, 189, 248, 0.2)',
  },
];

export function EditorialPanels() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Geometry: W is panel width, S is diagonal slant offset, G is parallel gap
  const W = 350; // Panel width
  const S = 95;  // Slant offset in pixels
  const G = -2.5; // Negative gap for seamless subpixel overlap
  const step = W - S + G; // 252.5px step
  const totalWidth = (MODES.length - 1) * step + W; // 855px

  return (
    <>
      {/* DESKTOP VIEW: Three Tall Angled Cinematic Slices Stretching Top to Bottom */}
      <div className="hidden lg:flex items-stretch justify-end h-full min-h-screen select-none">
        <div
          className="relative h-full min-h-screen"
          style={{ width: `${totalWidth}px` }}
        >
          {MODES.map((mode, index) => {
            const isHovered = hoveredIdx === index;
            const isAnyHovered = hoveredIdx !== null;
            const isOtherHovered = isAnyHovered && !isHovered;

            return (
              <Link
                key={mode.id}
                href={mode.href}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{
                  position: 'absolute',
                  left: `${index * step}px`,
                  top: 0,
                  bottom: 0,
                  height: '100%',
                  width: `${W}px`,
                  clipPath: `polygon(${S}px 0%, calc(100% + 4px) 0%, calc(100% - ${S}px + 4px) 100%, 0% 100%)`,
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                }}
                className={`group cursor-pointer overflow-hidden transition-all duration-300 ease-out will-change-transform opacity-100 ${
                  isHovered
                    ? 'z-30'
                    : isOtherHovered
                    ? 'z-10 brightness-85'
                    : 'z-20 brightness-100'
                }`}
              >
                {/* 1. SOLID OPAQUE BACKPLATE */}
                <div className="absolute inset-0 bg-[#06080d]" />

                {/* 2. Full-bleed background image with subtle brightness boost on hover */}
                <img
                  src={mode.image}
                  alt={mode.title}
                  loading="eager"
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out will-change-transform ${
                    isHovered ? 'scale-105 brightness-110' : 'scale-100 brightness-100'
                  } ${
                    mode.id === 'music'
                      ? 'object-[50%_35%]'
                      : mode.id === 'movies'
                      ? 'object-[55%_18%]'
                      : 'object-center'
                  }`}
                />

                {/* 3. CINEMATIC GRADIENT OVERLAY: Transparent top -> dark lower -> subtle neon lime tint */}
                <div
                  className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
                    isHovered ? 'opacity-95' : 'opacity-100'
                  }`}
                  style={{
                    background: isHovered
                      ? 'linear-gradient(to bottom, rgba(0,0,0,0) 18%, rgba(0,0,0,0.12) 42%, rgba(0,0,0,0.70) 80%, rgba(168,255,62,0.24) 100%)'
                      : 'linear-gradient(to bottom, rgba(0,0,0,0) 20%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.72) 82%, rgba(168,255,62,0.18) 100%)',
                  }}
                />

                {/* 4. Top subtle shadow for navbar contrast */}
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

                {/* 5. Non-hover dimming overlay for siblings */}
                <div
                  className={`absolute inset-0 bg-black/50 pointer-events-none transition-opacity duration-300 ${
                    isOtherHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* 6. Subtle lime bottom atmospheric glow on hover */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  style={{
                    opacity: isHovered ? 0.75 : 0.35,
                    background: 'radial-gradient(circle at 50% 92%, rgba(168,255,62,0.32) 0%, transparent 60%)',
                  }}
                />

                {/* 7. Top ambient glass highlight on hover */}
                <div
                  className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/[0.10] to-transparent pointer-events-none transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}
                />

                {/* Lower Portion Content: Perfectly centered in the card */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    margin: '0 auto',
                    width: '260px',
                  }}
                  className="pb-10 xl:pb-14 flex flex-col items-center text-center px-4"
                >
                  {/* Title & 2-line Subtitle */}
                  <div
                    className="flex flex-col items-center text-center transition-transform duration-300 ease-out"
                    style={{
                      transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                    }}
                  >
                    <h2 className="text-2xl xl:text-3xl font-black italic text-white tracking-widest uppercase mb-1.5 drop-shadow-md text-center">
                      {mode.title}
                    </h2>

                    <p className="text-xs xl:text-[13px] text-[#D8D8D8] font-medium italic tracking-wide leading-snug mb-4 max-w-[200px] text-center">
                      {mode.line1}
                      <br />
                      {mode.line2}
                    </p>
                  </div>

                  {/* Circular Interactive Arrow Button with #A8FF3E Neon Lime Glow */}
                  <div
                    className={`w-11 h-11 xl:w-12 xl:h-12 rounded-full border border-[#A8FF3E]/50 bg-[#A8FF3E]/10 text-[#A8FF3E] flex items-center justify-center transition-all duration-300 ease-out mb-4 ${
                      isHovered
                        ? 'scale-110 border-[#A8FF3E] bg-[#A8FF3E]/25 text-white shadow-[0_0_22px_rgba(168,255,62,0.65)]'
                        : 'shadow-[0_0_12px_rgba(168,255,62,0.25)]'
                    }`}
                  >
                    <ArrowRight
                      className={`w-4 h-4 xl:w-4.5 xl:h-4.5 stroke-[2.4] transition-transform duration-300 ${
                        isHovered ? 'translate-x-0.5' : ''
                      }`}
                    />
                  </div>

                  {/* Bottom Decorative Element */}
                  {mode.id === 'music' && (
                    <div className="flex flex-col items-center text-center gap-1.5 select-none">
                      {/* Equalizer Waveform Bars with Lime Neon Accents */}
                      <div className="flex items-end justify-center gap-1 h-5">
                        <div className="w-[2.5px] bg-[#A8FF3E] rounded-full eq-wave-bar-1" />
                        <div className="w-[2.5px] bg-[#D7FF75] rounded-full eq-wave-bar-2" />
                        <div className="w-[2.5px] bg-[#A8FF3E] rounded-full eq-wave-bar-3" />
                        <div className="w-[2.5px] bg-[#D7FF75] rounded-full eq-wave-bar-4" />
                        <div className="w-[2.5px] bg-[#A8FF3E] rounded-full eq-wave-bar-5" />
                        <div className="w-[2.5px] bg-[#D7FF75] rounded-full eq-wave-bar-6" />
                        <div className="w-[2.5px] bg-[#A8FF3E] rounded-full eq-wave-bar-7" />
                      </div>
                      <span className="text-[10px] font-bold italic tracking-[0.22em] text-[#A8FF3E]/90 uppercase">
                        FEEL THE BEAT
                      </span>
                    </div>
                  )}

                  {mode.id === 'movies' && (
                    <div className="flex flex-col items-center text-center select-none max-w-[190px]">
                      <p className="text-[11px] text-[#D8D8D8]/90 italic font-normal tracking-wide leading-tight text-center mb-1.5">
                        &ldquo;Every frame tells a story.&rdquo;
                      </p>
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-[9px] font-bold italic tracking-[0.2em] text-[#A8FF3E]/90 uppercase">
                          CINEMA TRIVIA
                        </span>
                      </div>
                    </div>
                  )}

                  {mode.id === 'maps' && (
                    <div className="flex flex-col items-center text-center gap-1 select-none">
                      <div className="text-[#A8FF3E] opacity-90 group-hover:rotate-45 transition-transform duration-500">
                        <Compass className="w-4 h-4 stroke-[2]" />
                      </div>
                      <span className="text-[10px] font-bold italic tracking-[0.22em] text-[#A8FF3E]/90 uppercase">
                        EXPLORE THE GLOBE
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* MOBILE & TABLET VIEW */}
      <div className="lg:hidden w-full flex flex-col gap-4 py-6 max-w-xl mx-auto px-4">
        {MODES.map((mode) => (
          <Link
            key={mode.id}
            href={mode.href}
            className="relative h-48 sm:h-56 w-full rounded-2xl overflow-hidden border border-white/[0.1] group cursor-pointer shadow-xl transition-all duration-300 active:scale-[0.98] hover:-translate-y-1 bg-[#06080d] opacity-100"
          >
            {/* Solid dark base */}
            <div className="absolute inset-0 bg-[#06080d]" />

            {/* Background image */}
            <img
              src={mode.image}
              alt={mode.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-500"
            />

            {/* Cinematic Gradient Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 50%, rgba(168,255,62,0.12) 100%)',
              }}
            />

            {/* Centered Content */}
            <div className="relative z-10 h-full p-6 flex flex-col items-center justify-center text-center gap-2">
              <h3 className="text-2xl sm:text-3xl font-black italic text-white tracking-widest uppercase drop-shadow-md">
                {mode.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#D8D8D8] font-medium italic max-w-[260px]">
                {mode.line1} {mode.line2}
              </p>

              {/* Action Circle with Lime Glow */}
              <div className="mt-1 w-10 h-10 rounded-full border border-[#A8FF3E]/50 bg-[#A8FF3E]/10 text-[#A8FF3E] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-[#A8FF3E] group-hover:bg-[#A8FF3E]/25 group-hover:text-white shadow-[0_0_16px_rgba(168,255,62,0.35)] group-hover:shadow-[0_0_24px_rgba(168,255,62,0.7)]">
                <ArrowRight className="w-4 h-4 stroke-[2.4] group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
