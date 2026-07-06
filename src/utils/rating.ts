import type { Profile } from '../context/ProfileContext';

export const HIGH_SCORE_THRESHOLD = 9.0;

export function isHighScore(rating: number | null): boolean {
  return rating !== null && rating >= HIGH_SCORE_THRESHOLD;
}

export interface NamedRating {
  profile: Profile;
  label: string;
  value: number | null;
}

// Orders the two ratings so the active profile's own rating comes first --
// used anywhere both ratings are shown together (e.g. the map pin preview),
// to match the same active-profile-first convention as the home list badge
// and the detail screen's review section ordering.
export function getRatingsByActiveProfile(
  activeProfile: Profile,
  tommyRating: number | null,
  meghanRating: number | null
): { primary: NamedRating; secondary: NamedRating } {
  const tommy: NamedRating = { profile: 'Tommy', label: "Tommy's", value: tommyRating };
  const meghan: NamedRating = { profile: 'Meghan', label: "Meghan's", value: meghanRating };
  return activeProfile === 'Meghan' ? { primary: meghan, secondary: tommy } : { primary: tommy, secondary: meghan };
}
