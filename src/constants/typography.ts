// Display font (Fredoka — rounded, bouncy) is for headers/titles/big stats
// only. Body font (Nunito — clean, readable) is applied explicitly wherever
// text renders, since React Native has no way to set a true global default;
// the contrast between the two is the whole point, so don't reach for
// FONT_DISPLAY on paragraph/label text.
export const FONT_DISPLAY_REGULAR = 'Fredoka_500Medium';
export const FONT_DISPLAY_BOLD = 'Fredoka_600SemiBold';

export const FONT_BODY_REGULAR = 'Nunito_400Regular';
export const FONT_BODY_SEMIBOLD = 'Nunito_600SemiBold';
export const FONT_BODY_BOLD = 'Nunito_700Bold';
