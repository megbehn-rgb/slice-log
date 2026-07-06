import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT_BODY_REGULAR, FONT_BODY_SEMIBOLD, FONT_DISPLAY_BOLD } from '../constants/typography';
import type { Profile } from '../context/ProfileContext';
import type { Restaurant } from '../types/restaurant';
import { isHighScore } from '../utils/rating';

interface RestaurantListItemProps {
  restaurant: Restaurant;
  activeProfile: Profile;
  onPress: () => void;
}

export function RestaurantListItem({ restaurant, activeProfile, onPress }: RestaurantListItemProps) {
  const location = [restaurant.neighborhood, restaurant.borough]
    .filter((part) => !!part)
    .join(', ');
  // The badge shows whoever's currently using the app -- the other
  // person's rating is still fully visible on the detail screen.
  const displayedRating = activeProfile === 'Meghan' ? restaurant.meghanRating : restaurant.tommyRating;
  const flourish = isHighScore(displayedRating);

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.containerPressed]}
      onPress={onPress}
    >
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {restaurant.name}
        </Text>
        {!!location && (
          <Text style={styles.location} numberOfLines={1}>
            {location}
          </Text>
        )}
        {restaurant.googleRating !== null && (
          <Text style={styles.googleRating}>Google: {restaurant.googleRating.toFixed(1)}★</Text>
        )}
      </View>
      <View style={styles.ratingPillWrapper}>
        <View style={styles.ratingPill}>
          <Text style={styles.ratingText}>
            {displayedRating !== null ? displayedRating.toFixed(1) : '—'}
          </Text>
        </View>
        {flourish && <Text style={styles.flourish}>🔥</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  containerPressed: {
    backgroundColor: '#faf6ee',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 17,
  },
  location: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 13,
    color: '#666',
  },
  googleRating: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 12,
    color: '#999',
  },
  ratingPillWrapper: {
    width: 48,
    height: 48,
  },
  ratingPill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.tomato,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    fontFamily: FONT_DISPLAY_BOLD,
    color: '#fff',
    fontSize: 15,
  },
  flourish: {
    position: 'absolute',
    top: -6,
    right: -6,
    fontSize: 16,
  },
});
