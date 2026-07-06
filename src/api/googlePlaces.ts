import { env } from '../config/env';
import { extractNeighborhoodAndBorough } from '../utils/neighborhood';
import type { PlaceAddressComponent, PlaceDetails, PlacePrediction } from './places.types';

const AUTOCOMPLETE_URL = 'https://places.googleapis.com/v1/places:autocomplete';
const DETAILS_BASE_URL = 'https://places.googleapis.com/v1/places';

// Rough bounding box covering the five NYC boroughs plus nearby NJ (Jersey
// City, Hoboken, Newark, etc.). This is only a *bias*, not a hard filter, so
// results just outside it can still appear if they're a strong match.
const NYC_NJ_LOCATION_BIAS = {
  rectangle: {
    low: { latitude: 39.85, longitude: -74.35 },
    high: { latitude: 41.05, longitude: -73.35 },
  },
};

interface AutocompleteResponse {
  suggestions?: Array<{
    placePrediction?: {
      placeId: string;
      structuredFormat?: {
        mainText?: { text: string };
        secondaryText?: { text: string };
      };
      text?: { text: string };
    };
  }>;
}

interface PlaceDetailsResponse {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  addressComponents?: PlaceAddressComponent[];
  location?: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
}

export async function autocompletePizzaPlaces(
  input: string,
  signal?: AbortSignal
): Promise<PlacePrediction[]> {
  if (!input.trim()) {
    return [];
  }

  // Deliberately no `includedPrimaryTypes` filter here. Google's type
  // taxonomy is inconsistent about labeling pizza spots — plenty of real
  // pizzerias are tagged `restaurant`, `italian_restaurant`, or
  // `meal_takeaway` rather than the narrow `pizza_restaurant` type, so
  // filtering by type was hiding legitimate results. The location bias plus
  // the user's own search text is enough for relevance ranking.
  const response = await fetch(AUTOCOMPLETE_URL, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': env.googlePlacesApiKey,
    },
    body: JSON.stringify({
      input,
      locationBias: NYC_NJ_LOCATION_BIAS,
      includedRegionCodes: ['us'],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Places autocomplete failed (${response.status}): ${body}`);
  }

  const data: AutocompleteResponse = await response.json();

  return (data.suggestions ?? [])
    .map((suggestion) => suggestion.placePrediction)
    .filter((prediction): prediction is NonNullable<typeof prediction> => !!prediction)
    .map((prediction) => ({
      placeId: prediction.placeId,
      mainText: prediction.structuredFormat?.mainText?.text ?? prediction.text?.text ?? '',
      secondaryText: prediction.structuredFormat?.secondaryText?.text ?? '',
    }));
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const fieldMask = [
    'id',
    'displayName',
    'formattedAddress',
    'addressComponents',
    'location',
    'rating',
    'userRatingCount',
  ].join(',');

  const response = await fetch(`${DETAILS_BASE_URL}/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': env.googlePlacesApiKey,
      'X-Goog-FieldMask': fieldMask,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Place details request failed (${response.status}): ${body}`);
  }

  const data: PlaceDetailsResponse = await response.json();
  const { neighborhood, borough } = extractNeighborhoodAndBorough(data.addressComponents ?? []);

  return {
    placeId: data.id,
    name: data.displayName?.text ?? '',
    address: data.formattedAddress ?? '',
    neighborhood,
    borough,
    latitude: data.location?.latitude ?? 0,
    longitude: data.location?.longitude ?? 0,
    googleRating: data.rating ?? null,
    googleRatingCount: data.userRatingCount ?? null,
  };
}
