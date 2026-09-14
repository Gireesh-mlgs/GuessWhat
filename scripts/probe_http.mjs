const urls = [
  'http://localhost:3000/',
  'http://localhost:3000/daily',
  'http://localhost:3000/unlimited',
  'http://localhost:3000/challenge/new',
  'http://localhost:3000/leaderboard',
  'http://localhost:3000/profile',
  'http://localhost:3000/settings',
  'http://localhost:3000/how-it-works',
  'http://localhost:3000/api/v1/daily/status',
  'http://localhost:3000/api/v1/leaderboards/daily',
  'http://localhost:3000/audio/neon_horizon.wav',
  `http://localhost:3000/api/v1/audio/proxy?url=${encodeURIComponent('https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/19/d6/60/19d660ff-e3a9-8377-15a3-ce4b28e89cac/mzaf_18422426156481158187.plus.aac.p.m4a')}`
];

async function probe() {
  console.log('Probing running dev server on http://localhost:3000...\n');
  let allOk = true;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const ok = res.status >= 200 && res.status < 400;
      const text = await res.text();
      console.log(`[${res.status}] ${url}`);
      if (!ok) {
        console.log('Error Body:', text);
        allOk = false;
      }
    } catch (err) {
      console.error(`[FAIL] ${url}:`, err.message);
      allOk = false;
    }
  }

  if (allOk) {
    console.log('\n✓ All frontend routes, API endpoints, and audio assets returned 200 OK!');
  } else {
    process.exit(1);
  }
}

probe();
