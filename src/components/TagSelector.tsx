import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { PIZZA_STYLE_TAGS } from '../constants/tags';
import { FONT_BODY_REGULAR, FONT_BODY_SEMIBOLD } from '../constants/typography';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

export function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter((existing) => existing !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  }

  return (
    <View style={styles.row}>
      {PIZZA_STYLE_TAGS.map((tag) => {
        const selected = selectedTags.includes(tag);
        return (
          <Pressable
            key={tag}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => toggleTag(tag)}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{tag}</Text>
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
    backgroundColor: COLORS.crust,
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
