import assert from 'node:assert';
import { calculateRoundScore, getMaxDailyScore, getMaxSongScore, REVEAL_SCHEDULE, DIFFICULTY_MULTIPLIERS } from '../src/lib/game/scoring.ts';
import { normalizeText, matchesNormalized } from '../src/lib/game/normalizer.ts';
import { generateSpoilerSafeShareText } from '../src/lib/share/generator.ts';

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}:`, err.message);
  }
}

console.log('--- RUNNING SONGSPRINT TEST SUITE ---\n');

// 1. Scoring & Reveal Schedule Tests
console.log('1. Scoring & Rules Engine Tests');

test('Opportunity 1 gives 5 base points on Easy (1x)', () => {
  assert.strictEqual(calculateRoundScore(1, 'Easy', 'correct'), 5);
});

test('Opportunity 1 gives 25 points on Impossible (5x)', () => {
  assert.strictEqual(calculateRoundScore(1, 'Impossible', 'correct'), 25);
});

test('Opportunity 5 gives 1 base point * 3x = 3 pts on Hard', () => {
  assert.strictEqual(calculateRoundScore(5, 'Hard', 'correct'), 3);
});

test('Skip gives 0 points regardless of tier', () => {
  assert.strictEqual(calculateRoundScore(1, 'Impossible', 'skip'), 0);
  assert.strictEqual(calculateRoundScore(3, 'Easy', 'skip'), 0);
});

test('Incorrect attempt gives 0 points', () => {
  assert.strictEqual(calculateRoundScore(2, 'Expert', 'incorrect'), 0);
});

test('Max Daily Score on Impossible is exactly 125', () => {
  assert.strictEqual(getMaxDailyScore('Impossible'), 125);
});

test('Max Song Score on Impossible is exactly 25', () => {
  assert.strictEqual(getMaxSongScore('Impossible'), 25);
});

test('Reveal schedule contains exactly 5 opportunities: 0.1s, 0.5s, 1.0s, 2.0s, 5.0s', () => {
  assert.strictEqual(REVEAL_SCHEDULE.length, 5);
  assert.strictEqual(REVEAL_SCHEDULE[0].durationSec, 0.1);
  assert.strictEqual(REVEAL_SCHEDULE[1].durationSec, 0.5);
  assert.strictEqual(REVEAL_SCHEDULE[2].durationSec, 1.0);
  assert.strictEqual(REVEAL_SCHEDULE[3].durationSec, 2.0);
  assert.strictEqual(REVEAL_SCHEDULE[4].durationSec, 5.0);
});

// 2. Normalization & Search Tolerance Tests
console.log('\n2. Normalization & Search Tolerance Tests');

test('Normalizes diacritics / accents (Beyoncé -> beyonce)', () => {
  assert.strictEqual(normalizeText('Beyoncé'), 'beyonce');
});

test('Normalizes case and excessive whitespace', () => {
  assert.strictEqual(normalizeText('  NEON    HORIZON  '), 'neon horizon');
});

test('Strips featuring suffixes (feat. Drake, ft. Luna)', () => {
  assert.strictEqual(normalizeText('Midnight City feat. Luna Ray'), 'midnight city');
  assert.strictEqual(normalizeText('Thunder Strike (ft. Voltage)'), 'thunder strike');
});

test('Strips remaster and radio edit brackets', () => {
  assert.strictEqual(normalizeText('Starlight Disco [Remastered 2024]'), 'starlight disco');
  assert.strictEqual(normalizeText('Summer Breeze (Radio Edit)'), 'summer breeze');
});

test('matchesNormalized accurately matches queries', () => {
  assert.strictEqual(matchesNormalized('Midnight City Lights', 'city'), true);
  assert.strictEqual(matchesNormalized('Beyoncé - Halo', 'beyonce'), true);
  assert.strictEqual(matchesNormalized('Thunder Strike', 'voltage'), false);
});

// 3. Spoiler-Safe Sharing Tests
console.log('\n3. Spoiler-Safe Sharing Generator Tests');

test('Share output contains no song titles, artists, or audio links', () => {
  const output = generateSpoilerSafeShareText({
    mode: 'daily',
    puzzleIdentifier: '2026-09-13',
    difficultyTier: 'Medium',
    score: 38,
    maxScore: 50,
    rounds: [
      { position: 1, state: 'correct', solvedAtAttempt: 1 },
      { position: 2, state: 'correct', solvedAtAttempt: 3 },
      { position: 3, state: 'skipped' },
      { position: 4, state: 'correct', solvedAtAttempt: 2 },
      { position: 5, state: 'exhausted' },
    ],
    originUrl: 'https://songsprint.app/daily',
  });

  assert(output.includes('SongSprint Daily 2026-09-13 (Medium)'));
  assert(output.includes('Score: 38/50 ⚡'));
  assert(output.includes('🟩🟨⬛🟩⬛')); // 1=🟩, 3=🟨, skip=⬛, 2=🟩, exhausted=⬛
  assert(!output.includes('CyberVibe'));
  assert(!output.includes('Neon Horizon'));
  assert(!output.includes('.wav'));
  assert(!output.includes('clip-'));
});

console.log(`\nResults: ${passedTests}/${totalTests} tests passed.`);
if (passedTests !== totalTests) {
  process.exit(1);
}
