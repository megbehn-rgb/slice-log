import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { FONT_BODY_SEMIBOLD } from '../constants/typography';
import { formatDateForDisplay, parseDateString, toDateString } from '../utils/date';

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function DateField({ value, onChange }: DateFieldProps) {
  const [showPicker, setShowPicker] = useState(false);

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      onChange(toDateString(selectedDate));
    }
  }

  return (
    <View>
      <Pressable style={styles.button} onPress={() => setShowPicker(true)}>
        <Text style={styles.buttonText}>{formatDateForDisplay(value)}</Text>
      </Pressable>

      {showPicker && (
        <>
          <DateTimePicker
            value={parseDateString(value)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={handleChange}
          />
          {Platform.OS === 'ios' && (
            <Pressable style={styles.doneButton} onPress={() => setShowPicker(false)}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  buttonText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    fontSize: 15,
  },
  doneButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  doneButtonText: {
    fontFamily: FONT_BODY_SEMIBOLD,
    color: COLORS.tomato,
    fontSize: 15,
  },
});
