import { forwardRef } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT_BODY_BOLD, FONT_BODY_REGULAR, FONT_DISPLAY_BOLD } from '../constants/typography';
import { isHighScore } from '../utils/rating';

export interface ShareCardData {
  name: string;
  location: string;
  photoUri: string | null;
  tommyRating: number | null;
  meghanRating: number | null;
}

const CARD_WIDTH = 320;
const CARD_HEIGHT = 400;

// Rendered off-screen and only ever captured as an image (see app/restaurant/[id].tsx) —
// collapsable={false} on the outer View is required on Android or view-shot
// captures a blank image, since Android otherwise flattens/optimizes away
// views it thinks aren't needed for layout. Needs forwardRef since the
// captured ref must point at this component's root View, not a wrapper.
export const ShareCard = forwardRef<View, { data: ShareCardData }>(function ShareCard(
  { data },
  ref
) {
  const flourish = isHighScore(data.tommyRating);

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.photoContainer}>
        {data.photoUri ? (
          <Image source={{ uri: data.photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>🍕</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {data.name}
        </Text>
        {!!data.location && <Text style={styles.location}>{data.location}</Text>}

        <View style={styles.ratingRow}>
          <View style={styles.tommyRatingBlock}>
            <Text style={styles.ratingLabel}>TOMMY'S RATING</Text>
            <Text style={styles.tommyRatingValue}>
              {data.tommyRating !== null ? data.tommyRating.toFixed(1) : '—'}
              {flourish ? ' 🔥' : ''}
            </Text>
          </View>
          <View style={styles.meghanRatingBlock}>
            <Text style={styles.ratingLabelSmall}>MEGHAN'S</Text>
            <Text style={styles.meghanRatingValue}>
              {data.meghanRating !== null ? data.meghanRating.toFixed(1) : '—'}
            </Text>
          </View>
        </View>

        <Text style={styles.watermark}>🍕 Slice Log</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  photoContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT * 0.58,
    backgroundColor: COLORS.creamTint,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderEmoji: {
    fontSize: 72,
  },
  infoContainer: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  name: {
    fontFamily: FONT_DISPLAY_BOLD,
    fontSize: 22,
    color: '#1a1a1a',
  },
  location: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 20,
    marginTop: 12,
  },
  tommyRatingBlock: {
    alignItems: 'flex-start',
  },
  meghanRatingBlock: {
    alignItems: 'flex-start',
  },
  ratingLabel: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 11,
    color: '#999',
    letterSpacing: 0.5,
  },
  ratingLabelSmall: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 10,
    color: '#bbb',
    letterSpacing: 0.5,
  },
  tommyRatingValue: {
    fontFamily: FONT_DISPLAY_BOLD,
    fontSize: 40,
    color: COLORS.tomato,
  },
  meghanRatingValue: {
    fontFamily: FONT_DISPLAY_BOLD,
    fontSize: 24,
    color: COLORS.crust,
  },
  watermark: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 12,
    color: '#aaa',
    marginTop: 12,
  },
});

export { CARD_HEIGHT, CARD_WIDTH };
