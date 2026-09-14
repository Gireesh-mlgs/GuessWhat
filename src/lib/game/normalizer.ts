/**
 * Normalizes song titles, artists, and search queries for fair, robust comparison.
 */
export function normalizeText(text: string): string {
  if (!text) return '';

  return (
    text
      // Normalize Unicode (decomposes accents into base characters + combining marks)
      .normalize('NFKD')
      // Strip combining diacritical marks (e.g., é -> e, ñ -> n)
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      // Remove remaster / live / edit / deluxe / anniversary annotations in parens/brackets
      .replace(/\((?:remastered|live|radio edit|deluxe|bonus track|instrumental|edit|mono|stereo|feat\.?|ft\.?)[^)]*\)/gi, '')
      .replace(/\[(?:remastered|live|radio edit|deluxe|bonus track|instrumental|edit|mono|stereo|feat\.?|ft\.?)[^\]]*\]/gi, '')
      // Remove common featuring expressions: feat, ft., featuring, with, vs.
      .replace(/\b(?:feat\.?|ft\.?|featuring|with|vs\.?)\b.*$/gi, '')
      // Strip non-alphanumeric characters except spaces
      .replace(/[^\w\s]/g, ' ')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export function matchesNormalized(candidate: string, query: string): boolean {
  const normCandidate = normalizeText(candidate);
  const normQuery = normalizeText(query);
  if (!normQuery) return false;
  return normCandidate.includes(normQuery);
}
