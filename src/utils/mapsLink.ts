export function buildGoogleMapsUrl(params: {
  placeId: string;
  latitude: number;
  longitude: number;
}): string {
  const query = encodeURIComponent(`${params.latitude},${params.longitude}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${params.placeId}`;
}
