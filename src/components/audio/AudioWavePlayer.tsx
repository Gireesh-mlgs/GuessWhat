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
    <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-[0_8px_30px_rgba(245,158,11,0.12)] flex flex-col items-center gap-4 relative overflow-hidden transition-all">
      {/* Warm sunny animated gradient when playing */}
      {isPlaying && (
        <div className="absolute inset-0 bg-gradient-to-r from-amber-100/60 via-yellow-100/50 to-orange-100/60 animate-pulse pointer-events-none" />
      )}

      {/* Header bar: Clue timing & volume */}
      <div className="w-full flex items-center justify-between text-xs text-slate-600 z-10">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 font-black border-2 border-amber-300 shadow-xs">
            <Music className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
            <span>{durationSec}s Clip</span>
          </span>
          <span className="hidden sm:inline text-slate-500 font-bold">Press [Space] to Play</span>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1 text-slate-500 hover:text-slate-900 transition-colors rounded-lg"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16 sm:w-20 h-1.5 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
            aria-label="Volume slider"
          />
        </div>
      </div>

      {/* Main Play / Equalizer Display */}
      <div className="flex flex-col items-center gap-3 my-2 z-10 w-full max-w-sm">
        {/* Equalizer Visualizer Bars in Cheerful Yellow / Amber / Orange */}
        <div className="h-10 flex items-end justify-center gap-2 w-52">
          {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((barIdx, i) => (
            <div
              key={i}
              className={`w-2.5 rounded-full transition-all duration-100 ${isPlaying
                  ? `bg-gradient-to-t from-amber-400 via-yellow-400 to-orange-400 eq-bar-${barIdx}`
                  : 'bg-amber-100 h-2'
                }`}
              style={{
                height: isPlaying ? undefined : `${(i % 3) * 6 + 6}px`,
              }}
            />
          ))}
        </div>

        {/* Big tactile Play button in vibrant Sunny Yellow */}
        <button
          onClick={handlePlayToggle}
          disabled={disabled || isLoading}
          aria-label={isPlaying ? 'Pause audio' : playerState === 'ended' ? 'Replay audio' : 'Play audio'}
          className={`group relative w-18 h-18 rounded-3xl flex items-center justify-center transition-all transform btn-tactile shadow-lg ${disabled
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200'
              : isPlaying
                ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-amber-500/40 scale-105 border-2 border-amber-600/30'
                : 'bg-gradient-to-tr from-yellow-300 via-amber-400 to-amber-500 text-slate-950 font-black shadow-amber-400/40 hover:shadow-amber-400/60 hover:scale-105 active:scale-95 border-2 border-amber-400'
            }`}
        >
          {isLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-slate-950" />
          ) : isPlaying ? (
            <div className="w-6 h-6 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-6 bg-white rounded-full" />
              <span className="w-1.5 h-6 bg-white rounded-full" />
            </div>
          ) : playerState === 'ended' ? (
            <RotateCcw className="w-8 h-8 text-slate-950 group-hover:rotate-[-45deg] transition-transform stroke-[2.5]" />
          ) : (
            <Play className="w-8 h-8 text-slate-950 fill-slate-950 ml-1 stroke-[2.5]" />
          )}
        </button>

        <span className="text-xs font-black tracking-wide text-amber-950">
          {isLoading
            ? 'Loading snippet...'
            : isPlaying
              ? '🎵 Playing audio snippet...'
              : playerState === 'ended'
                ? 'Tap to replay snippet'
                : 'Tap to listen to clip'}
        </span>
      </div>

      {/* Progress Bar in Sunny Gradient */}
      <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden z-10 border border-amber-200">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 transition-all duration-75 ease-out rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, progressRatio * 100))}%` }}
        />
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-700 text-xs z-10">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleRetry}
            className="px-3 py-1 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-black transition-colors"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
