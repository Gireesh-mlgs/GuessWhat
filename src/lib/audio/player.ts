import { AudioPlaybackState, AudioPlayerError, PlaybackSegment } from './types';

export class PrecisionAudioPlayer {
  private static sharedAudioContext: AudioContext | null = null;
  private static activeSourceNode: AudioBufferSourceNode | null = null;

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
  private currentLoadId: number = 0;

  constructor() {
    // Lazy initialization on user gesture
  }

  private initAudioContext(): AudioContext {
    if (!PrecisionAudioPlayer.sharedAudioContext || PrecisionAudioPlayer.sharedAudioContext.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      PrecisionAudioPlayer.sharedAudioContext = new AudioCtx();
    }
    const ctx = PrecisionAudioPlayer.sharedAudioContext;

    if (!this.gainNode) {
      this.gainNode = ctx.createGain();
      this.gainNode.gain.value = this.volume;
      this.analyserNode = ctx.createAnalyser();
      this.analyserNode.fftSize = 64;

      this.gainNode.connect(this.analyserNode);
      this.analyserNode.connect(ctx.destination);
    }

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  public async load(segment: PlaybackSegment): Promise<void> {
    const loadId = ++this.currentLoadId;
    this.stopPlayback();
    this.currentSegment = segment;
    this.setState('loading');

    try {
      if (this.bufferCache.has(segment.audioUrl)) {
        if (loadId !== this.currentLoadId) return;
        this.currentBuffer = this.bufferCache.get(segment.audioUrl)!;
        this.setState('paused');
        return;
      }

      const response = await fetch(segment.audioUrl);
      if (!response.ok) {
        throw new Error(`Failed to load audio (${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();
      if (loadId !== this.currentLoadId) return;

      const ctx = this.initAudioContext();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      if (loadId !== this.currentLoadId) return;

      this.bufferCache.set(segment.audioUrl, decoded);
      this.currentBuffer = decoded;
      this.setState('paused');
    } catch (err: unknown) {
      if (loadId !== this.currentLoadId) return;
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
      await ctx.resume().catch(() => {});
    }

    // Stop current playback on this instance
    this.stopPlayback();

    // Kill any other active audio source globally in the app
    if (PrecisionAudioPlayer.activeSourceNode) {
      const prevSource = PrecisionAudioPlayer.activeSourceNode;
      PrecisionAudioPlayer.activeSourceNode = null;
      prevSource.onended = null;
      try {
        prevSource.stop(0);
        prevSource.disconnect();
      } catch {
        // Safe ignore
      }
    }

    const source = ctx.createBufferSource();
    source.buffer = this.currentBuffer;
    source.connect(this.gainNode!);
    this.currentSourceNode = source;
    PrecisionAudioPlayer.activeSourceNode = source;

    const startSec = Math.max(0, (this.currentSegment.startMs || 0) / 1000);
    const durationSec = Math.max(0.05, this.currentSegment.durationMs / 1000);

    // Bounds safety: clamp to buffer boundaries to avoid InvalidStateError
    const bufferDuration = this.currentBuffer.duration;
    const safeOffset = Math.min(startSec, Math.max(0, bufferDuration - 0.05));
    const safeDuration = Math.min(durationSec, Math.max(0.05, bufferDuration - safeOffset));

    // Exact sub-second Web Audio schedule: stops precisely at safeOffset + safeDuration
    source.start(0, safeOffset, safeDuration);
    this.playbackStartTime = performance.now();
    this.setState('playing');

    source.onended = () => {
      if (this.currentSourceNode === source) {
        this.currentSourceNode = null;
        if (PrecisionAudioPlayer.activeSourceNode === source) {
          PrecisionAudioPlayer.activeSourceNode = null;
        }
        this.setState('ended');
        this.notifyProgress(1.0, this.currentSegment?.durationMs || 0);
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
      }
    };

    this.startProgressTracking(safeDuration * 1000);
  }

  public pause(): void {
    this.stopPlayback();
    this.setState('paused');
  }

  public replay(): Promise<void> {
    return this.play();
  }

  public stop(): void {
    this.currentLoadId++;
    this.stopPlayback();
    this.setState('idle');
    this.notifyProgress(0, 0);
  }

  private stopPlayback(): void {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.currentSourceNode) {
      const node = this.currentSourceNode;
      this.currentSourceNode = null;
      // Invalidate event listener so ended callback never fires after stopping
      node.onended = null;
      try {
        node.stop(0);
        node.disconnect();
      } catch {
        // Node might already be stopped
      }
      if (PrecisionAudioPlayer.activeSourceNode === node) {
        PrecisionAudioPlayer.activeSourceNode = null;
      }
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
    this.currentLoadId++;
    this.stopPlayback();
    this.stateListeners.clear();
    this.progressListeners.clear();
    this.errorListeners.clear();
  }
}
