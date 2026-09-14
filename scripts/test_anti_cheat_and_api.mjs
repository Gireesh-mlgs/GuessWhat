import assert from 'node:assert';
import { seedDatabase } from '../src/db/seed.ts';
import {
  startOrResumeDailySession,
  submitRoundAttempt,
  createChallenge,
  joinChallenge,
  searchSongs,
  getDailyStatus,
} from '../src/lib/game/service.ts';

async function runIntegrationTests() {
  console.log('--- RUNNING ANTI-CHEAT & INTEGRATION TESTS ---\n');

  await seedDatabase();

  const testPlayerId = `test-player-${Date.now()}`;

  // 1. Daily Session Creation & Anti-Leakage Check
  console.log('1. Testing Anti-Leakage on Unresolved Rounds...');
  const dailyState = await startOrResumeDailySession(testPlayerId, 'Medium');
  assert.strictEqual(dailyState.rounds.length, 5);
  assert.strictEqual(dailyState.status, 'active');
  assert.strictEqual(dailyState.difficultyTier, 'Medium');

  // Verify CRITICAL anti-cheat requirement:
  // Unresolved rounds MUST NOT contain songId, correctAnswer, or reveal the answer!
  for (const r of dailyState.rounds) {
    assert.strictEqual(r.state, 'unresolved');
    assert.strictEqual(r.correctAnswer, null);
    assert.strictEqual(r.attemptCount, 0);
    // Verify songId is not leaked on public round
    assert.strictEqual('songId' in r, false, 'CRITICAL: songId must not be present on public round state!');
  }
  console.log('  ✓ Zero answer leakage verified across all 5 unresolved rounds');

  // 2. Testing Round Turn Progression & Atomic Scoring
  console.log('2. Testing Round Progression & Attempt Submission...');
  const firstRound = dailyState.rounds[0];

  // Submit wrong guess
  const wrongAttempt = await submitRoundAttempt(firstRound.id, testPlayerId, 'wrong-song-id');
  assert.strictEqual(wrongAttempt.round.state, 'unresolved');
  assert.strictEqual(wrongAttempt.round.attemptCount, 1);
  assert.strictEqual(wrongAttempt.round.currentOpportunity, 2);
  assert.strictEqual(wrongAttempt.round.currentDurationMs, 500); // 0.5s for opportunity 2
  assert.strictEqual(wrongAttempt.round.correctAnswer, null);
  console.log('  ✓ Incorrect guess consumed 1 opportunity and unlocked 0.5s clip without leaking answer');

  // Skip the round
  const skipAttempt = await submitRoundAttempt(firstRound.id, testPlayerId, null);
  assert.strictEqual(skipAttempt.round.state, 'skipped');
  assert.strictEqual(skipAttempt.round.score, 0);
  assert.notStrictEqual(skipAttempt.round.correctAnswer, null); // Answer only revealed AFTER resolution!
  console.log('  ✓ Skip successfully resolved round at 0 points and revealed answer post-resolution');

  // Attempt on already resolved round MUST fail
  let replayFailed = false;
  try {
    await submitRoundAttempt(firstRound.id, testPlayerId, 'any-song');
  } catch (err) {
    replayFailed = true;
  }
  assert.strictEqual(replayFailed, true, 'Submitting on resolved round must throw error');
  console.log('  ✓ Attempt replay on resolved round was blocked by server state machine');

  // 3. Search Candidate Anti-Leakage
  console.log('3. Testing Search Candidate Sanitization...');
  const searchResults = await searchSongs('neon');
  assert(searchResults.length > 0);
  for (const item of searchResults) {
    assert(item.canonicalTitle);
    assert(item.primaryArtist);
    assert.strictEqual('isCorrect' in item, false, 'Search results must never indicate if a candidate is correct!');
  }
  console.log('  ✓ Search results return candidate catalog items with no answer indicators');

  // 4. Challenge a Friend Creation & Frozen Assets
  console.log('4. Testing Challenge Creation & Frozen Participant Parity...');
  const challenge = await createChallenge(testPlayerId, 'TestMaster', 5, 'Hard', 'All');
  assert(challenge.code.startsWith('SPRINT-'));

  const p1Session = await joinChallenge(challenge.code, 'challenger-1', 'Player One');
  const p2Session = await joinChallenge(challenge.code, 'challenger-2', 'Player Two');

  assert.strictEqual(p1Session.rounds.length, 5);
  assert.strictEqual(p2Session.rounds.length, 5);

  // Both participants must receive identical audio URLs, clip offsets, and positions!
  for (let i = 0; i < 5; i++) {
    assert.strictEqual(p1Session.rounds[i].audioUrl, p2Session.rounds[i].audioUrl);
    assert.strictEqual(p1Session.rounds[i].startMs, p2Session.rounds[i].startMs);
    assert.strictEqual(p1Session.rounds[i].position, p2Session.rounds[i].position);
  }
  console.log('  ✓ Both challenge participants received identical frozen ordered clips');

  console.log('\nAll anti-cheat, authorization, and game integrity checks passed!');
}

runIntegrationTests().catch((err) => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
