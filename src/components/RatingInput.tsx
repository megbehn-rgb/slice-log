import Slider from '@react-native-community/slider';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT_BODY_REGULAR, FONT_BODY_SEMIBOLD, FONT_DISPLAY_BOLD } from '../constants/typography';

interface RatingInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

const DEFAULT_RATING = 7.0;

function clampAndRound(value: number): number {
  const clamped = Math.min(10, Math.max(0, value));
  return Math.round(clamped * 10) / 10;
}

export function RatingInput({ value, onChange }: RatingInputProps) {
  if (value === null) {
    return (
      <Pressable style={styles.addButton} onPress={() => onChange(DEFAULT_RATING)}>
        <Text style={styles.addButtonText}>+ Add Rating</Text>
      </Pressable>
    );
  }

  return <FilledRatingInput value={value} onChange={onChange} />;
}

function FilledRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number | null) => void;
}) {
  const [text, setText] = useState(value.toFixed(1));

  useEffect(() => {
    if (parseFloat(text) !== value) {
      setText(value.toFixed(1));
    }
    // Only re-sync when the external value changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleSliderChange(sliderValue: number) {
    const rounded = clampAndRound(sliderValue);
    onChange(rounded);
    setText(rounded.toFixed(1));
  }

  function handleTextChange(nextText: string) {
    setText(nextText);
  }

  function handleTextBlur() {
    const parsed = parseFloat(text);
    const finalValue = Number.isFinite(parsed) ? clampAndRound(parsed) : value;
    onChange(finalValue);
    setText(finalValue.toFixed(1));
  }

  return (
    <View>
      <Text style={styles.readout}>{value.toFixed(1)}</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={10}
        step={0.1}
        value={value}
        onValueChange={handleSliderChange}
        minimumTrackTintColor={COLORS.tomato}
        maximumTrackTintColor="#e0e0e0"
        thumbTintColor={COLORS.tomato}
      />
      <View style={styles.textRow}>
        <Text style={styles.textLabel}>Exact value:</Text>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={handleTextChange}
          onBlur={handleTextBlur}
          keyboardType="decimal-pad"
          maxLength={4}
        />
        <Text style={styles.textLabel}>/ 10</Text>
      </View>
      <Pressable style={styles.clearButton} onPress={() => onChange(null)}>
        <Text style={styles.clearButtonText}>Clear rating</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  readout: {
    fontFamily: FONT_DISPLAY_BOLD,
    fontSize: 40,
    textAlign: 'center',
    color: COLORS.tomato,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textLabel: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 14,
    color: '#666',
  },
  textInput: {
    fontFamily: FONT_BODY_REGULAR,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 16,
    minWidth: 56,
    textAlign: 'center',
  },
  clearButton: {
    alignSelf: 'center',
    marginTop: 6,
  },
  clearButtonText: {
    fontFamily: FONT_BODY_REGULAR,
    color: '#999',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    color: '#999',
    fontSize: 15,
  },
});
