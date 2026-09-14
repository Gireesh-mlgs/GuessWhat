import { AudioPlaybackState, AudioPlayerError, PlaybackSegment } from './types';

export class PrecisionAudioPlayer {
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private currentBuffer: AudioBuffer | null = null;
  private currentSourceNode: AudioBufferSourceNode | null = null;

  private currentSegment: PlaybackSegment | null = null;
  private state: AudioPlaybackState = 'idle';
  private volume: number = 0.8;
  private stateListeners: Set<(state: AudioPlaybackState) => void> = new Set();
  private progressListeners: Set<(progressRatio: number, elapsedMs: number) => void> = new Set();
  private errorListeners: Set<(error: AudioPlayerError) => void> = new Set();

  private bufferCache: Map<string, AudioBuffer> = new Map();
  private rafId: number | null = null;
  private playbackStartTime: number = 0;

  constructor() {
    // Lazy AudioContext initialization on user gesture
  }

  private initAudioContext(): AudioContext {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 64;

      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(this.audioContext.destination);
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  public async load(segment: PlaybackSegment): Promise<void> {
    this.stopPlayback();
    this.currentSegment = segment;
    this.setState('loading');

    try {
      if (this.bufferCache.has(segment.audioUrl)) {
        this.currentBuffer = this.bufferCache.get(segment.audioUrl)!;
        this.setState('paused');
        return;
      }

      const response = await fetch(segment.audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to load audio (${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const ctx = this.initAudioContext();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      this.bufferCache.set(segment.audioUrl, decoded);
      this.currentBuffer = decoded;
      this.setState('paused');
    } catch (err: unknown) {
      this.setState('error');
      const msg = err instanceof Error ? err.message : 'Audio decode failed';
      this.notifyError({ message: msg, code: 'DECODE_ERROR' });
    }
  }

  public async play(): Promise<void> {
    if (!this.currentSegment || !this.currentBuffer) {
      return;
    }

    const ctx = this.initAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    this.stopPlayback();

    const source = ctx.createBufferSource();
    source.buffer = this.currentBuffer;
    source.connect(this.gainNode!);
    this.currentSourceNode = source;

    const startSec = (this.currentSegment.startMs || 0) / 1000;
    const durationSec = Math.max(0.05, this.currentSegment.durationMs / 1000);

    // Exact sub-second audio clamp: Web Audio schedule stops precisely at startSec + durationSec
    source.start(0, startSec, durationSec);
    this.playbackStartTime = performance.now();
    this.setState('playing');

    source.onended = () => {
      if (this.currentSourceNode === source) {
        this.currentSourceNode = null;
        this.setState('ended');
        this.notifyProgress(1.0, this.currentSegment?.durationMs || 0);
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
      }
    };

    this.startProgressTracking(durationSec * 1000);
  }

  public pause(): void {
    this.stopPlayback();
    this.setState('paused');
  }

  public replay(): Promise<void> {
    return this.play();
  }

  public stop(): void {
    this.stopPlayback();
    this.setState('idle');
  }

  private stopPlayback(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.currentSourceNode) {
      try {
        this.currentSourceNode.stop();
        this.currentSourceNode.disconnect();
      } catch {
        // Node might already be stopped
      }
      this.currentSourceNode = null;
    }
  }

  private startProgressTracking(totalDurationMs: number): void {
    const track = () => {
      if (this.state !== 'playing') return;
      const elapsed = performance.now() - this.playbackStartTime;
      const ratio = Math.min(1.0, elapsed / totalDurationMs);
      this.notifyProgress(ratio, elapsed);

      if (ratio < 1.0) {
        this.rafId = requestAnimationFrame(track);
      }
    };
    this.rafId = requestAnimationFrame(track);
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  public getFrequencyData(): Uint8Array | null {
    if (!this.analyserNode || this.state !== 'playing') {
      return null;
    }
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  public onStateChange(listener: (state: AudioPlaybackState) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => this.stateListeners.delete(listener);
  }

  public onProgress(listener: (progressRatio: number, elapsedMs: number) => void): () => void {
    this.progressListeners.add(listener);
    return () => this.progressListeners.delete(listener);
  }

  public onError(listener: (error: AudioPlayerError) => void): () => void {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  private setState(newState: AudioPlaybackState) {
    this.state = newState;
    for (const listener of this.stateListeners) {
      listener(newState);
    }
  }

  private notifyProgress(ratio: number, elapsedMs: number) {
    for (const listener of this.progressListeners) {
      listener(ratio, elapsedMs);
    }
  }

  private notifyError(err: AudioPlayerError) {
    for (const listener of this.errorListeners) {
      listener(err);
    }
  }

  public destroy(): void {
    this.stopPlayback();
    this.stateListeners.clear();
    this.progressListeners.clear();
    this.errorListeners.clear();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
