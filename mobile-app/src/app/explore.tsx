import { Redirect } from 'expo-router';

// Old explore route — redirect to menu
export default function Explore() {
  return <Redirect href="/(tabs)/menu" />;
}
