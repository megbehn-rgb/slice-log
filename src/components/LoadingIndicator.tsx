import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT_BODY_REGULAR } from '../constants/typography';

interface LoadingIndicatorProps {
  message?: string;
}

export function LoadingIndicator({ message }: LoadingIndicatorProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.tomato} />
      {!!message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  message: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 14,
    color: '#999',
  },
});
