export type AudioPlaybackState = 'idle' | 'loading' | 'playing' | 'paused' | 'ended' | 'error';

export interface PlaybackSegment {
  audioUrl: string;
  startMs: number;
  durationMs: number; // Clamp duration in ms (100ms, 500ms, 1000ms, 2000ms, 5000ms)
}

export interface AudioPlayerError {
  message: string;
  code: 'NETWORK_ERROR' | 'DECODE_ERROR' | 'ABORTED' | 'NOT_SUPPORTED';
}
