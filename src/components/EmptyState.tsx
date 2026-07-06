import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { COLORS } from '../constants/colors';
import { FONT_BODY_REGULAR, FONT_DISPLAY_BOLD } from '../constants/typography';

function PizzaSliceIllustration() {
  return (
    <Svg width={140} height={140} viewBox="0 0 200 200">
      {/* cheese/slice body */}
      <Path d="M40 48 L100 178 L160 48 Z" fill="#F3D298" />
      {/* crust rim */}
      <Path
        d="M32 46 Q100 6 168 46 L156 62 Q100 30 44 62 Z"
        fill={COLORS.crust}
      />
      {/* sauce peeking under the crust */}
      <Path d="M46 60 L100 168 L154 60 Q100 82 46 60 Z" fill="#E2703A" opacity={0.35} />
      {/* pepperoni */}
      <Circle cx={92} cy={92} r={11} fill={COLORS.tomato} />
      <Circle cx={122} cy={110} r={10} fill={COLORS.tomato} />
      <Circle cx={100} cy={138} r={9} fill={COLORS.tomato} />
      {/* basil leaves */}
      <Ellipse
        cx={75}
        cy={118}
        rx={9}
        ry={5}
        fill={COLORS.basil}
        transform="rotate(-30 75 118)"
      />
      <Ellipse
        cx={128}
        cy={78}
        rx={8}
        ry={4.5}
        fill={COLORS.basil}
        transform="rotate(20 128 78)"
      />
    </Svg>
  );
}

interface EmptyStateProps {
  title: string;
  subtitle: string;
}

export function EmptyState({ title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <PizzaSliceIllustration />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  title: {
    fontFamily: FONT_DISPLAY_BOLD,
    fontSize: 22,
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: FONT_BODY_REGULAR,
    fontSize: 15,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 21,
  },
});
