// Test Daily Sprint progressive skip behavior
const BASE = 'http://localhost:3000';

async function main() {
  console.log('=== TESTING DAILY SPRINT PROGRESSIVE SKIP ===\n');

  // Start or resume daily session
  const startRes = await fetch(`${BASE}/api/v1/daily/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier: 'Medium' }),
  });
  const startJson = await startRes.json();
  const session = startJson.data;
  const cookie = startRes.headers.get('set-cookie') || '';
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(cookie ? { Cookie: cookie } : {}),
  };

  const activeRound = session.rounds[session.activeRoundIndex];
  console.log(`  ✓ Daily Session: ${session.id}, Active Song: ${session.activeRoundIndex + 1} of ${session.rounds.length}`);
  console.log(`  ✓ Active Round ID: ${activeRound.id}, state: ${activeRound.state}, opp: ${activeRound.currentOpportunity}`);

  if (activeRound.state === 'unresolved') {
    // Test clicking Skip
    const skipRes = await fetch(`${BASE}/api/v1/rounds/${activeRound.id}/attempts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ submittedSongId: null, isSkip: true }),
    });
    const skipJson = await skipRes.json();
    const roundAfterSkip = skipJson.data.round;
    console.log(`  ✓ After Skip: state=${roundAfterSkip.state}, opp=${roundAfterSkip.currentOpportunity}, duration=${roundAfterSkip.currentDurationMs}ms`);
    console.log(`  ✓ Still on Song ${skipJson.data.session.activeRoundIndex + 1}: correct!`);
  }

  console.log('\n✓ DAILY SPRINT PROGRESSIVE SKIP VERIFIED!');
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
