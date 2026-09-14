export interface ITunesRawTrack {
  trackId: number;
  artistId?: number;
  collectionId?: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  previewUrl?: string;
  artworkUrl30?: string;
  artworkUrl60?: string;
  artworkUrl100?: string;
  primaryGenreName?: string;
  releaseDate?: string;
  country?: string;
  isStreamable?: boolean;
}

export interface ITunesTrack {
  id: string;
  trackId: number;
  canonicalTitle: string;
  primaryArtist: string;
  genre: string;
  previewUrl: string;
  artworkUrl: string;
  releaseYear?: number;
}

/**
 * Clean common metadata noise from track titles for cleaner guessing
 * e.g. "Bohemian Rhapsody - Remastered 2011" -> "Bohemian Rhapsody"
 */
export function cleanTrackTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/\s*-\s*Remaster(ed)?(\s+\d{4})?/gi, '')
    .replace(/\s*\[.*?(Remaster|Remastered|Deluxe|Bonus|Edition|Version).*?\]/gi, '')
    .replace(/\s*\(.*?(Remaster|Remastered|Deluxe|Bonus|Anniversary|Live|Mono|Stereo).*?\)/gi, '')
    .replace(/\s*-\s*Radio Edit/gi, '')
    .replace(/\s*\(Radio Edit\)/gi, '')
    .trim();
}

/**
 * Searches the official iTunes Search API for songs matching a query.
 * Requires no API keys and returns playable 30-second AAC/M4A previews.
 */
export async function searchITunesSongs(term: string, limit: number = 20): Promise<ITunesTrack[]> {
  const encoded = encodeURIComponent(term.trim());
  const url = `https://itunes.apple.com/search?term=${encoded}&entity=song&limit=${limit}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SongSprint/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`iTunes Search API error HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const results: ITunesRawTrack[] = data.results || [];

    // Filter only streamable tracks with valid preview URLs
    return results
      .filter((t) => typeof t.previewUrl === 'string' && t.previewUrl.length > 0 && !!t.trackName && !!t.artistName)
      .map((t) => {
        // Upgrade artwork URL to higher resolution 600x600 if available
        const artwork = t.artworkUrl100
          ? t.artworkUrl100.replace('100x100bb', '600x600bb')
          : (t.artworkUrl60 || '');

        const releaseYear = t.releaseDate ? new Date(t.releaseDate).getFullYear() : undefined;

        return {
          id: `itunes-${t.trackId}`,
          trackId: t.trackId,
          canonicalTitle: cleanTrackTitle(t.trackName),
          primaryArtist: t.artistName.trim(),
          genre: t.primaryGenreName || 'Pop',
          previewUrl: t.previewUrl!,
          artworkUrl: artwork,
          releaseYear,
        };
      });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to query iTunes';
    console.error('searchITunesSongs error:', msg);
    return [];
  }
}

/**
 * Look up a specific song by its iTunes trackId
 */
export async function getITunesSongById(trackId: number): Promise<ITunesTrack | null> {
  const url = `https://itunes.apple.com/lookup?id=${trackId}&entity=song`;
  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    const t: ITunesRawTrack = data.results?.[0];
    if (!t || !t.previewUrl) return null;

    const artwork = t.artworkUrl100
      ? t.artworkUrl100.replace('100x100bb', '600x600bb')
      : (t.artworkUrl60 || '');

    return {
      id: `itunes-${t.trackId}`,
      trackId: t.trackId,
      canonicalTitle: cleanTrackTitle(t.trackName),
      primaryArtist: t.artistName.trim(),
      genre: t.primaryGenreName || 'Pop',
      previewUrl: t.previewUrl,
      artworkUrl: artwork,
      releaseYear: t.releaseDate ? new Date(t.releaseDate).getFullYear() : undefined,
    };
  } catch {
    return null;
  }
}
