// (tabs)_layout.tsx
import ThemeToggle from "@/components/ThemeToggle";
import { Link, Tabs } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { SafeAreaProvider } from "react-native-safe-area-context";
import CompanySelector from "../../components/CompanySelector";
function TabBarIcon(props: {
  name: React.ComponentProps<typeof Icon>["name"];
  color: string;
}) {
  return <Icon size={28} style={{ marginBottom: 0 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
          tabBarShowLabel: true,
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? "light"].navBar,
            paddingBottom: 13,
            paddingTop: 2,
            height: 64,
          },
          tabBarLabelStyle: { fontSize: 12, paddingBottom: 2 },
          tabBarItemStyle: { paddingVertical: 6 },
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
          headerShown: true,
          headerRight: () => <CompanySelector />,
          headerStyle: { backgroundColor: Colors[colorScheme ?? "light"].navBar },
          headerTintColor: "#fff",
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
            headerRight: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ThemeToggle />
                <Link href="/modal" asChild>
                  <Pressable>
                    {({ pressed }) => (
                      <Icon
                        name="info"
                        size={25}
                        color="#fff"
                        style={{ marginRight: 8, opacity: pressed ? 0.5 : 1 }}
                      />
                    )}
                  </Pressable>
                </Link>
                <CompanySelector />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="outstanding"
          options={{
            title: "Outstanding",
            tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
            headerRight: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ThemeToggle />
                <CompanySelector />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="stocks"
          options={{
            title: "Stocks",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="archive" color={color} />
            ),
            headerRight: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ThemeToggle />
                <CompanySelector />
              </View>
            ),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
