import { Redirect } from 'expo-router';

// Root redirects to tabs — AuthGuard in _layout.tsx handles unauthenticated users
export default function Index() {
  return <Redirect href="/(tabs)" />;
}
