import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { router, useSegments } from 'expo-router';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if already authenticated
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return <>{children}</>;
}

function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <AuthGuard>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#F0E7DD' },
              headerTintColor: '#1F1C1A',
              headerTitleStyle: { fontWeight: '700' },
              contentStyle: { backgroundColor: '#FFFAF5' },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="login"
              options={{
                headerShown: false,
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="checkout"
              options={{
                title: 'Checkout',
                headerBackTitle: 'Cart',
              }}
            />
            <Stack.Screen
              name="forgot-password"
              options={{
                title: 'Reset Password',
                presentation: 'modal',
              }}
            />
          </Stack>
          <StatusBar style="dark" />
        </AuthGuard>
      </CartProvider>
    </AuthProvider>
  );
}

export default RootLayout;
