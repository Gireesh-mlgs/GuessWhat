import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function req(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, options);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data, headers: res.headers };
}

async function runDailySkipTest() {
  console.log('=== TESTING DAILY SPRINT SKIP BEHAVIOR ===\n');

  // Start or resume daily session
  const startRes = await req('/api/v1/daily/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: 'Medium' }),
  });
  assert.strictEqual(startRes.status, 200);
  const cookie = startRes.headers.get('set-cookie');
  const headers = cookie ? { 'Cookie': cookie, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  const session = startRes.data.data;
  console.log(`  ✓ Daily Session: ${session.id}, status: ${session.status}, rounds: ${session.rounds.length}`);

  if (session.status === 'active') {
    const roundIdx = session.activeRoundIndex;
    const currentRound = session.rounds[roundIdx];
    console.log(`  ✓ Current Daily Round: Song ${roundIdx + 1} of 5 (${currentRound.id})`);

    // Skip this round
    const skipRes = await req(`/api/v1/rounds/${currentRound.id}/attempts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ submittedSongId: null, isSkip: true }),
    });
    assert.strictEqual(skipRes.status, 200);
    assert.strictEqual(skipRes.data.data.round.state, 'skipped');
    console.log(`  ✓ Song ${roundIdx + 1} skipped successfully (0 pts)`);

    const updatedSession = skipRes.data.data.session;
    const nextIdx = roundIdx + 1;
    if (nextIdx < updatedSession.rounds.length) {
      const nextRound = updatedSession.rounds[nextIdx];
      console.log(`  ✓ Song ${nextIdx + 1} ready: ${nextRound.id}, startMs: ${nextRound.startMs}, durationMs: ${nextRound.currentDurationMs}`);
    } else {
      console.log('  ✓ Daily sprint completed all 5 songs!');
    }
  } else {
    console.log('  ✓ Daily session already completed for today.');
  }

  console.log('\n✓ DAILY SKIP TEST PASSED!');
}

runDailySkipTest().catch((err) => {
  console.error('\n✗ Daily test failed:', err);
  process.exit(1);
});
