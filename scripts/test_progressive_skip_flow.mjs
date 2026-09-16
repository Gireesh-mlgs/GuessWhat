// Verification script for progressive skip behavior
const BASE = 'http://localhost:3000';

async function main() {
  console.log('=== TESTING PROGRESSIVE SKIP BEHAVIOR ===\n');

  // 1. Start an Unlimited Practice session
  console.log('1. Starting new Unlimited session...');
  const startRes = await fetch(`${BASE}/api/v1/unlimited/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: 'Easy', category: 'All' }),
  });
  const startJson = await startRes.json();
  if (!startJson?.success) {
    throw new Error('Failed to start session: ' + JSON.stringify(startJson));
  }
  const session = startJson.data;
  const cookie = startRes.headers.get('set-cookie') || '';
  const round1 = session.rounds[0];
  console.log(`  ✓ Session: ${session.id}`);
  console.log(`  ✓ Round 1 ID: ${round1.id}`);
  console.log(`  ✓ Initial: Opportunity ${round1.currentOpportunity}, duration: ${round1.currentDurationMs}ms, attemptCount: ${round1.attemptCount}`);

  if (round1.currentOpportunity !== 1 || round1.currentDurationMs !== 500) {
    throw new Error(`Expected Opportunity 1 (500ms), got ${round1.currentOpportunity} (${round1.currentDurationMs}ms)`);
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(cookie ? { Cookie: cookie } : {}),
  };

  // 2. Click Skip on Opportunity 1 (0.5s) -> should unlock Opportunity 2 (1.0s) on SAME song
  console.log('\n2. Testing Skip on Opportunity 1 (0.5s)...');
  const skip1Res = await fetch(`${BASE}/api/v1/rounds/${round1.id}/attempts`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ submittedSongId: null, isSkip: true }),
  });
  const skip1Json = await skip1Res.json();
  if (!skip1Json?.success) {
    throw new Error('Skip 1 failed: ' + JSON.stringify(skip1Json));
  }
  const r1AfterSkip1 = skip1Json.data.round;
  console.log(`  ✓ Round state: ${r1AfterSkip1.state} (must be 'unresolved')`);
  console.log(`  ✓ Now at: Opportunity ${r1AfterSkip1.currentOpportunity}, duration: ${r1AfterSkip1.currentDurationMs}ms, attemptCount: ${r1AfterSkip1.attemptCount}`);

  if (r1AfterSkip1.state !== 'unresolved' || r1AfterSkip1.currentOpportunity !== 2 || r1AfterSkip1.currentDurationMs !== 1000) {
    throw new Error(`Expected unresolved Opportunity 2 (1000ms), got state=${r1AfterSkip1.state}, opp=${r1AfterSkip1.currentOpportunity}, dur=${r1AfterSkip1.currentDurationMs}`);
  }

  // 3. Click Skip on Opportunity 2 (1.0s) -> should unlock Opportunity 3 (2.0s)
  console.log('\n3. Testing Skip on Opportunity 2 (1.0s)...');
  const skip2Res = await fetch(`${BASE}/api/v1/rounds/${round1.id}/attempts`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ submittedSongId: null, isSkip: true }),
  });
  const skip2Json = await skip2Res.json();
  const r1AfterSkip2 = skip2Json.data.round;
  console.log(`  ✓ Now at: Opportunity ${r1AfterSkip2.currentOpportunity}, duration: ${r1AfterSkip2.currentDurationMs}ms, attemptCount: ${r1AfterSkip2.attemptCount}`);

  if (r1AfterSkip2.state !== 'unresolved' || r1AfterSkip2.currentOpportunity !== 3 || r1AfterSkip2.currentDurationMs !== 2000) {
    throw new Error(`Expected unresolved Opportunity 3 (2000ms), got opp=${r1AfterSkip2.currentOpportunity}, dur=${r1AfterSkip2.currentDurationMs}`);
  }

  // 4. Click Skip on Opportunity 3 (2.0s) -> should unlock Opportunity 4 (3.0s)
  console.log('\n4. Testing Skip on Opportunity 3 (2.0s)...');
  const skip3Res = await fetch(`${BASE}/api/v1/rounds/${round1.id}/attempts`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ submittedSongId: null, isSkip: true }),
  });
  const skip3Json = await skip3Res.json();
  const r1AfterSkip3 = skip3Json.data.round;
  console.log(`  ✓ Now at: Opportunity ${r1AfterSkip3.currentOpportunity}, duration: ${r1AfterSkip3.currentDurationMs}ms, attemptCount: ${r1AfterSkip3.attemptCount}`);

  if (r1AfterSkip3.state !== 'unresolved' || r1AfterSkip3.currentOpportunity !== 4 || r1AfterSkip3.currentDurationMs !== 3000) {
    throw new Error(`Expected unresolved Opportunity 4 (3000ms), got opp=${r1AfterSkip3.currentOpportunity}, dur=${r1AfterSkip3.currentDurationMs}`);
  }

  // 5. Click Skip on Opportunity 4 (2.0s) -> should unlock Opportunity 5 (5.0s)
  console.log('\n5. Testing Skip on Opportunity 4 (2.0s)...');
  const skip4Res = await fetch(`${BASE}/api/v1/rounds/${round1.id}/attempts`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ submittedSongId: null, isSkip: true }),
  });
  const skip4Json = await skip4Res.json();
  const r1AfterSkip4 = skip4Json.data.round;
  console.log(`  ✓ Now at: Opportunity ${r1AfterSkip4.currentOpportunity}, duration: ${r1AfterSkip4.currentDurationMs}ms, attemptCount: ${r1AfterSkip4.attemptCount}`);

  if (r1AfterSkip4.state !== 'unresolved' || r1AfterSkip4.currentOpportunity !== 5 || r1AfterSkip4.currentDurationMs !== 5000) {
    throw new Error(`Expected unresolved Opportunity 5 (5000ms), got opp=${r1AfterSkip4.currentOpportunity}, dur=${r1AfterSkip4.currentDurationMs}`);
  }

  // 6. Click Skip on Opportunity 5 (final skip) -> should resolve round as 'skipped'
  console.log('\n6. Testing final Skip on Opportunity 5 (5.0s)...');
  const skip5Res = await fetch(`${BASE}/api/v1/rounds/${round1.id}/attempts`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ submittedSongId: null, isSkip: true }),
  });
  const skip5Json = await skip5Res.json();
  const r1AfterSkip5 = skip5Json.data.round;
  console.log(`  ✓ Final round state: ${r1AfterSkip5.state} (must be 'skipped')`);
  console.log(`  ✓ Solved at attempt: ${r1AfterSkip5.solvedAtAttempt || 'null'}`);
  console.log(`  ✓ Score: ${r1AfterSkip5.score} pts`);
  console.log(`  ✓ Correct answer revealed: ${r1AfterSkip5.correctAnswer?.canonicalTitle} by ${r1AfterSkip5.correctAnswer?.primaryArtist}`);

  if (r1AfterSkip5.state !== 'skipped') {
    throw new Error(`Expected round state 'skipped', got ${r1AfterSkip5.state}`);
  }
  if (!r1AfterSkip5.correctAnswer) {
    throw new Error('Expected correct answer to be revealed upon round resolution');
  }

  console.log('\n✓ ALL PROGRESSIVE SKIP BEHAVIOR TESTS PASSED PERFECTLY!');
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
