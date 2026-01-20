// _layout.tsx
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import AnimatedSplash from "@/components/AnimatedSplash";
import CompanySelector from "@/components/CompanySelector";
import { View } from "@/components/Themed";
import ThemeToggle from "@/components/ThemeToggle";
import Colors from "@/constants/Colors";
import { CartProvider } from "@/context/CartContext";
import { CompanyProvider } from "@/context/CompanyContext";
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from "@/context/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

export { ErrorBoundary } from "expo-router";

// Prevent native splash from auto-hiding
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

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
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Hide native splash as soon as fonts are loaded
      // This allows AnimatedSplash to show immediately
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null; // Native splash is still showing
  }

  return (
    <CustomThemeProvider>
      <RootLayoutNav />
    </CustomThemeProvider>
  );
}

function RootLayoutNav() {
  const [showSplash, setShowSplash] = useState(true);
  const appState = useRef(AppState.currentState);
  const splashTimerRef = useRef<number | null>(null);

  const hideSplash = async () => {
    try {
      const employeeName = await AsyncStorage.getItem("employee_name");
    } catch (e) {
      console.log("Error reading AsyncStorage");
    }
    setShowSplash(false);
  };

  useEffect(() => {
    // Show splash initially for 3 seconds
    splashTimerRef.current = setTimeout(hideSplash, 3000) as unknown as number;

    // Listen for app state changes
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // console.log(
      //   "App state changed from",
      //   appState.current,
      //   "to",
      //   nextAppState,
      // );

      // When app comes to foreground from background/inactive
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        console.log("App has come to the foreground - showing splash");

        // Clear any existing timer
        if (splashTimerRef.current !== null) {
          clearTimeout(splashTimerRef.current);
        }

        // Show splash screen again
        setShowSplash(true);

        // Hide it after 3 seconds
        splashTimerRef.current = setTimeout(
          hideSplash,
          3000,
        ) as unknown as number;
      }

      appState.current = nextAppState;
    });

    return () => {
      if (splashTimerRef.current !== null) {
        clearTimeout(splashTimerRef.current);
      }
      subscription.remove();
    };
  }, []);

  return <StackContent showSplash={showSplash} />;
}

function StackContent({ showSplash }: { showSplash: boolean }) {
  const { theme } = useTheme();

  return (
    <ThemeProvider value={theme === "dark" ? AppDarkTheme : LightTheme}>
      {showSplash ? (
        <AnimatedSplash />
      ) : (
        <CompanyProvider>
          <CartProvider>
            <Stack
              screenOptions={{
                animation: "fade",
                headerStyle: { backgroundColor: Colors[theme].navBar },
                headerTintColor: "#fff",
                headerRight: () => (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ThemeToggle />
                    <CompanySelector />
                  </View>
                ),
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="cart" options={{ title: "Cart" }} />
              <Stack.Screen name="modal" options={{ presentation: "modal" }} />
              <Stack.Screen name="parties" options={{ title: "Parties" }} />
              <Stack.Screen name="ledgers" options={{ title: "Ledgers" }} />
            </Stack>
          </CartProvider>
        </CompanyProvider>
      )}
    </ThemeProvider>
  );
}
