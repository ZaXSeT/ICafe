import type { CapacitorConfig } from '@capacitor/cli';

/**
 * ICafe Customer App
 * - App ID: com.icafe.customer
 * - Loads the main website for customers (menu, ordering, reservations)
 */
const config: CapacitorConfig = {
  appId: 'com.icafe.customer',
  appName: 'ICafe',
  webDir: 'public',
  server: {
    // IMPORTANT: Ganti URL ini dengan domain live Anda
    url: 'https://icafe-demo.vercel.app/app',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#FFFAF5',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#FFFAF5',
    },
  },
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
