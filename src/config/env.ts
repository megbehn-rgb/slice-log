const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

if (!GOOGLE_PLACES_API_KEY) {
  throw new Error(
    'Missing EXPO_PUBLIC_GOOGLE_PLACES_API_KEY. Copy .env.example to .env, add your ' +
      'Google Places API key, and restart the Expo dev server.'
  );
}

export const env = {
  googlePlacesApiKey: GOOGLE_PLACES_API_KEY,
};
