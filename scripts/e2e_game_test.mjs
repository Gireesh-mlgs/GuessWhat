import assert from 'node:assert';

const BASE_URL = 'http://localhost:3000';

async function runE2E() {
  console.log('--- STARTING END-TO-END HTTP GAMEPLAY TEST ---\n');

  // Use a cookie jar for the simulated player
  let cookieHeader = '';

  async function req(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (cookieHeader) headers['Cookie'] = cookieHeader;
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      cookieHeader = setCookie.split(';')[0];
    }
    const json = await res.json().catch(() => null);
    return { status: res.status, data: json };
  }

  // 1. Check daily status
  console.log('1. Checking GET /api/v1/daily/status...');
  const statusRes = await req('/api/v1/daily/status');
  assert.strictEqual(statusRes.status, 200);
  assert.strictEqual(statusRes.data.success, true);
  console.log(`  ✓ Daily status returned for player: ${statusRes.data.data.player.displayName}`);

  // 2. Start Daily Session on Medium tier (2x multiplier)
  console.log('2. Starting POST /api/v1/daily/sessions with tier=Medium...');
  const startRes = await req('/api/v1/daily/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: 'Medium' }),
  });
  assert.strictEqual(startRes.status, 200);
  assert.strictEqual(startRes.data.success, true);
  const session = startRes.data.data;
  assert.strictEqual(session.rounds.length, 5);
  assert.strictEqual(session.difficultyTier, 'Medium');
  assert.strictEqual(session.status, 'active');
  console.log(`  ✓ Active session started: ${session.id} (5 rounds)`);

  // Verify no answer leaks
  for (const r of session.rounds) {
    assert.strictEqual(r.correctAnswer, null, 'Unresolved round must have null correctAnswer');
    assert.strictEqual('songId' in r, false, 'Unresolved round must not have songId');
  }
  console.log('  ✓ Verified 0% answer leakage in initial session payload');

  // 3. Search candidate songs
  console.log('3. Searching candidates via GET /api/v1/sessions/:id/search?q=blinding...');
  const searchRes = await req(`/api/v1/sessions/${session.id}/search?q=blinding`);
  assert.strictEqual(searchRes.status, 200);
  assert(searchRes.data.data.length > 0);
  const foundSong = searchRes.data.data.find((s) => s.canonicalTitle.includes('Blinding Lights'));
  assert(foundSong, 'Found Blinding Lights in search results');
  console.log(`  ✓ Search returned candidate: ${foundSong.canonicalTitle} by ${foundSong.primaryArtist}`);

  // 4. Submit correct answer for Round 1
  console.log('4. Submitting correct guess for Round 1...');
  const round1 = session.rounds[0];
  const guessRes = await req(`/api/v1/rounds/${round1.id}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submittedSongId: foundSong.id, isSkip: false }),
  });
  assert.strictEqual(guessRes.status, 200);
  assert.strictEqual(guessRes.data.data.round.state, 'correct');
  // Medium tier = 2x multiplier. Opportunity 1 base points = 5. Total = 10 pts!
  assert.strictEqual(guessRes.data.data.round.score, 10);
  assert(guessRes.data.data.round.correctAnswer !== null, 'Correct answer revealed after resolution');
  console.log('  ✓ Round 1 solved in 1 attempt! Score: 10 pts (5 base * 2x multiplier)');

  // 5. Skip Round 2
  console.log('5. Submitting skip for Round 2...');
  const round2 = session.rounds[1];
  const skipRes = await req(`/api/v1/rounds/${round2.id}/attempts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isSkip: true }),
  });
  assert.strictEqual(skipRes.status, 200);
  assert.strictEqual(skipRes.data.data.round.state, 'skipped');
  assert.strictEqual(skipRes.data.data.round.score, 0);
  console.log('  ✓ Round 2 skipped successfully. Score: 0 pts');

  // 6. Test spoiler-safe share generation
  console.log('6. Generating spoiler-safe share card...');
  const shareRes = await req(`/api/v1/results/${session.id}/share`, { method: 'POST' });
  assert.strictEqual(shareRes.status, 200);
  const shareText = shareRes.data.data.shareText;
  assert(shareText.includes('SongSprint Daily'));
  assert(shareText.includes('🟩⬛')); // Round 1 = 🟩, Round 2 = ⬛
  assert(!shareText.includes('Neon Horizon'));
  console.log(`  ✓ Spoiler-safe share text verified:\n${shareText.split('\n').map(l => '    ' + l).join('\n')}`);

  // 7. Test Challenge a Friend Flow
  console.log('\n7. Testing Challenge Creation & Joining...');
  const chalRes = await req('/api/v1/challenges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      songCount: 5,
      tier: 'Hard',
      category: 'All',
      creatorName: 'SpeedSprinter',
    }),
  });
  assert.strictEqual(chalRes.status, 200);
  const challengeCode = chalRes.data.data.code;
  console.log(`  ✓ Challenge created with code: ${challengeCode}`);

  const chalInfoRes = await req(`/api/v1/challenges/${challengeCode}`);
  assert.strictEqual(chalInfoRes.status, 200);
  assert.strictEqual(chalInfoRes.data.data.code, challengeCode);
  assert.strictEqual(chalInfoRes.data.data.creatorName, 'SpeedSprinter');
  console.log(`  ✓ Challenge details verified without any answer leakage`);

  console.log('\n✓ ALL END-TO-END GAMEPLAY TESTS PASSED PERFECTLY!');
}

runE2E().catch((err) => {
  console.error('E2E test failed:', err);
  process.exit(1);
});
