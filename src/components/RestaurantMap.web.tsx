import type L from 'leaflet';
import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../constants/colors';
import type { Profile } from '../context/ProfileContext';
import type { Restaurant } from '../types/restaurant';
import { getRatingsByActiveProfile } from '../utils/rating';

const NYC_CENTER: [number, number] = [40.7128, -74.006];
const DEFAULT_ZOOM = 11;
const LEAFLET_CSS_ID = 'slice-log-leaflet-css';
const LEAFLET_CSS_URL = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

interface RestaurantMapProps {
  restaurants: Restaurant[];
  activeProfile: Profile;
  onSelectRestaurant: (id: number) => void;
}

function ratingColor(profile: Profile): string {
  return profile === 'Tommy' ? COLORS.tomato : COLORS.crust;
}

function ensureLeafletCss() {
  if (document.getElementById(LEAFLET_CSS_ID)) return;
  const link = document.createElement('link');
  link.id = LEAFLET_CSS_ID;
  link.rel = 'stylesheet';
  link.href = LEAFLET_CSS_URL;
  document.head.appendChild(link);
}

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

// react-native-maps has no real web implementation (its web build just
// renders an empty placeholder view), so the web target gets its own map
// here using Leaflet + OpenStreetMap tiles -- free, no API key or billing
// needed, unlike the Google Maps JavaScript API. Metro automatically picks
// this file for web builds and the sibling RestaurantMap.tsx for native.
export function RestaurantMap({ restaurants, activeProfile, onSelectRestaurant }: RestaurantMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    let cancelled = false;

    ensureLeafletCss();
    import('leaflet').then(({ default: leaflet }) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = leaflet.map(containerRef.current).setView(NYC_CENTER, DEFAULT_ZOOM);
      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        })
        .addTo(map);
      mapRef.current = map;
      renderMarkers(leaflet);
    });

    return () => {
      cancelled = true;
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Only set up the map once on mount -- the effect below handles marker
    // updates, and the container ref's identity never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    import('leaflet').then(({ default: leaflet }) => renderMarkers(leaflet));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurants, activeProfile]);

  function renderMarkers(leaflet: typeof L) {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = restaurants.map((restaurant) => {
      const marker = leaflet.marker([restaurant.latitude, restaurant.longitude]).addTo(map);
      const { primary, secondary } = getRatingsByActiveProfile(
        activeProfile,
        restaurant.tommyRating,
        restaurant.meghanRating
      );
      const primaryText = primary.value !== null ? primary.value.toFixed(1) : '—';
      const secondaryText = secondary.value !== null ? secondary.value.toFixed(1) : '—';

      const popupNode = document.createElement('div');
      popupNode.style.minWidth = '160px';
      popupNode.innerHTML = `
        <div style="font-weight:700;font-size:15px;margin-bottom:2px;">${escapeHtml(restaurant.name)}</div>
        <div style="font-weight:600;font-size:13px;color:${ratingColor(primary.profile)};">${primary.label}: ${primaryText}</div>
        <div style="font-weight:600;font-size:11px;color:${ratingColor(secondary.profile)};margin-bottom:4px;">${secondary.label}: ${secondaryText}</div>
        <button type="button" style="font-weight:600;font-size:12px;color:${COLORS.googleBlue};background:none;border:none;padding:0;cursor:pointer;">View details ›</button>
      `;
      popupNode.querySelector('button')?.addEventListener('click', () => {
        onSelectRestaurant(restaurant.id);
      });
      marker.bindPopup(popupNode);
      return marker;
    });

    if (restaurants.length > 0) {
      const bounds = leaflet.latLngBounds(
        restaurants.map((r) => [r.latitude, r.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }

  return (
    <View
      ref={(node) => {
        containerRef.current = node as unknown as HTMLDivElement;
      }}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
