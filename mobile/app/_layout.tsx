import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { useEffect } from 'react';
import './global.css';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/src/context/auth-context';
import { initializeSync } from '@/src/services/sync';
import NetworkBanner from '@/src/components/network-banner';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootContent() {
  const { isLoading } = useAuth();

  useEffect(() => {
    const cleanup = initializeSync();
    return cleanup;
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-surface-dark">
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="add-product" options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="add-warehouse" options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="add-category" options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="stock-movement" options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="categories" options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }} />
        <Stack.Screen name="category/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="warehouses" options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }} />
      <Stack.Screen name="scan-barcode" options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }} />
    </Stack>
      <NetworkBanner />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <RootContent />
      </AuthProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
