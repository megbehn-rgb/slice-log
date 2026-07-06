import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { COLORS } from '../../src/constants/colors';
import { FONT_BODY_SEMIBOLD, FONT_DISPLAY_BOLD } from '../../src/constants/typography';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.tomato,
        headerTitleStyle: { fontFamily: FONT_DISPLAY_BOLD, fontSize: 18 },
        tabBarLabelStyle: { fontFamily: FONT_BODY_SEMIBOLD },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Slice Log',
          tabBarLabel: 'List',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
