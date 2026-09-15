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

async function runSkipTests() {
  console.log('=== TESTING SKIP BUTTON & AUDIO TRANSITION BEHAVIOR ===\n');

  // Test 1: Start unlimited session
  console.log('1. Starting new Unlimited practice session...');
  const startRes = await req('/api/v1/unlimited/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: 'Easy', category: 'All' }),
  });
  assert.strictEqual(startRes.status, 200);
  const cookie = startRes.headers.get('set-cookie');
  const headers = cookie ? { 'Cookie': cookie, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  const session1 = startRes.data.data;
  assert.strictEqual(session1.rounds.length, 1);
  const song1Round = session1.rounds[0];
  console.log(`  ✓ Session started: ${session1.id}`);
  console.log(`  ✓ Song 1 ID: ${song1Round.id}, startMs: ${song1Round.startMs}, durationMs: ${song1Round.currentDurationMs}`);

  // Test 2: Skip once
  console.log('\n2. Testing "Skip once" flow:');
  const skip1Res = await req(`/api/v1/rounds/${song1Round.id}/attempts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ submittedSongId: null, isSkip: true }),
  });
  assert.strictEqual(skip1Res.status, 200);
  assert.strictEqual(skip1Res.data.data.round.state, 'skipped');
  console.log('  ✓ Song 1 resolved as skipped (0 pts)');

  // Fetch next song immediately (what UI does on skip)
  const next1Res = await req(`/api/v1/unlimited/sessions/${session1.id}/next`, {
    method: 'POST',
    headers,
  });
  assert.strictEqual(next1Res.status, 200);
  const session2 = next1Res.data.data;
  const song2Round = session2.rounds[session2.activeRoundIndex];
  assert.notStrictEqual(song2Round.id, song1Round.id, 'Song 2 must be different from Song 1');
  assert.strictEqual(song2Round.state, 'unresolved', 'Song 2 starts fresh and unresolved');
  assert.strictEqual(song2Round.attemptCount, 0, 'Song 2 attempt count starts at 0');
  assert.strictEqual(song2Round.currentOpportunity, 1, 'Song 2 starts at Opportunity 1');
  console.log(`  ✓ Song 2 loaded: ${song2Round.id}, startMs: ${song2Round.startMs}, durationMs: ${song2Round.currentDurationMs}`);

  // Test 3: Skip repeatedly
  console.log('\n3. Testing "Skip repeatedly" flow (skipping 3 more songs consecutively):');
  let currentSession = session2;
  for (let i = 0; i < 3; i++) {
    const curRound = currentSession.rounds[currentSession.activeRoundIndex];
    const prevId = curRound.id;

    // Submit skip
    const sRes = await req(`/api/v1/rounds/${curRound.id}/attempts`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ submittedSongId: null, isSkip: true }),
    });
    if (sRes.status !== 200) {
      console.error('sRes error:', sRes.data);
    }
    assert.strictEqual(sRes.status, 200);
    assert.strictEqual(sRes.data.data.round.state, 'skipped');

    // Next song
    const nRes = await req(`/api/v1/unlimited/sessions/${currentSession.id}/next`, {
      method: 'POST',
      headers,
    });
    assert.strictEqual(nRes.status, 200);
    currentSession = nRes.data.data;
    const newRound = currentSession.rounds[currentSession.activeRoundIndex];
    assert.notStrictEqual(newRound.id, prevId);
    assert.strictEqual(newRound.state, 'unresolved');
    assert.strictEqual(newRound.attemptCount, 0);
    console.log(`  ✓ Iteration ${i + 1}: Skipped ${prevId} -> Loaded new Song ${newRound.id} (startMs: ${newRound.startMs})`);
  }

  // Test 4: Guess -> Skip
  console.log('\n4. Testing "Guess -> Skip" flow:');
  const activeRound4 = currentSession.rounds[currentSession.activeRoundIndex];
  // Submit incorrect guess first
  const wrongGuessRes = await req(`/api/v1/rounds/${activeRound4.id}/attempts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ submittedSongId: 'non-existent-song-id', isSkip: false }),
  });
  assert.strictEqual(wrongGuessRes.status, 200);
  assert.strictEqual(wrongGuessRes.data.data.round.state, 'unresolved');
  assert.strictEqual(wrongGuessRes.data.data.round.attemptCount, 1);
  assert.strictEqual(wrongGuessRes.data.data.round.currentOpportunity, 2);
  console.log('  ✓ Incorrect guess submitted -> Opportunity 2 unlocked (durationMs: 500)');

  // Now Skip this song
  const skipAfterGuessRes = await req(`/api/v1/rounds/${activeRound4.id}/attempts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ submittedSongId: null, isSkip: true }),
  });
  assert.strictEqual(skipAfterGuessRes.status, 200);
  assert.strictEqual(skipAfterGuessRes.data.data.round.state, 'skipped');

  // Load next song
  const nextAfterSkipRes = await req(`/api/v1/unlimited/sessions/${currentSession.id}/next`, {
    method: 'POST',
    headers,
  });
  assert.strictEqual(nextAfterSkipRes.status, 200);
  currentSession = nextAfterSkipRes.data.data;
  const roundAfterSkip = currentSession.rounds[currentSession.activeRoundIndex];
  assert.notStrictEqual(roundAfterSkip.id, activeRound4.id);
  assert.strictEqual(roundAfterSkip.state, 'unresolved');
  assert.strictEqual(roundAfterSkip.attemptCount, 0);
  console.log(`  ✓ Skip succeeded after guess -> Loaded new Song ${roundAfterSkip.id} cleanly!`);

  // Test 5: Audio proxy verification
  console.log('\n5. Verifying Audio Proxy and Snippet Serving:');
  const fullAudioUrl = roundAfterSkip.audioUrl.startsWith('http') ? roundAfterSkip.audioUrl : `${BASE_URL}${roundAfterSkip.audioUrl}`;
  const audioRes = await fetch(fullAudioUrl);
  assert.strictEqual(audioRes.status, 200);
  const audioBytes = await audioRes.arrayBuffer();
  assert(audioBytes.byteLength > 1000, 'Audio snippet must have valid payload');
  console.log(`  ✓ Audio URL ${roundAfterSkip.audioUrl} served successfully (${audioBytes.byteLength} bytes)`);

  console.log('\n✓ ALL SKIP AUDIO TRANSITION TESTS PASSED SUCCESSFULLY!');
}

runSkipTests().catch((err) => {
  console.error('\n✗ Test failed:', err);
  process.exit(1);
});
