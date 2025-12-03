import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import Loading from '@/app/screens/utils/Loading';
import { AuthProvider, useAuth } from '@/app/src/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const { loading, isLoggedIn } = useAuth();

  // Show loading/splash screen while checking authentication
  if (loading) {
    return <Loading />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            {/* Authentication Stack */}
            <Stack.Screen name="screens/utils/Login" options={{ headerShown: false }} />
            <Stack.Screen name="screens/utils/Register" options={{ headerShown: false }} />
          </>
        ) : (
          <>
            {/* App Stack */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
