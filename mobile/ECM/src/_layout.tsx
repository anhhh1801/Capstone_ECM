import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import Loading from './screens/Loading';
import { getToken } from './services/storage';

export default function RootLayout() {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      setLoggedIn(!!token);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return <Loading />;

  return (
    <Stack>
      {loggedIn ? (
        <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
      ) : (
        <Stack.Screen name="Login" options={{ headerShown: false }} />
      )}
    </Stack>
  );
}