import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, type Region } from 'react-native-maps';
import { COLORS } from '../constants/colors';
import { FONT_BODY_SEMIBOLD, FONT_DISPLAY_BOLD } from '../constants/typography';
import type { Restaurant } from '../types/restaurant';

const NYC_REGION: Region = {
  latitude: 40.7128,
  longitude: -74.006,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

interface RestaurantMapProps {
  restaurants: Restaurant[];
  onSelectRestaurant: (id: number) => void;
}

export function RestaurantMap({ restaurants, onSelectRestaurant }: RestaurantMapProps) {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);

  // fitToCoordinates needs both the map to be ready and the restaurant data
  // to have loaded — these resolve independently (one from a native
  // callback, one from an async DB query), so neither alone is a safe
  // trigger on its own.
  useEffect(() => {
    if (!mapReady || restaurants.length === 0 || !mapRef.current) {
      return;
    }
    mapRef.current.fitToCoordinates(
      restaurants.map((restaurant) => ({
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      })),
      { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: false }
    );
  }, [mapReady, restaurants]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={NYC_REGION}
        onMapReady={() => setMapReady(true)}
      >
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            coordinate={{ latitude: restaurant.latitude, longitude: restaurant.longitude }}
          >
            <Callout onPress={() => onSelectRestaurant(restaurant.id)}>
              <View style={styles.callout}>
                <Text style={styles.calloutName}>{restaurant.name}</Text>
                <Text style={styles.calloutRating}>
                  Tommy's:{' '}
                  {restaurant.tommyRating !== null ? restaurant.tommyRating.toFixed(1) : '—'}
                </Text>
                <Text style={styles.calloutLink}>View details ›</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  callout: {
    minWidth: 160,
    padding: 4,
    gap: 2,
  },
  calloutName: {
    fontFamily: FONT_DISPLAY_BOLD,
    fontSize: 15,
  },
  calloutRating: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 13,
    color: COLORS.tomato,
  },
  calloutLink: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 12,
    color: COLORS.googleBlue,
    marginTop: 4,
  },
});
