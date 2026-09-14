export interface ShareableRoundSummary {
  position: number;
  state: 'correct' | 'skipped' | 'exhausted';
  solvedAtAttempt?: number | null; // 1..5
}

export interface ShareData {
  mode: 'daily' | 'unlimited' | 'challenge';
  puzzleIdentifier: string; // e.g., '2026-09-13' or 'Challenge #SPRINT-1234'
  difficultyTier: string;
  score: number;
  maxScore: number;
  rounds: ShareableRoundSummary[];
  originUrl?: string;
}

export function generateSpoilerSafeShareText(data: ShareData): string {
  const emojiGrid = data.rounds
    .map((r) => {
      if (r.state !== 'correct') return '⬛';
      if (r.solvedAtAttempt === 1) return '🟩';
      if (r.solvedAtAttempt === 2) return '🟩';
      if (r.solvedAtAttempt === 3) return '🟨';
      if (r.solvedAtAttempt === 4) return '🟨';
      return '🟧';
    })
    .join('');

  const modeTitle =
    data.mode === 'daily'
      ? `SongSprint Daily ${data.puzzleIdentifier}`
      : data.mode === 'challenge'
      ? `SongSprint Challenge ${data.puzzleIdentifier}`
      : `SongSprint Practice`;

  const playUrl = data.originUrl || 'https://songsprint.app';

  return [
    `🎵 ${modeTitle} (${data.difficultyTier})`,
    `Score: ${data.score}/${data.maxScore} ⚡`,
    `${emojiGrid}`,
    ``,
    `Can you recognize the beat faster?`,
    `${playUrl}`,
  ].join('\n');
}
