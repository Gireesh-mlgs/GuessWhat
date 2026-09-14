'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, AlertCircle, Loader2 } from 'lucide-react';
import { PrecisionAudioPlayer } from '@/lib/audio/player';
import { AudioPlaybackState } from '@/lib/audio/types';

interface AudioWavePlayerProps {
  audioUrl: string;
  startMs: number;
  durationMs: number;
  onPlaybackEnded?: () => void;
  disabled?: boolean;
}

export function AudioWavePlayer({
  audioUrl,
  startMs,
  durationMs,
  onPlaybackEnded,
  disabled = false,
}: AudioWavePlayerProps) {
  const [playerState, setPlayerState] = useState<AudioPlaybackState>('idle');
  const [progressRatio, setProgressRatio] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const playerRef = useRef<PrecisionAudioPlayer | null>(null);

  // Initialize or update player
  useEffect(() => {
    const player = new PrecisionAudioPlayer();
    playerRef.current = player;

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

    // Load initial segment
    player.load({ audioUrl, startMs, durationMs });

    return () => {
      unsubState();
      unsubProg();
      unsubErr();
      player.destroy();
      playerRef.current = null;
    };
  }, [audioUrl, startMs, durationMs, onPlaybackEnded]);

  // Handle play / replay
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
      // Ignore if user is currently typing in an input
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
    <div className="w-full glass-panel rounded-2xl p-5 border border-white/10 flex flex-col items-center gap-4 relative overflow-hidden">
      {/* Dynamic soundwave gradient background when playing */}
      {isPlaying && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/15 to-pink-500/10 animate-pulse pointer-events-none" />
      )}

      {/* Header bar: Clue timing & volume */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 z-10">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30">
            {durationSec}s Clip
          </span>
          <span className="hidden sm:inline text-slate-500">Press [Space] to Play</span>
        </div>

        {/* Volume controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
            className="w-16 sm:w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            aria-label="Volume slider"
          />
        </div>
      </div>

      {/* Main Play / Equalizer Display */}
      <div className="flex flex-col items-center gap-3 my-2 z-10 w-full max-w-sm">
        {/* Equalizer Visualizer Bars */}
        <div className="h-10 flex items-end justify-center gap-1.5 w-48">
          {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((barIdx, i) => (
            <div
              key={i}
              className={`w-2.5 rounded-full transition-all duration-100 ${
                isPlaying
                  ? `bg-gradient-to-t from-cyan-400 to-pink-400 eq-bar-${barIdx}`
                  : 'bg-slate-700/60 h-2'
              }`}
              style={{
                height: isPlaying ? undefined : `${(i % 3) * 6 + 6}px`,
              }}
            />
          ))}
        </div>

        {/* Big tactile Play button */}
        <button
          onClick={handlePlayToggle}
          disabled={disabled || isLoading}
          aria-label={isPlaying ? 'Pause audio' : playerState === 'ended' ? 'Replay audio' : 'Play audio'}
          className={`group relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all transform active:scale-95 shadow-xl ${
            disabled
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : isPlaying
              ? 'bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-pink-500/30'
              : 'bg-gradient-to-tr from-cyan-500 to-purple-600 text-white hover:shadow-cyan-500/40 hover:scale-105'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-7 h-7 animate-spin text-white" />
          ) : isPlaying ? (
            <div className="w-5 h-5 flex items-center justify-between">
              <span className="w-1.5 h-5 bg-white rounded-full" />
              <span className="w-1.5 h-5 bg-white rounded-full" />
            </div>
          ) : playerState === 'ended' ? (
            <RotateCcw className="w-7 h-7 text-white group-hover:rotate-[-45deg] transition-transform" />
          ) : (
            <Play className="w-7 h-7 text-white fill-white ml-0.5" />
          )}
        </button>

        <span className="text-xs font-semibold tracking-wide text-slate-300">
          {isLoading
            ? 'Loading clip...'
            : isPlaying
            ? 'Playing snippet...'
            : playerState === 'ended'
            ? 'Tap to replay'
            : 'Tap to listen'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden z-10">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 transition-all duration-75 ease-out rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, progressRatio * 100))}%` }}
        />
      </div>

      {/* Error state alert */}
      {errorMessage && (
        <div className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs z-10">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={handleRetry}
            className="px-2.5 py-1 rounded-lg bg-rose-500/30 hover:bg-rose-500/50 text-white font-medium"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
