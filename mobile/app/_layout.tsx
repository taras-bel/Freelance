import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts as useInterFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts as useSpaceGroteskFonts, SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Загружаем оба шрифта
  const [interLoaded, interError] = useInterFonts({
    Inter_400Regular,
    Inter_700Bold,
  });
  const [sgLoaded, sgError] = useSpaceGroteskFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
  });
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (interError || sgError) throw interError || sgError;
  }, [interError, sgError]);

  useEffect(() => {
    if (interLoaded && sgLoaded) {
      SplashScreen.hideAsync();
    }
  }, [interLoaded, sgLoaded]);

  useEffect(() => {
    // Проверяем наличие токена при запуске
    const checkToken = async () => {
      const token = await SecureStore.getItemAsync('authToken');
      setIsAuth(!!token);
    };
    checkToken();
  }, []);

  if (!interLoaded || !sgLoaded || isAuth === null) {
    return null;
  }

  return <RootLayoutNav isAuth={isAuth} />;
}

function RootLayoutNav({ isAuth }: { isAuth: boolean }) {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuth ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(tabs)/auth" />
        )}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
