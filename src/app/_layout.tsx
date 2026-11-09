import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { configureNotifications } from '@/lib/notifications';
import { AreteProvider } from '@/lib/store';
import { useTheme } from '@/lib/theme';

configureNotifications();

type IconName = ComponentProps<typeof Ionicons>['name'];

const icon = (name: IconName) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    // Tab colours are always plain hex strings here (theme.ts).
    return <Ionicons name={name} color={color as string} size={size} />;
  };

export default function RootLayout() {
  const t = useTheme();
  return (
    <AreteProvider>
      <StatusBar style="auto" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: t.accent,
          tabBarInactiveTintColor: t.muted,
          tabBarStyle: { backgroundColor: t.card, borderTopColor: t.border },
          sceneStyle: { backgroundColor: t.bg },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: icon('sunny-outline') }} />
        <Tabs.Screen name="quotes" options={{ title: 'My quotes', tabBarIcon: icon('book-outline') }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('settings-outline') }} />
      </Tabs>
    </AreteProvider>
  );
}
