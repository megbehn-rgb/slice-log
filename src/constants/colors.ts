// A small, purposeful pizza-inspired palette. Each color has one job —
// resist the urge to reach for a fourth "just because" when styling a new
// screen; reuse one of these instead.
export const COLORS = {
  tomato: '#D64545', // primary actions, Tommy's rating — matches the original brand red
  basil: '#3A8F4C', // secondary/"go" actions: add button, share, success
  crust: '#C17F2E', // highlights: Meghan's rating, pizza-style filter/tag accents
  cream: '#FFF8EC', // warm background canvas, replaces stark white page backgrounds
  creamTint: '#FBEFD9', // soft tint of crust, for pill/badge backgrounds
  googleBlue: '#4285F4', // left as Google's own brand color for the Maps/Google-rating tie-in
} as const;
