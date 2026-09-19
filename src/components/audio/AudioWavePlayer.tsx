'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, AlertCircle, Loader2, Music } from 'lucide-react';
import { PrecisionAudioPlayer } from '@/lib/audio/player';
import { AudioPlaybackState } from '@/lib/audio/types';

interface AudioWavePlayerProps {
  audioUrl: string;
  startMs: number;
  durationMs: number;
  onPlaybackEnded?: () => void;
  disabled?: boolean;
  autoPlay?: boolean;
}

export function AudioWavePlayer({
  audioUrl,
  startMs,
  durationMs,
  onPlaybackEnded,
  disabled = false,
  autoPlay = false,
}: AudioWavePlayerProps) {
  const [playerState, setPlayerState] = useState<AudioPlaybackState>('idle');
  const [progressRatio, setProgressRatio] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const playerRef = useRef<PrecisionAudioPlayer | null>(null);

  // Initialize and update player whenever audioUrl, startMs, or durationMs changes
  useEffect(() => {
    // Reset visual progress immediately
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProgressRatio(0);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrorMessage(null);

    const player = new PrecisionAudioPlayer();
    playerRef.current = player;
    player.setVolume(isMuted ? 0 : volume);

    const unsubState = player.onStateChange((state) => {
      setPlayerState(state);
      if (state === 'ended' && onPlaybackEnded) {
        onPlaybackEnded();
      }
    });

    const unsubProg = player.onProgress((ratio) => {
      setProgressRatio(ratio);
    });

    const unsubErr = player.onError((err) => {
      setErrorMessage(err.message);
    });

    // Load segment and optionally auto-play if requested
    player
      .load({ audioUrl, startMs, durationMs })
      .then(() => {
        if (autoPlay && playerRef.current === player) {
          player.play().catch(() => { });
        }
      })
      .catch(() => { });

    return () => {
      unsubState();
      unsubProg();
      unsubErr();
      player.stop();
      player.destroy();
      if (playerRef.current === player) {
        playerRef.current = null;
      }
    };
  }, [audioUrl, startMs, durationMs, autoPlay, onPlaybackEnded]);

  // Handle play / pause toggle
  const handlePlayToggle = useCallback(async () => {
    if (disabled || !playerRef.current) return;
    setErrorMessage(null);

    if (playerState === 'playing') {
      playerRef.current.pause();
    } else {
      try {
        await playerRef.current.play();
      } catch {
        setErrorMessage('Failed to play audio snippet');
      }
    }
  }, [disabled, playerState]);

  // Spacebar keyboard shortcut for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayToggle]);

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    playerRef.current?.setVolume(newVol);
  };

  const toggleMute = () => {
    if (isMuted) {
      const restoreVol = volume || 0.8;
      setIsMuted(false);
      playerRef.current?.setVolume(restoreVol);
    } else {
      setIsMuted(true);
      playerRef.current?.setVolume(0);
    }
  };

  const handleRetry = () => {
    setErrorMessage(null);
    playerRef.current?.load({ audioUrl, startMs, durationMs });
  };

  const isPlaying = playerState === 'playing';
  const isLoading = playerState === 'loading';
  const durationSec = (durationMs / 1000).toFixed(1);

  return (
    <div className="w-full pixel-arcade-card p-5 sm:p-6 flex flex-col items-center gap-4 relative overflow-hidden transition-all">
      {/* Subtle arcade green scanline glow when playing */}
      {isPlaying && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#A8FF3E]/10 via-[#22C55E]/5 to-transparent pointer-events-none animate-pulse" />
      )}

      {/* Header bar: Clue timing & volume */}
      <div className="w-full flex items-center justify-between text-xs text-slate-300 z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg arcade-badge text-[11px] font-bold">
            <Music className="w-3.5 h-3.5 text-[#A8FF3E] stroke-[2.5]" />
            <span>{durationSec}s CLIP</span>
          </span>
          <span className="hidden sm:inline font-pixel text-[11px] text-[#A8FF3E]/80 tracking-wide uppercase">
            [SPACE] = PLAY
          </span>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1 text-slate-400 hover:text-[#A8FF3E] transition-colors rounded-lg"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-[#A8FF3E]" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16 sm:w-20 h-1.5 bg-[#142319] border border-[#22c55e]/40 rounded-lg appearance-none cursor-pointer accent-[#A8FF3E]"
            aria-label="Volume slider"
          />
        </div>
      </div>

      {/* Main Play / Equalizer Display */}
      <div className="flex flex-col items-center gap-3.5 my-2 z-10 w-full max-w-sm">
        {/* Equalizer Visualizer Bars in Neon Green Pixel Style */}
        <div className="h-10 flex items-end justify-center gap-2 w-52 bg-black/40 px-4 py-1.5 rounded-xl border border-[#22c55e]/30">
          {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((barIdx, i) => (
            <div
              key={i}
              className={`w-2.5 rounded-[2px] transition-all duration-100 ${
                isPlaying
                  ? `bg-gradient-to-t from-[#22c55e] via-[#A8FF3E] to-[#d7ff75] shadow-[0_0_8px_#A8FF3E] eq-bar-${barIdx}`
                  : 'bg-[#18331d] h-2'
              }`}
              style={{
                height: isPlaying ? undefined : `${(i % 3) * 6 + 6}px`,
              }}
            />
          ))}
        </div>

        {/* Big Chunky Arcade Play Button in Neon Green */}
        <button
          onClick={handlePlayToggle}
          disabled={disabled || isLoading}
          aria-label={isPlaying ? 'Pause audio' : playerState === 'ended' ? 'Replay audio' : 'Play audio'}
          className={`group relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all btn-tactile ${
            disabled
              ? 'bg-[#151c17] text-slate-600 cursor-not-allowed border-2 border-slate-700'
              : isPlaying
              ? 'bg-gradient-to-b from-[#ff5252] to-[#dc2626] text-white border-2 border-[#fca5a5] shadow-[0_4px_0_#991b1b,0_0_24px_rgba(239,68,68,0.5)] scale-105'
              : 'arcade-btn-green'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-[#06080d]" />
          ) : isPlaying ? (
            <div className="w-6 h-6 flex items-center justify-center gap-1.5">
              <span className="w-2 h-6 bg-white rounded-xs shadow-[0_0_6px_#fff]" />
              <span className="w-2 h-6 bg-white rounded-xs shadow-[0_0_6px_#fff]" />
            </div>
          ) : playerState === 'ended' ? (
            <RotateCcw className="w-8 h-8 text-[#06080d] group-hover:rotate-[-45deg] transition-transform stroke-[2.8]" />
          ) : (
            <Play className="w-9 h-9 text-[#06080d] fill-[#06080d] ml-1 stroke-[2.5]" />
          )}
        </button>

        <span className="font-pixel text-xs tracking-wider uppercase text-[#A8FF3E] drop-shadow-[0_0_8px_rgba(168,255,62,0.4)]">
          {isLoading
            ? '>> LOADING AUDIO...'
            : isPlaying
            ? '>> PLAYING SNIPPET...'
            : playerState === 'ended'
            ? '>> TAP TO REPLAY CLIP'
            : '>> TAP TO PLAY SNIPPET'}
        </span>
      </div>

      {/* Progress Bar in Pixel Green Style */}
      <div className="w-full bg-[#0d1611] h-2.5 rounded-md overflow-hidden z-10 border border-[#22c55e]/50 p-[1px]">
        <div
          className="h-full bg-gradient-to-r from-[#22c55e] via-[#A8FF3E] to-[#d7ff75] transition-all duration-75 ease-out rounded-xs shadow-[0_0_8px_#A8FF3E]"
          style={{ width: `${Math.min(100, Math.max(0, progressRatio * 100))}%` }}
        />
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-rose-950/80 border-2 border-rose-500 text-rose-200 text-xs z-10">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-pixel font-bold text-[11px] transition-colors"
          >
            RETRY
          </button>
        </div>
      )}
    </div>
  );
}
