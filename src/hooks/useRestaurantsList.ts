import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { listRestaurants } from '../db/restaurantRepository';
import type { Restaurant, SortOption } from '../types/restaurant';

export function useRestaurantsList() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('tommyRatingDesc');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [orderTypeFilter, setOrderTypeFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResults = useCallback(() => {
    return listRestaurants({ sort, search, tagFilter, orderTypeFilter });
  }, [sort, search, tagFilter, orderTypeFilter]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setRestaurants(await fetchResults());
    } finally {
      setLoading(false);
    }
  }, [fetchResults]);

  // Since data can now change from Tommy's phone too, not just this one,
  // pull-to-refresh gives an explicit way to pick up remote changes without
  // needing to leave and re-enter the screen (which useFocusEffect already
  // covers on its own).
  const pullToRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setRestaurants(await fetchResults());
    } finally {
      setRefreshing(false);
    }
  }, [fetchResults]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh])
  );

  return {
    restaurants,
    search,
    setSearch,
    sort,
    setSort,
    tagFilter,
    setTagFilter,
    orderTypeFilter,
    setOrderTypeFilter,
    loading,
    refreshing,
    pullToRefresh,
    refresh,
  };
}
