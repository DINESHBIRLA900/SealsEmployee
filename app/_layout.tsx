import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import '../src/i18n/i18n'; // Ensure i18n is initialized

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  useEffect(() => {
    checkAppLaunch();
  }, []);

  const checkAppLaunch = async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const isMpinSet = await SecureStore.getItemAsync('isMpinSet');

      if (token) {
        if (isMpinSet === 'true') {
          router.replace('/(auth)/mpin-login');
        } else {
          // Should have been set during login, but as fallback
          router.replace('/(auth)/set-mpin');
        }
      } else {
        router.replace('/(auth)/login');
      }
    } catch (e) {
      router.replace('/(auth)/login');
    }
  };

  // Remove the segment-based redirection for now to avoid loops with the new flow
  // or keep it simple for unauthenticated access protection
  useEffect(() => {
    // Optional: Protect routes if token is removed while app is open
    // but for now, rely on initial check
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/mpin-login" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/set-mpin" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="attendance" options={{ headerShown: false }} />
        <Stack.Screen name="attendance/work-approval" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
