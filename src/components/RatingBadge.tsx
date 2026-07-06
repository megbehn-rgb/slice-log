import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { FONT_BODY_BOLD, FONT_DISPLAY_BOLD } from '../constants/typography';
import { isHighScore } from '../utils/rating';

interface RatingBadgeProps {
  label: string;
  value: number | null;
  maxValue: number;
  color: string;
}

export function RatingBadge({ label, value, maxValue, color }: RatingBadgeProps) {
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    scale.setValue(0.5);
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [value, scale]);

  // The flame flourish is scoped to the 0-10 personal ratings (not the
  // 0-5 Google scale, where 9.0 is meaningless).
  const flourish = maxValue === 10 && isHighScore(value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View
        style={[styles.pill, { backgroundColor: color, transform: [{ scale }] }]}
      >
        <Text style={styles.value}>
          {value !== null ? `${value.toFixed(1)} / ${maxValue}` : '—'}
          {flourish ? ' 🔥' : ''}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  value: {
    fontFamily: FONT_DISPLAY_BOLD,
    color: '#fff',
    fontSize: 15,
  },
});
