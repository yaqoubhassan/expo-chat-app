import { Tabs, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function TabLayout() {
  const pathname = usePathname();

  const staticPaths = ['/chats', '/people', '/profile'];

  // Determine if the current path is dynamic
  const isDynamicPath = !staticPaths.includes(pathname) && /^\/[a-zA-Z0-9]+$/.test(pathname);

  // useEffect(() => {
  //   console.log('Current pathname:', pathname); // Log pathname for debugging
  //   console.log('Is dynamic path:', isDynamicPath);
  // }, [pathname]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#32CD32',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: isDynamicPath
          ? { display: 'none' }
          : Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slight transparency for blur effect
              borderTopWidth: 0, // Remove border for clean look
              shadowOpacity: 0, // Remove shadow
              backdropFilter: 'blur(10px)', // Apply blur effect (iOS-only)
            },
            android: {
              backgroundColor: '#ffffff', // Standard background for Android
              elevation: 3, // Add shadow for Android
            },
          }),
      }}
    >
      <Tabs.Screen
        name="(chat)"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialIcons size={28} name="wechat" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          title: 'People',
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialIcons size={28} name="people" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }: { color: string }) => (
            <MaterialIcons size={28} name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
