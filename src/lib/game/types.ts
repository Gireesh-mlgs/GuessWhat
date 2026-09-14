import { DifficultyTier } from './scoring';

export interface PublicRoundState {
  id: string;
  position: number;
  state: 'unresolved' | 'correct' | 'skipped' | 'exhausted';
  attemptCount: number;
  currentOpportunity: number;
  currentDurationMs: number;
  score: number;
  solvedAtAttempt?: number | null;
  audioUrl: string;
  startMs: number;
  correctAnswer?: {
    songId: string;
    canonicalTitle: string;
    primaryArtist: string;
  } | null;
}

export interface PublicSessionState {
  id: string;
  mode: 'daily' | 'unlimited' | 'challenge';
  difficultyTier: DifficultyTier;
  status: 'active' | 'completed' | 'abandoned';
  score: number;
  skipsCount: number;
  maxPossibleScore: number;
  rounds: PublicRoundState[];
  activeRoundIndex: number;
  completedAt?: number | null;
  challengeCode?: string;
}
