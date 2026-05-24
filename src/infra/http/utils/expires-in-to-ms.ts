/**
 * Converts a JWT-style duration string (`15m`, `7d`, …) to milliseconds for `Set-Cookie` maxAge.
 */
export function expiresInToMilliseconds(expiresIn: string): number {
  const trimmed = expiresIn.trim();
  const match = /^(\d+)([smhd])$/i.exec(trimmed);
  if (!match) {
    return 86_400_000;
  }
  const value = Number.parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return value * (multipliers[unit] ?? 86_400_000);
}
