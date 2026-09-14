import { createClient } from '@libsql/client';
import path from 'node:path';
import fs from 'node:fs';

const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'songsprint.db');
const client = createClient({
  url: `file:${dbPath.replace(/\\/g, '/')}`,
});

function cleanTrackTitle(title) {
  if (!title) return '';
  return title
    .replace(/\s*-\s*Remaster(ed)?(\s+\d{4})?/gi, '')
    .replace(/\s*\[.*?(Remaster|Remastered|Deluxe|Bonus|Edition|Version).*?\]/gi, '')
    .replace(/\s*\(.*?(Remaster|Remastered|Deluxe|Bonus|Anniversary|Live|Mono|Stereo).*?\)/gi, '')
    .replace(/\s*-\s*Radio Edit/gi, '')
    .replace(/\s*\(Radio Edit\)/gi, '')
    .trim();
}

function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const CURATED_TRACKS = [
  // --- Modern Pop & Radio Megahits ---
  { query: 'The Weeknd Blinding Lights', tier: 'Easy', genre: 'Pop' },
  { query: 'Taylor Swift Shake It Off', tier: 'Easy', genre: 'Pop' },
  { query: 'Ed Sheeran Shape of You', tier: 'Easy', genre: 'Pop' },
  { query: 'Dua Lipa Levitating', tier: 'Easy', genre: 'Pop' },
  { query: 'Billie Eilish bad guy', tier: 'Easy', genre: 'Pop' },
  { query: 'Harry Styles As It Was', tier: 'Easy', genre: 'Pop' },
  { query: 'Adele Rolling in the Deep', tier: 'Easy', genre: 'Pop' },
  { query: 'Bruno Mars Mark Ronson Uptown Funk', tier: 'Easy', genre: 'Pop' },
  { query: 'Lady Gaga Poker Face', tier: 'Easy', genre: 'Pop' },
  { query: 'Katy Perry Roar', tier: 'Easy', genre: 'Pop' },
  { query: 'The Kid LAROI Justin Bieber Stay', tier: 'Easy', genre: 'Pop' },
  { query: 'Sia Chandelier', tier: 'Medium', genre: 'Pop' },
  { query: 'Shawn Mendes Camila Cabello Senorita', tier: 'Medium', genre: 'Pop' },
  { query: 'Ariana Grande 7 rings', tier: 'Medium', genre: 'Pop' },
  { query: 'Miley Cyrus Flowers', tier: 'Easy', genre: 'Pop' },
  { query: 'Olivia Rodrigo drivers license', tier: 'Medium', genre: 'Pop' },

  // --- Classic Rock & Anthems ---
  { query: 'Queen Bohemian Rhapsody', tier: 'Easy', genre: 'Rock' },
  { query: 'Queen We Will Rock You', tier: 'Easy', genre: 'Rock' },
  { query: 'Nirvana Smells Like Teen Spirit', tier: 'Easy', genre: 'Rock' },
  { query: 'AC DC Back In Black', tier: 'Easy', genre: 'Rock' },
  { query: 'Guns N Roses Sweet Child O Mine', tier: 'Easy', genre: 'Rock' },
  { query: 'Bon Jovi Livin On A Prayer', tier: 'Easy', genre: 'Rock' },
  { query: 'The Beatles Come Together', tier: 'Medium', genre: 'Rock' },
  { query: 'The Rolling Stones Paint It Black', tier: 'Medium', genre: 'Rock' },
  { query: 'Journey Don t Stop Believin', tier: 'Easy', genre: 'Rock' },
  { query: 'Eagles Hotel California', tier: 'Medium', genre: 'Rock' },
  { query: 'Linkin Park In The End', tier: 'Easy', genre: 'Rock' },
  { query: 'Coldplay Viva La Vida', tier: 'Easy', genre: 'Rock' },
  { query: 'Imagine Dragons Believer', tier: 'Easy', genre: 'Rock' },
  { query: 'Green Day Boulevard of Broken Dreams', tier: 'Medium', genre: 'Rock' },
  { query: 'Survivor Eye of the Tiger', tier: 'Easy', genre: 'Rock' },

  // --- Hip-Hop & R&B ---
  { query: 'Eminem Lose Yourself', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Eminem Without Me', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Drake Gods Plan', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Kendrick Lamar HUMBLE', tier: 'Medium', genre: 'Hip-Hop' },
  { query: 'Post Malone Circles', tier: 'Easy', genre: 'Hip-Hop' },
  { query: '50 Cent In Da Club', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Snoop Dogg Drop It Like Its Hot', tier: 'Medium', genre: 'Hip-Hop' },
  { query: 'Kanye West Stronger', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Usher Yeah', tier: 'Easy', genre: 'R&B' },
  { query: 'Jay Z Alicia Keys Empire State of Mind', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Outkast Hey Ya', tier: 'Easy', genre: 'Hip-Hop' },
  { query: 'Rihanna Diamonds', tier: 'Easy', genre: 'Pop' },

  // --- Electronic & Dance ---
  { query: 'Daft Punk Get Lucky', tier: 'Easy', genre: 'Electronic' },
  { query: 'Daft Punk One More Time', tier: 'Easy', genre: 'Electronic' },
  { query: 'Avicii Wake Me Up', tier: 'Easy', genre: 'Electronic' },
  { query: 'Calvin Harris Summer', tier: 'Easy', genre: 'Electronic' },
  { query: 'The Chainsmokers Closer', tier: 'Easy', genre: 'Electronic' },
  { query: 'David Guetta Sia Titanium', tier: 'Easy', genre: 'Electronic' },
  { query: 'Martin Garrix Animals', tier: 'Medium', genre: 'Electronic' },
  { query: 'Swedish House Mafia Don t You Worry Child', tier: 'Medium', genre: 'Electronic' },

  // --- 80s & Retro Classics ---
  { query: 'Michael Jackson Billie Jean', tier: 'Easy', genre: '80s' },
  { query: 'Michael Jackson Beat It', tier: 'Easy', genre: '80s' },
  { query: 'Rick Astley Never Gonna Give You Up', tier: 'Easy', genre: '80s' },
  { query: 'a ha Take On Me', tier: 'Easy', genre: '80s' },
  { query: 'Toto Africa', tier: 'Easy', genre: '80s' },
  { query: 'Earth Wind Fire September', tier: 'Easy', genre: '80s' },
  { query: 'Cyndi Lauper Girls Just Want to Have Fun', tier: 'Easy', genre: '80s' },
  { query: 'Wham Wake Me Up Before You Go Go', tier: 'Easy', genre: '80s' },
  { query: 'George Michael Careless Whisper', tier: 'Easy', genre: '80s' },
  { query: 'Whitney Houston I Wanna Dance with Somebody', tier: 'Easy', genre: '80s' },
];

async function seedRealMusic() {
  console.log(`\n======================================================`);
  console.log(`🎵 SongSprint Real Music Ingestion (iTunes API)`);
  console.log(`Target: ${CURATED_TRACKS.length} iconic worldwide hits`);
  console.log(`======================================================\n`);

  let addedCount = 0;
  const savedSongs = [];

  for (let i = 0; i < CURATED_TRACKS.length; i++) {
    const item = CURATED_TRACKS[i];
    const progress = `[${String(i + 1).padStart(2, '0')}/${CURATED_TRACKS.length}]`;

    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(item.query)}&entity=song&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'SongSprint/1.0' } });
      if (!res.ok) {
        console.warn(`${progress} ⚠ Failed fetching "${item.query}": HTTP ${res.status}`);
        continue;
      }

      const json = await res.json();
      const track = json.results?.[0];

      if (!track || !track.previewUrl) {
        console.warn(`${progress} ⚠ No audio preview found for "${item.query}"`);
        continue;
      }

      const songId = `itunes-${track.trackId}`;
      const canonicalTitle = cleanTrackTitle(track.trackName);
      const primaryArtist = track.artistName.trim();
      const genre = item.genre || track.primaryGenreName || 'Pop';
      const clipId = `clip-${songId}`;

      // 1. Insert or update into songs table
      await client.execute({
        sql: `INSERT INTO songs (id, canonical_title, primary_artist, genre, difficulty_tier, status, metadata_version)
              VALUES (?, ?, ?, ?, ?, 'active', 1)
              ON CONFLICT(id) DO UPDATE SET
                canonical_title = excluded.canonical_title,
                primary_artist = excluded.primary_artist,
                genre = excluded.genre,
                status = 'active'`,
        args: [songId, canonicalTitle, primaryArtist, genre, item.tier],
      });

      // 2. Insert or update into song_clips table
      await client.execute({
        sql: `INSERT INTO song_clips (id, song_id, audio_url, start_ms, max_duration_ms, fairness_score, review_status)
              VALUES (?, ?, ?, 0, 5000, 99, 'approved')
              ON CONFLICT(id) DO UPDATE SET
                audio_url = excluded.audio_url,
                review_status = 'approved'`,
        args: [clipId, songId, track.previewUrl],
      });

      // 3. Insert canonical & search aliases
      await client.execute({
        sql: `INSERT OR IGNORE INTO song_aliases (id, song_id, alias_type, normalized_value)
              VALUES (?, ?, 'title', ?)`,
        args: [`alias-${songId}-canonical`, songId, normalize(canonicalTitle)],
      });

      // Also index "Artist - Title" and original unstripped title for flexible search
      await client.execute({
        sql: `INSERT OR IGNORE INTO song_aliases (id, song_id, alias_type, normalized_value)
              VALUES (?, ?, 'title', ?)`,
        args: [`alias-${songId}-combo`, songId, normalize(`${primaryArtist} ${canonicalTitle}`)],
      });

      if (track.trackName !== canonicalTitle) {
        await client.execute({
          sql: `INSERT OR IGNORE INTO song_aliases (id, song_id, alias_type, normalized_value)
                VALUES (?, ?, 'title', ?)`,
          args: [`alias-${songId}-orig`, songId, normalize(track.trackName)],
        });
      }

      savedSongs.push({ id: songId, clipId, canonicalTitle, primaryArtist, tier: item.tier });
      addedCount++;
      console.log(`${progress} ✓ ${primaryArtist} - "${canonicalTitle}" (${genre})`);

      // Gentle pause to respect iTunes search rate limits
      await new Promise((r) => setTimeout(r, 120));
    } catch (err) {
      console.error(`${progress} ✗ Error processing "${item.query}":`, err.message);
    }
  }

  console.log(`\n------------------------------------------------------`);
  console.log(`Seeding complete: ${addedCount} real songs saved to SQLite!`);
  console.log(`------------------------------------------------------\n`);

  // 4. Update today's Daily Puzzle with 5 iconic real songs
  if (savedSongs.length >= 5) {
    const todayUtc = new Date().toISOString().split('T')[0];
    const puzzleId = `daily-${todayUtc}`;

    console.log(`Configuring Daily Puzzle for ${todayUtc} with real hits...`);

    await client.execute({
      sql: `INSERT INTO daily_puzzles (id, puzzle_date, status, published_at)
            VALUES (?, ?, 'approved', ?)
            ON CONFLICT(puzzle_date) DO UPDATE SET status = 'approved'`,
      args: [puzzleId, todayUtc, Date.now()],
    });

    // Pick 5 varied famous songs
    const topHits = [
      savedSongs.find((s) => s.canonicalTitle.includes('Blinding Lights')) || savedSongs[0],
      savedSongs.find((s) => s.canonicalTitle.includes('Bohemian Rhapsody')) || savedSongs[1],
      savedSongs.find((s) => s.canonicalTitle.includes('Billie Jean')) || savedSongs[2],
      savedSongs.find((s) => s.canonicalTitle.includes('Shake It Off')) || savedSongs[3],
      savedSongs.find((s) => s.canonicalTitle.includes('Take On Me')) || savedSongs[4],
    ].filter(Boolean);

    // Clear and insert items
    await client.execute({
      sql: `DELETE FROM daily_puzzle_items WHERE daily_puzzle_id = ?`,
      args: [puzzleId],
    });

    for (let pos = 0; pos < topHits.length; pos++) {
      const s = topHits[pos];
      await client.execute({
        sql: `INSERT INTO daily_puzzle_items (id, daily_puzzle_id, position, song_id, clip_id, difficulty_tier)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [`dpi-${puzzleId}-${pos + 1}`, puzzleId, pos + 1, s.id, s.clipId, s.tier],
      });
      console.log(`  Round ${pos + 1}: ${s.primaryArtist} - ${s.canonicalTitle}`);
    }

    console.log(`\n✓ Today's Daily Puzzle is now armed with 5 real hits!`);
  }
}

seedRealMusic().catch((err) => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});
