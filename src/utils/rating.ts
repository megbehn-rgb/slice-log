export const HIGH_SCORE_THRESHOLD = 9.0;

export function isHighScore(rating: number | null): boolean {
  return rating !== null && rating >= HIGH_SCORE_THRESHOLD;
}
