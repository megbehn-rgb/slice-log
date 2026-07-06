import { StyleSheet, View } from 'react-native';
import Svg, { Ellipse, Line } from 'react-native-svg';
import { COLORS } from '../constants/colors';

// Used as the FlatList ItemSeparatorComponent on the home list — a small
// charm in place of a plain hairline rule.
export function BasilDivider() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Svg width={16} height={10} viewBox="0 0 16 10" style={styles.leaf}>
        <Ellipse cx={8} cy={5} rx={7} ry={3.5} fill={COLORS.basil} />
        <Line x1={2} y1={5} x2={14} y2={5} stroke="#2f7a3f" strokeWidth={0.6} />
      </Svg>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e2ddd0',
  },
  leaf: {
    marginHorizontal: 6,
  },
});
