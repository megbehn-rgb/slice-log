export interface Photo {
  id: number;
  restaurantId: number;
  uri: string;
  createdAt: string;
}

export interface Restaurant {
  id: number;
  placeId: string;
  name: string;
  address: string;
  neighborhood: string | null;
  borough: string | null;
  latitude: number;
  longitude: number;
  googleRating: number | null;
  googleRatingCount: number | null;
  tommyRating: number | null;
  tommyReview: string;
  meghanRating: number | null;
  meghanReview: string;
  visitDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantDetail extends Restaurant {
  photos: Photo[];
  tags: string[];
  orderTypes: string[];
}

// "High-Low"/"Low-High" sort by whichever profile is currently active (see
// ProfileContext) -- Tommy's rating when Tommy's active, Meghan's when
// Meghan's active. "Newest"/"Oldest" sort by the user-editable visit date,
// not by when the row was inserted into the database.
export type SortOption = 'ratingDesc' | 'ratingAsc' | 'visitDateDesc' | 'visitDateAsc' | 'alphabetical';

export interface NewRestaurantInput {
  placeId: string;
  name: string;
  address: string;
  neighborhood: string | null;
  borough: string | null;
  latitude: number;
  longitude: number;
  googleRating: number | null;
  googleRatingCount: number | null;
  tommyRating: number | null;
  tommyReview: string;
  meghanRating: number | null;
  meghanReview: string;
  visitDate: string;
  orderTypes: string[];
  tags: string[];
  photoUris: string[];
}

export interface RestaurantUpdateInput {
  tommyRating: number | null;
  tommyReview: string;
  meghanRating: number | null;
  meghanReview: string;
  visitDate: string;
  orderTypes: string[];
  tags: string[];
}
