// removed FontAwesome; using react-native-vector-icons directly for tabs
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import AnimatedSplash from '@/components/AnimatedSplash';
import { useColorScheme } from '@/components/useColorScheme';
import { CartProvider } from '@/context/CartContext';
import { getEmployeeName, purgeLegacyStorage } from '@/lib/auth';
import { CompanyProvider } from '../context/CompanyContext';

export {
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};
SplashScreen.preventAutoHideAsync();

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    card: '#ffffff',
    text: '#000000',
    border: '#cccccc',
    primary: '#2563eb',
  },
};

const AppDarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#ffffff',
    card: '#ffffff',
    text: '#000000',
    border: '#cccccc',
    primary: '#2563eb',
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const [gateDone, setGateDone] = useState(false);
  
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      await purgeLegacyStorage();
      // Ensure splash is visible for 3 seconds on app open
      setShowSplash(true);
      setTimeout(async () => {
        if (!mounted) return;
        setGateDone(true);
        const name = await getEmployeeName();
        if (name) {
          setShowSplash(false);
        } else {
          setShowSplash(true);
        }
      }, 3000);
    };
    init();
    // Watch for forced splash requests from other screens
    const timer = setInterval(async () => {
      if (!mounted) return;
      if (!gateDone) return;
      const flag = await AsyncStorage.getItem('force_splash');
      const name = await getEmployeeName();
      if (flag === '1') {
        await AsyncStorage.removeItem('force_splash');
        setShowSplash(true);
        return;
      }
      if (!name) {
        setShowSplash(true);
      } else {
        setShowSplash(false);
      }
    }, 500);
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  return (
    <ThemeProvider value={LightTheme}>
      {showSplash && <AnimatedSplash onDone={() => setShowSplash(false)} />}
      <CompanyProvider>
        <CartProvider>
          <Stack screenOptions={{ animation: 'fade', headerStyle: { backgroundColor: '#2563eb' }, headerTintColor: '#fff' }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="Companies List" options={{ presentation: 'modal' }} />
            <Stack.Screen name="cart" options={{ title: 'Cart' }} />
          </Stack>
        </CartProvider>
      </CompanyProvider>
    </ThemeProvider>
  );
}
