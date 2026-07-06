import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { ORDER_TYPES } from '../constants/tags';
import { FONT_BODY_REGULAR, FONT_BODY_SEMIBOLD } from '../constants/typography';

interface OrderTypeSelectorProps {
  selectedOrderTypes: string[];
  onChange: (orderTypes: string[]) => void;
}

export function OrderTypeSelector({ selectedOrderTypes, onChange }: OrderTypeSelectorProps) {
  function toggleOrderType(orderType: string) {
    if (selectedOrderTypes.includes(orderType)) {
      onChange(selectedOrderTypes.filter((existing) => existing !== orderType));
    } else {
      onChange([...selectedOrderTypes, orderType]);
    }
  }

  return (
    <View style={styles.row}>
      {ORDER_TYPES.map((orderType) => {
        const selected = selectedOrderTypes.includes(orderType);
        return (
          <Pressable
            key={orderType}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => toggleOrderType(orderType)}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {orderType}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  chipSelected: {
    backgroundColor: COLORS.googleBlue,
  },
  chipText: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 13,
    color: '#333',
  },
  chipTextSelected: {
    fontFamily: FONT_BODY_SEMIBOLD,
    color: '#fff',
  },
});
