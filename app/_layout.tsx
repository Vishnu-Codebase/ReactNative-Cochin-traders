// removed FontAwesome; using react-native-vector-icons directly for tabs
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import AnimatedSplash from '@/components/AnimatedSplash';
import ThemeToggle from '@/components/ThemeToggle';
import Colors from '@/constants/Colors';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from '@/context/ThemeContext';

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
    background: Colors.light.background,
    card: Colors.light.card,
    text: Colors.light.text,
    border: Colors.light.border,
    primary: Colors.light.tint,
  },
};

const AppDarkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.dark.background,
    card: Colors.dark.card,
    text: Colors.dark.text,
    border: Colors.dark.border,
    primary: Colors.dark.tint,
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

  return (
    <CustomThemeProvider>
      <RootLayoutNav />
    </CustomThemeProvider>
  );
}

function RootLayoutNav() {
  const [showSplash, setShowSplash] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      // Cleanup legacy storage if needed
      try {
        await AsyncStorage.removeItem('admin_user');
        await AsyncStorage.removeItem('auth_token');
      } catch (e) {
        // Ignore errors
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  return (
    <StackContent showSplash={showSplash} onDone={() => setShowSplash(false)} />
  );
}

function StackContent({ showSplash, onDone }: { showSplash: boolean; onDone: () => void }) {
  const { theme } = useTheme();
  
  return (
    <ThemeProvider value={theme === 'dark' ? AppDarkTheme : LightTheme}>
      {showSplash && <AnimatedSplash onDone={onDone} />}
      <CompanyProvider>
        <CartProvider>
          <Stack screenOptions={{ 
            animation: 'fade', 
            headerStyle: { backgroundColor: Colors[theme].navBar }, 
            headerTintColor: '#fff',
            headerRight: () => <ThemeToggle />
          }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="cart" options={{ title: 'Cart' }} />
          </Stack>
        </CartProvider>
      </CompanyProvider>
    </ThemeProvider>
  );
}
