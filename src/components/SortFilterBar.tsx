import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS } from '../constants/colors';
import { ORDER_TYPES, PIZZA_STYLE_TAGS } from '../constants/tags';
import { FONT_BODY_BOLD, FONT_BODY_REGULAR, FONT_BODY_SEMIBOLD } from '../constants/typography';
import type { SortOption } from '../types/restaurant';

interface SortFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortOption;
  onSortChange: (value: SortOption) => void;
  tagFilter: string | null;
  onTagFilterChange: (value: string | null) => void;
  orderTypeFilter: string | null;
  onOrderTypeFilterChange: (value: string | null) => void;
}

// Tommy's Rating is the only rating used for sorting — Meghan's is
// display-only, so it intentionally has no corresponding option here.
const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'tommyRatingDesc', label: "Tommy's: High-Low" },
  { value: 'tommyRatingAsc', label: "Tommy's: Low-High" },
  { value: 'visitDateDesc', label: 'Newest' },
  { value: 'visitDateAsc', label: 'Oldest' },
  { value: 'alphabetical', label: 'A–Z' },
];

export function SortFilterBar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  tagFilter,
  onTagFilterChange,
  orderTypeFilter,
  onOrderTypeFilterChange,
}: SortFilterBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or neighborhood"
        value={search}
        onChangeText={onSearchChange}
        clearButtonMode="while-editing"
      />

      <Text style={styles.groupLabel}>Sort</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {SORT_OPTIONS.map((option) => {
          const selected = option.value === sort;
          return (
            <Pressable
              key={option.value}
              style={[styles.chip, selected && styles.chipSelectedSort]}
              onPress={() => onSortChange(option.value)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.groupLabel}>Pizza Style</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        <Pressable
          style={[styles.chip, tagFilter === null && styles.chipSelectedTag]}
          onPress={() => onTagFilterChange(null)}
        >
          <Text style={[styles.chipText, tagFilter === null && styles.chipTextSelected]}>
            All
          </Text>
        </Pressable>
        {PIZZA_STYLE_TAGS.map((tag) => {
          const selected = tag === tagFilter;
          return (
            <Pressable
              key={tag}
              style={[styles.chip, selected && styles.chipSelectedTag]}
              onPress={() => onTagFilterChange(selected ? null : tag)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{tag}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.groupLabel}>Ordered</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        <Pressable
          style={[styles.chip, orderTypeFilter === null && styles.chipSelectedOrderType]}
          onPress={() => onOrderTypeFilterChange(null)}
        >
          <Text style={[styles.chipText, orderTypeFilter === null && styles.chipTextSelected]}>
            All
          </Text>
        </Pressable>
        {ORDER_TYPES.map((orderType) => {
          const selected = orderType === orderTypeFilter;
          return (
            <Pressable
              key={orderType}
              style={[styles.chip, selected && styles.chipSelectedOrderType]}
              onPress={() => onOrderTypeFilterChange(selected ? null : orderType)}
            >
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                {orderType}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 6,
    backgroundColor: '#fff',
  },
  searchInput: {
    fontFamily: FONT_BODY_REGULAR,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 15,
    marginBottom: 6,
  },
  groupLabel: {
    fontFamily: FONT_BODY_BOLD,
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  chipRow: {
    gap: 8,
    paddingBottom: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  // Each filter group gets its own selected-state color so the three rows
  // are distinguishable at a glance, not just by the (easy to miss) label
  // above them: red matches the Tommy's-rating accent used elsewhere for
  // sort, amber for pizza style, blue (reused from the Google/Maps accent)
  // for order type.
  chipSelectedSort: {
    backgroundColor: COLORS.tomato,
  },
  chipSelectedTag: {
    backgroundColor: COLORS.crust,
  },
  chipSelectedOrderType: {
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
