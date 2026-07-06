import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT_BODY_BOLD, FONT_DISPLAY_BOLD } from '../constants/typography';
import type { Profile } from '../context/ProfileContext';

interface ProfilePickerProps {
  title: string;
  onSelect: (profile: Profile) => void;
}

export function ProfilePicker({ title, onSelect }: ProfilePickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🍕</Text>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [styles.button, styles.meghanButton, pressed && styles.pressed]}
          onPress={() => onSelect('Meghan')}
        >
          <Text style={styles.buttonText}>Meghan</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.button, styles.tommyButton, pressed && styles.pressed]}
          onPress={() => onSelect('Tommy')}
        >
          <Text style={styles.buttonText}>Tommy</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cream,
    paddingHorizontal: 32,
    gap: 12,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontFamily: FONT_DISPLAY_BOLD,
    fontSize: 22,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 16,
  },
  meghanButton: {
    backgroundColor: COLORS.crust,
  },
  tommyButton: {
    backgroundColor: COLORS.tomato,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  buttonText: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 18,
    color: '#fff',
  },
});
