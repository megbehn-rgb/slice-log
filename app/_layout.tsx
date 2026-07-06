import { Fredoka_500Medium, Fredoka_600SemiBold, useFonts } from '@expo-google-fonts/fredoka';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ProfilePicker } from '../src/components/ProfilePicker';
import { COLORS } from '../src/constants/colors';
import { FONT_DISPLAY_BOLD } from '../src/constants/typography';
import { ProfileProvider, useProfile } from '../src/context/ProfileContext';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  if (!fontsLoaded) {
    // Plain system font here on purpose — the custom fonts aren't loaded yet.
    return <LoadingScreen message="Stretching the dough…" />;
  }

  return (
    <ProfileProvider>
      <AppGate />
    </ProfileProvider>
  );
}

function AppGate() {
  const { activeProfile, setActiveProfile, isLoaded } = useProfile();

  if (!isLoaded) {
    return <LoadingScreen message="Setting the table…" />;
  }

  if (!activeProfile) {
    return <ProfilePicker title="Who's using Slice Log?" onSelect={setActiveProfile} />;
  }

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontFamily: FONT_DISPLAY_BOLD, fontSize: 18 },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="add" options={{ title: 'Add Restaurant', presentation: 'modal' }} />
      <Stack.Screen
        name="restaurant/[id]"
        options={{ title: 'Details', animation: 'fade_from_bottom' }}
      />
      <Stack.Screen
        name="switch-profile"
        options={{ title: 'Switch Profile', presentation: 'modal' }}
      />
    </Stack>
  );
}

function LoadingScreen({ message }: { message: string }) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.tomato} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#999',
    fontSize: 14,
  },
});
