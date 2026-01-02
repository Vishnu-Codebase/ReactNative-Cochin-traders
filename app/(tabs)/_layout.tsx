import { Link, Tabs } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import CompanySelector from '../../components/CompanySelector';

function TabBarIcon(props: { name: React.ComponentProps<typeof Icon>['name']; color: string }) {
  return <Icon size={28} style={{ marginBottom: -3 }} {...props} />;
}



export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: { backgroundColor: Colors[colorScheme ?? 'light'].tint },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
        headerRight: () => <CompanySelector />,
        headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].tint },
        headerTintColor: '#fff',
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <>
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <Icon name="info" size={25} color="#fff" style={{ marginRight: 8, opacity: pressed ? 0.5 : 1 }} />
                  )}
                </Pressable>
              </Link>
              <CompanySelector />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="outstanding"
        options={{
          title: 'Outstanding',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stocks"
        options={{
          title: 'Stocks',
          tabBarIcon: ({ color }) => <TabBarIcon name="archive" color={color} />,
        }}
      />
    </Tabs>
  );
}
