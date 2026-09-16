export type DifficultyTier = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Impossible';

export interface OpportunityConfig {
  opportunity: number;
  durationSec: number;
  durationMs: number;
  basePoints: number;
}

export const REVEAL_SCHEDULE: OpportunityConfig[] = [
  { opportunity: 1, durationSec: 0.5, durationMs: 500, basePoints: 5 },
  { opportunity: 2, durationSec: 1.0, durationMs: 1000, basePoints: 4 },
  { opportunity: 3, durationSec: 2.0, durationMs: 2000, basePoints: 3 },
  { opportunity: 4, durationSec: 3.0, durationMs: 3000, basePoints: 2 },
  { opportunity: 5, durationSec: 5.0, durationMs: 5000, basePoints: 1 },
];

export const DIFFICULTY_MULTIPLIERS: Record<DifficultyTier, { multiplier: number; label: string; description: string }> = {
  Easy: {
    multiplier: 1,
    label: 'Easy (1×)',
    description: 'Iconic, highly recognizable melodies with instant memorable hooks.'
  },
  Medium: {
    multiplier: 2,
    label: 'Medium (2×)',
    description: 'Well-known tracks featuring slightly more subtle opening clues.'
  },
  Hard: {
    multiplier: 3,
    label: 'Hard (3×)',
    description: 'Recognizable primarily to avid listeners of the specific genre or style.'
  },
  Expert: {
    multiplier: 4,
    label: 'Expert (4×)',
    description: 'Niche, fast-paced, or difficult-to-place instrumental snippets.'
  },
  Impossible: {
    multiplier: 5,
    label: 'Impossible (5×)',
    description: 'Deep cuts and elusive split-second micro-segments for true music savants.'
  }
};

export function calculateRoundScore(opportunityNumber: number, tier: DifficultyTier, outcome: 'correct' | 'incorrect' | 'skip'): number {
  if (outcome !== 'correct') return 0;
  const config = REVEAL_SCHEDULE.find((s) => s.opportunity === opportunityNumber);
  if (!config) return 0;
  const multiplier = DIFFICULTY_MULTIPLIERS[tier]?.multiplier || 1;
  return config.basePoints * multiplier;
}

export function getMaxSongScore(tier: DifficultyTier): number {
  return 5 * (DIFFICULTY_MULTIPLIERS[tier]?.multiplier || 1);
}

export function getMaxDailyScore(tier: DifficultyTier): number {
  return getMaxSongScore(tier) * 5;
}
