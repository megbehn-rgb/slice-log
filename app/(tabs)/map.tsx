import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { RestaurantMap } from '../../src/components/RestaurantMap';
import { listRestaurants } from '../../src/db/restaurantRepository';
import type { Restaurant } from '../../src/types/restaurant';

export default function MapScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useFocusEffect(
    useCallback(() => {
      listRestaurants({ sort: 'alphabetical', search: '' }).then(setRestaurants);
    }, [])
  );

  return (
    <RestaurantMap
      restaurants={restaurants}
      onSelectRestaurant={(id) => router.push({ pathname: '/restaurant/[id]', params: { id } })}
    />
  );
}
