import type { PlaceAddressComponent } from '../api/places.types';

function findComponent(
  components: PlaceAddressComponent[],
  type: string
): PlaceAddressComponent | undefined {
  return components.find((component) => component.types.includes(type));
}

// Google's address components don't have a dedicated "borough" type. In NYC,
// boroughs (Brooklyn, Queens, Bronx, Staten Island, Manhattan) show up as
// sublocality_level_1. NJ towns don't have that component, so we fall back to
// using the town (locality) as the neighborhood value there instead.
export function extractNeighborhoodAndBorough(components: PlaceAddressComponent[]): {
  neighborhood: string | null;
  borough: string | null;
} {
  const borough = findComponent(components, 'sublocality_level_1')?.longText ?? null;
  const neighborhood =
    findComponent(components, 'neighborhood')?.longText ??
    findComponent(components, 'sublocality')?.longText ??
    (borough ? null : findComponent(components, 'locality')?.longText ?? null);

  return { neighborhood, borough };
}
