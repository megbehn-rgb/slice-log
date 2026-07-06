export interface PlacePrediction {
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceAddressComponent {
  longText: string;
  shortText: string;
  types: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: string;
  neighborhood: string | null;
  borough: string | null;
  latitude: number;
  longitude: number;
  googleRating: number | null;
  googleRatingCount: number | null;
}
