'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { AnimationItem } from 'lottie-web';
import animationData from './assets/interactive-volume.json';

interface MusicCardLottieProps {
  isHovered?: boolean;
}

export default function MusicCardLottie({ isHovered = false }: MusicCardLottieProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check user prefers-reduced-motion setting
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initialize Lottie instance
  useEffect(() => {
    let anim: AnimationItem | null = null;
    let isMounted = true;

    import('lottie-web').then((lottieModule) => {
      if (!isMounted || !containerRef.current) return;
      const lottie = lottieModule.default || lottieModule;

      try {
        anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: !prefersReducedMotion,
          animationData: animationData,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
            progressiveLoad: true,
          },
        });

        animRef.current = anim;

        if (prefersReducedMotion) {
          anim.goToAndStop(0, true);
        } else {
          anim.setSpeed(isHovered ? 1.3 : 1.0);
        }
      } catch (err) {
        console.error('Failed to load Lottie animation:', err);
      }
    });

    return () => {
      isMounted = false;
      if (anim) {
        anim.destroy();
      }
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [prefersReducedMotion]);

  // Subtle speed / presence change on hover
  useEffect(() => {
    if (!animRef.current) return;
    if (prefersReducedMotion) {
      animRef.current.pause();
      return;
    }

    if (isHovered) {
      animRef.current.setSpeed(1.3);
      animRef.current.play();
    } else {
      animRef.current.setSpeed(1.0);
      animRef.current.play();
    }
  }, [isHovered, prefersReducedMotion]);

  return (
    <div
      className="relative flex items-center justify-center pointer-events-none select-none w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl overflow-hidden bg-white/[0.08] border border-white/25 shadow-sm transition-all duration-300 group-hover:border-white/40 group-hover:bg-white/[0.14]"
      aria-hidden="true"
    >
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center transition-opacity duration-300 filter group-hover:brightness-110"
      />
    </div>
  );
}
