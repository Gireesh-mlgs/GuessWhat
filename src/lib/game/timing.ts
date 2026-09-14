export function getTodayUtcDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getMillisecondsUntilNextUtcMidnight(): number {
  const now = new Date();
  const nextUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return Math.max(0, nextUtc.getTime() - now.getTime());
}
