import { useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { BasilDivider } from '../../src/components/BasilDivider';
import { EmptyState } from '../../src/components/EmptyState';
import { RestaurantListItem } from '../../src/components/RestaurantListItem';
import { SortFilterBar } from '../../src/components/SortFilterBar';
import { COLORS } from '../../src/constants/colors';
import { FONT_BODY_REGULAR, FONT_BODY_SEMIBOLD } from '../../src/constants/typography';
import { useProfile } from '../../src/context/ProfileContext';
import { useRestaurantsList } from '../../src/hooks/useRestaurantsList';

const TAGLINE = "👸 Princess & Teddy Graham's Culinary Adventures 🧸";

export default function HomeScreen() {
  const router = useRouter();
  const { activeProfile } = useProfile();
  const {
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
  } = useRestaurantsList();

  const hasActiveFilter = !!(search || tagFilter || orderTypeFilter);
  const trulyEmpty = !loading && restaurants.length === 0 && !hasActiveFilter;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerSpacer} />
        <Text style={styles.tagline}>{TAGLINE}</Text>
        <Pressable
          style={({ pressed }) => [styles.profileAvatar, pressed && styles.profileAvatarPressed]}
          onPress={() => router.push('/switch-profile')}
          hitSlop={8}
        >
          <Text style={styles.profileAvatarText}>{activeProfile?.[0] ?? '?'}</Text>
        </Pressable>
      </View>
      <SortFilterBar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        onSortChange={setSort}
        tagFilter={tagFilter}
        onTagFilterChange={setTagFilter}
        orderTypeFilter={orderTypeFilter}
        onOrderTypeFilterChange={setOrderTypeFilter}
      />
      <FlatList
        data={restaurants}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <RestaurantListItem
            restaurant={item}
            onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: item.id } })}
          />
        )}
        ItemSeparatorComponent={BasilDivider}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={pullToRefresh}
            tintColor={COLORS.tomato}
          />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              {trulyEmpty ? (
                <EmptyState
                  title="No slices logged yet!"
                  subtitle="Time to go find one worth remembering."
                />
              ) : (
                <Text style={styles.emptyText}>No restaurants match your search/filter.</Text>
              )}
            </View>
          ) : null
        }
        contentContainerStyle={restaurants.length === 0 ? styles.emptyListContent : undefined}
      />
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => router.push('/add')}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  headerSpacer: {
    width: 28,
  },
  tagline: {
    flex: 1,
    fontFamily: FONT_BODY_REGULAR,
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
    color: '#a8935f',
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.tomato,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarPressed: {
    opacity: 0.7,
  },
  profileAvatarText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 13,
    color: '#fff',
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyText: {
    fontFamily: FONT_BODY_REGULAR,
    color: '#888',
    textAlign: 'center',
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.basil,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  fabPressed: {
    transform: [{ scale: 0.92 }],
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 32,
    marginTop: -2,
  },
});
